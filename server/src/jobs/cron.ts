import cron from "node-cron";
import Notification from "@/utils/notification.helper.js";
import Contract from "@/models/Contract.model.js";
import Application from "@/models/Application.model.js";
import User from "@/models/User.model.js";
import { getIo } from "@/services/socket.service.js";

export const initCronJobs = () => {
  // ─── 1. Clean old notifications (existing) ───────────────────────────────
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily cron job to clean up old notifications...");
    try {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const result = await Notification.deleteMany({
        createdAt: { $lt: fiveDaysAgo },
      });

      console.log(`Successfully deleted ${result.deletedCount} old notifications.`);
    } catch (error) {
      console.error("Error deleting old notifications:", error);
    }
  });

  // ─── 2. Auto-expire Fixed-Term contracts whose endDate has passed ────────
  cron.schedule("0 0 * * *", async () => {
    console.log("[Cron] Checking for expired Fixed-Term contracts...");
    try {
      const now = new Date();

      const expired = await Contract.find({
        status: "Accepted",
        contractType: "Fixed-Term",
        endDate: { $ne: null, $lte: now },
      });

      if (expired.length === 0) {
        console.log("[Cron] No expired contracts found.");
        return;
      }

      console.log(`[Cron] Found ${expired.length} expired contract(s). Flipping status...`);

      for (const contract of expired) {
        contract.status = "Contract Ended";
        contract.workExperience.exitStatus = "Contract Ended";
        contract.workExperience.endDate = contract.endDate ?? now;
        await contract.save();

        await Application.findByIdAndUpdate(contract.application, {
          status: "Terminated",
          terminatedAt: now,
        });

        const application = await Application.findById(contract.application);
        if (application?.experienceRef) {
          await User.updateOne(
            { _id: contract.employee, "experiences._id": application.experienceRef },
            {
              $set: {
                "experiences.$.endDate": contract.endDate ?? now,
                "experiences.$.current": false,
              },
            },
          );
        }

        try {
          const notif = await Notification.create({
            recipient: contract.employee,
            type: "APPLICATION",
            title: "Contract Expired",
            message:
              `Your Fixed-Term contract has expired on ` +
              `${(contract.endDate ?? now).toISOString().split("T")[0]} ` +
              `and has been marked as "Contract Ended".`,
            reference: contract._id,
          });
          try {
            getIo().to(String(contract.employee)).emit("receiveNotification", notif);
          } catch (_) {
            // Socket may not be connected
          }
        } catch (e) {
          console.error("[Cron] Notification error for contract", contract._id, e);
        }
      }

      console.log(`[Cron] Successfully processed ${expired.length} expired contract(s).`);
    } catch (error) {
      console.error("[Cron] Error processing expired contracts:", error);
    }
  });

  console.log("Cron jobs initialized successfully");
};
