const { checkAndSendAutoReply } = require("../utils/autoReplyHelper");

const autoReplyMiddleware = async (req, res, next) => {
    // This middleware runs AFTER the message controller sends the response
    // We hook into res.on('finish') or just call it asynchronously

    // However, standard middleware runs BEFORE controller. 
    // To run AFTER, we can just call the helper in the controller, OR
    // use this middleware to attach a hook.

    // Better approach for "intercept":
    // If we want to block the message, we do it before.
    // But auto-reply is usually a REACTION.

    // Let's make it a function that we call *after* successful send in the controller.
    // But the user asked for "Express middleware function that intercepts".
    // If "intercept" means "check before sending", that's one thing.
    // But "if recipient is offline... send auto-reply" implies the original message MIGHT still go through, 
    // or maybe it's just about the reply.

    // Interpretation: The original message is sent. The system *also* sends an auto-reply if needed.
    // So I will attach a listener to the response finish event.

    res.on("finish", async () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
            // Assuming req.body contains message details and req.user is sender
            // This depends on how the message route is structured.
            // Usually POST /api/messages

            try {
                const { recipientId, content, conversationId } = req.body;
                const senderId = req.user._id;

                if (recipientId && content && conversationId) {
                    // We need the IO instance. It might be attached to req or app.
                    const io = req.app.get("io");
                    await checkAndSendAutoReply(recipientId, senderId, content, conversationId, io);
                }
            } catch (err) {
                console.error("Auto-reply middleware error:", err);
            }
        }
    });

    next();
};

module.exports = { autoReplyMiddleware };
