const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { createNotification } = require("./notificationController");

/**
 * @desc    Get all messages for a specific conversation
 * @route   GET /api/messages/:conversationId
 * @access  Private
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate("sender", "fullName avatar role")
      .sort({ createdAt: "asc" }); // Show messages in order

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id;

    // 1. Create and save the message
    const newMessage = await Message.create({
      conversationId,
      sender: senderId,
      content,
    });

    // 2. Update the conversation's lastMessage
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: {
          text: content,
          sender: senderId,
          sentAt: Date.now(),
        },
      },
      { new: true },
    )
      .populate("participants", "fullName role")
      .populate("job"); // Populate job to check for job-specific settings

    // 3. Create Notification for the recipient
    const recipient = conversation.participants.find(
      (p) => p._id.toString() !== senderId.toString(),
    );

    if (recipient) {
      await createNotification(
        recipient._id,
        "MESSAGE",
        "New Message",
        `You have a new message from ${req.user.fullName || "a user"}`,
        conversationId,
      );

      // --- AUTO-REPLY LOGIC ---
      // Check if recipient is an employer
      if (recipient.role === "employer") {
        const JobFAQ = require("../models/JobFAQ");
        const EmployerSettings = require("../models/EmployerSettings");

        let autoReplySent = false;

        // 1. Check for FAQ Keyword Match (Highest Priority)
        // Fetch all FAQs for this employer
        const faqs = await JobFAQ.find({ employer: recipient._id });
        const lowerContent = content.toLowerCase();

        console.log(
          `[AutoReply] Checking message: "${content}" from sender ${senderId} to employer ${recipient._id}`,
        );
        console.log(
          `[AutoReply] Found ${faqs.length} total FAQs for this employer.`,
        );

        // Find a matching FAQ
        // We prioritize job-specific FAQs if they exist and match the current job
        let matchedFAQ = null;

        // Filter FAQs relevant to this context (Global or Specific Job)
        const relevantFaqs = faqs.filter((faq) => {
          // 1. Global FAQ (no job assigned) -> Always relevant
          if (!faq.job) return true;

          // 2. Job-Specific FAQ
          // Must match the current conversation's job
          if (conversation.job) {
            const conversationJobId = conversation.job._id
              ? conversation.job._id.toString()
              : conversation.job.toString();

            const faqJobId = faq.job.toString();

            return conversationJobId === faqJobId;
          }

          // 3. If conversation has no job, Job-Specific FAQs are NOT relevant
          return false;
        });

        console.log(
          `[AutoReply] Found ${relevantFaqs.length} relevant FAQs after filtering.`,
        );

        for (const faq of relevantFaqs) {
          console.log(
            `[AutoReply] Checking FAQ: "${faq.question}" (Job: ${faq.job || "Global"})`,
          );

          // Check if message matches the FAQ question
          if (
            lowerContent === faq.question.toLowerCase() ||
            lowerContent.includes(faq.question.toLowerCase())
          ) {
            console.log(`[AutoReply] MATCH FOUND! FAQ: "${faq.question}"`);
            matchedFAQ = faq;
            break;
          }
        }

        if (matchedFAQ) {
          const replyMessage = await Message.create({
            conversationId,
            sender: recipient._id,
            content: `[Auto-Reply] ${matchedFAQ.answer}`,
          });

          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
              text: `[Auto-Reply] ${matchedFAQ.answer}`,
              sender: recipient._id,
              sentAt: Date.now(),
            },
          });
          autoReplySent = true;
        }

        // 2. Check for "Out of Office" / Business Hours (Lower Priority)
        // Only if NO FAQ was matched
        if (!autoReplySent) {
          const settings = await EmployerSettings.findOne({
            user: recipient._id,
          });

          if (settings && settings.businessHours) {
            const now = new Date();
            const days = [
              "sunday",
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
            ];
            const currentDay = days[now.getDay()];
            const daySettings = settings.businessHours[currentDay];

            let isOffline = true;

            if (daySettings && daySettings.isOpen) {
              const currentHour = now.getHours();
              const currentMinute = now.getMinutes();
              const currentTimeValue = currentHour * 60 + currentMinute;

              const [startHour, startMinute] = daySettings.start
                .split(":")
                .map(Number);
              const [endHour, endMinute] = daySettings.end
                .split(":")
                .map(Number);
              const startTimeValue = startHour * 60 + startMinute;
              const endTimeValue = endHour * 60 + endMinute;

              if (
                currentTimeValue >= startTimeValue &&
                currentTimeValue < endTimeValue
              ) {
                isOffline = false;
              }
            }

            if (isOffline) {
              let replyContent = "";

              // Check Job-specific message
              if (conversation.job && conversation.job.autoReplyMessage) {
                replyContent = conversation.job.autoReplyMessage;
              }
              // Fallback to Global Employer Settings message
              else if (settings.autoReplyMessage) {
                replyContent = settings.autoReplyMessage;
              }

              if (replyContent) {
                const replyMessage = await Message.create({
                  conversationId,
                  sender: recipient._id,
                  content: `[Auto-Reply] ${replyContent}`,
                });

                await Conversation.findByIdAndUpdate(conversationId, {
                  lastMessage: {
                    text: `[Auto-Reply] ${replyContent}`,
                    sender: recipient._id,
                    sentAt: Date.now(),
                  },
                });
              }
            }
          }
        }
      }
      // --- END AUTO-REPLY LOGIC ---
    }

    // 4. Return the populated message
    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "fullName avatar",
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
