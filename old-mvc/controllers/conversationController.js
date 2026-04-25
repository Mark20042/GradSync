const Conversation = require("../models/Conversation");
const Job = require("../models/Job"); // We need the Job model to find the employer

/**
 * @desc    Find or create a conversation about a specific job
 * @route   POST /api/conversations
 * @access  Private (for Graduates and Employers)
 * @body    { "jobId": "...", "applicantId": "..." (optional, for employers) }
 */
exports.findOrCreateConversation = async (req, res) => {
  const { jobId, applicantId } = req.body;
  const userId = req.user.id;

  try {
    // 1. Validate Input
    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    // 2. Determine Participants
    let participants = [];
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (req.user.role === 'employer') {
      // Employer initiating/finding chat with applicant
      if (!applicantId) return res.status(400).json({ message: "Applicant ID required for employers" });
      participants = [userId, applicantId].sort();
    } else {
      // Graduate initiating/finding chat with employer
      participants = [userId, job.company].sort();
    }

    // 3. Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: participants },
      job: jobId
    });

    // 4. Create if not exists
    if (!conversation) {
      conversation = new Conversation({
        participants,
        job: jobId
      });
      await conversation.save();
    }

    // 5. Return populated conversation
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "fullName avatar role companyName companyLogo")
      .populate("job", "title");

    res.status(200).json(populatedConversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * @desc    Get all conversations for the logged-in user
 * @route   GET /api/conversations
 * @access  Private
 *
 * Gets a list of all chats (classified by job) for the user.
 */
exports.getConversationsForUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "fullName avatar role companyName companyLogo") // Get info on who is in the chat
      .populate("job", "title") // Get the job title
      .sort({ updatedAt: -1 }); // Show most recent chats first

    // Clean up the data for the frontend
    const formattedConversations = conversations.map((convo) => {
      // Find the *other* person in the chat
      const recipient = convo.participants.find(
        (p) => p._id.toString() !== userId
      );
      return {
        _id: convo._id,
        recipient: recipient,
        job: convo.job,
        lastMessage: convo.lastMessage,
        updatedAt: convo.updatedAt,
      };
    });

    res.status(200).json(formattedConversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
