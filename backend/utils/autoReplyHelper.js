const EmployerSettings = require("../models/EmployerSettings");
const JobFAQ = require("../models/JobFAQ");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { toZonedTime, format } = require("date-fns-tz");

const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const checkAndSendAutoReply = async (recipientId, senderId, messageContent, conversationId, io) => {
    try {
        // 1. Check if recipient has settings
        const settings = await EmployerSettings.findOne({ user: recipientId });
        if (!settings) return; // No settings, assume online or no auto-reply needed

        // 2. Check for FAQ match FIRST (FAQs should work 24/7)
        const faqs = await JobFAQ.find({ employer: recipientId });
        console.log(`[AutoReply] Checking FAQs for recipient ${recipientId}. Found ${faqs.length} FAQs.`);

        let autoReplyContent = null;
        let isFaqMatch = false;

        const lowerContent = messageContent.toLowerCase();
        console.log(`[AutoReply] Message content: "${lowerContent}"`);

        for (const faq of faqs) {
            console.log(`[AutoReply] Checking FAQ question: "${faq.question}"`);

            const questionLower = faq.question.toLowerCase();

            // More strict matching logic:
            // 1. Extract significant words (3+ characters) from both message and question
            const messageWords = lowerContent.split(/\s+/).filter(word => word.length >= 3);
            const questionWords = questionLower.split(/\s+/).filter(word => word.length >= 3);

            // 2. Check for meaningful overlap
            // Message must contain at least 2 significant words OR be a substantial question itself
            let match = false;

            if (messageWords.length >= 2) {
                // Count how many significant words from the question appear in the message
                const matchingWords = questionWords.filter(qWord =>
                    messageWords.some(mWord => mWord.includes(qWord) || qWord.includes(mWord))
                );

                // Require at least 50% of question keywords to match
                const matchRatio = matchingWords.length / Math.max(questionWords.length, 1);
                match = matchRatio >= 0.5 && matchingWords.length >= 2;
            }

            // Also check if message is very similar to the full question (80%+ similarity)
            if (!match && lowerContent.length >= 10) {
                const exactMatch = lowerContent.includes(questionLower) || questionLower.includes(lowerContent);
                // Only allow reverse match if message is substantial
                match = exactMatch && lowerContent.length >= questionLower.length * 0.5;
            }

            console.log(`   - Question match? ${match}`);

            if (match) {
                autoReplyContent = faq.answer;
                isFaqMatch = true;
                console.log(`[AutoReply] Match found! Answer: "${autoReplyContent}"`);
                break; // Use the first match
            }
        }

        // 3. If no FAQ match, check if "offline" for generic auto-reply
        if (!isFaqMatch) {
            const timeZone = "Asia/Manila"; // Always use Philippine time
            const now = new Date();
            const zonedDate = toZonedTime(now, timeZone);
            const dayName = daysOfWeek[zonedDate.getDay()];
            const currentTime = format(zonedDate, "HH:mm", { timeZone });

            console.log(`[AutoReply] Checking offline status:`);
            console.log(`   - Timezone: ${timeZone}`);
            console.log(`   - Current day: ${dayName}`);
            console.log(`   - Current time: ${currentTime}`);

            const todayHours = settings.businessHours?.[dayName];
            console.log(`   - Today's hours:`, todayHours);

            let isOffline = true; // Default to offline if no settings

            if (todayHours) {
                if (!todayHours.isOpen) {
                    isOffline = true;
                    console.log(`   - Day is marked as CLOSED`);
                } else {
                    isOffline = currentTime < todayHours.start || currentTime > todayHours.end;
                    console.log(`   - Business hours: ${todayHours.start} - ${todayHours.end}`);
                    console.log(`   - Is offline? ${isOffline}`);
                }
            } else {
                console.log(`   - No business hours set for ${dayName}, defaulting to offline`);
            }

            if (isOffline && settings.autoReplyMessage) {
                autoReplyContent = settings.autoReplyMessage;
                console.log(`[AutoReply] Sending offline message: "${autoReplyContent}"`);
            }
        }

        // 4. If we have content (either FAQ or Offline), send it
        if (!autoReplyContent) return;

        // 5. Send Auto-Reply
        // Create message in DB
        const autoReply = new Message({
            conversationId,
            sender: recipientId, // Sent BY the employer (auto)
            content: `[Auto-Reply] ${autoReplyContent}`,
            isAutoReply: true
        });
        const savedReply = await autoReply.save();

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
                text: `[Auto-Reply] ${autoReplyContent}`,
                sender: recipientId,
                sentAt: new Date(),
            },
        });

        // Emit via Socket.io if provided
        if (io) {
            const populatedReply = await Message.findById(savedReply._id).populate("sender", "fullName avatar");
            io.to(senderId).emit("receiveMessage", populatedReply);
        }

        return savedReply;

    } catch (error) {
        console.error("Auto-reply error:", error);
    }
};

module.exports = { checkAndSendAutoReply };
