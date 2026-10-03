import mongoose from "mongoose";
import { env } from "../config/environment.js";
import Interview from "../models/Interview.model.js";
import User from "../models/User.model.js";
import nodemailer from "nodemailer";

const getTransporter = () => {
  return nodemailer.createTransport({
    service: env.EMAIL_SERVICE || "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  });
};

const sendCorrectionEmail = async (userEmail: string, userName: string, roleName: string, oldScore: number, newScore: number) => {
  const trans = getTransporter();
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #0f172a; margin-top: 0;">Important Update Regarding Your Interview Results </h2>
      <p style="color: #475569; line-height: 1.6;">Dear ${userName},</p>
      <p style="color: #475569; line-height: 1.6;">We are writing to sincerely apologize for a miscalculation in your recent AI mock interview evaluation for the <strong>${roleName}</strong> role. Sorry naman po :< </p>
      <p style="color: #475569; line-height: 1.6;">Due to a bug in our system, your overall score was incorrectly reported as <strong style="color: #dc2626;">${oldScore}%</strong>.</p>
      <p style="color: #475569; line-height: 1.6;">We have successfully recalculated your results based on your individual question scores. Your true overall score is <strong style="color: #16a34a;">${newScore}%</strong>.</p>
      <p style="color: #475569; line-height: 1.6;">Your profile has been updated to reflect the correct score. We apologize for any confusion or inconvenience this may have caused and are taking steps to ensure this does not happen again.</p>
      <br/>
      <p style="color: #475569; line-height: 1.6; margin-bottom: 0;">Best regards,</p>
      <p style="color: #0f172a; font-weight: 600; margin-top: 5px;">The SipaCareer Team</p>
    </div>
  `;

  await trans.sendMail({
    from: env.EMAIL_FROM || `"SipaCareer" <${env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Correction: Your Updated Interview Results",
    html
  });
};

const run = async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(env.MONGO_URI as string);
    console.log("Connected to MongoDB.");
    
    // Explicitly reference User so mongoose registers the schema before populating
    const u = User;
    
    const interviews = await Interview.find({ status: "evaluated" }).populate("candidateId");
    console.log(`Found ${interviews.length} evaluated interviews.`);
    
    let fixedCount = 0;
    
    for (const interview of interviews) {
      if (!interview.answers || interview.answers.length === 0) continue;
      
      const totalScore = interview.answers.reduce((sum: number, ans: any) => sum + (typeof ans.score === 'number' ? ans.score : 0), 0);
      const calculatedAvg = Math.round(totalScore / interview.answers.length);
      
      if (calculatedAvg !== interview.aiScore) {
        console.log(`[Interview ${interview._id}] Incorrect Score Detected! Old: ${interview.aiScore}% -> New: ${calculatedAvg}%`);
        
        const oldScore = interview.aiScore;
        interview.aiScore = calculatedAvg;
        if (interview.aiFeedback) {
          interview.aiFeedback.overallScore = calculatedAvg;
        }
        
        await interview.save();
        console.log(`✅ Updated interview record.`);
        
        const user = interview.candidateId as any;
        if (user && user.email) {
          let roleNameForDisplay = interview.roleName;
          if (mongoose.isValidObjectId(roleNameForDisplay)) {
             roleNameForDisplay = "Tailored Interview";
          }
          await sendCorrectionEmail(user.email, user.fullName || "Candidate", roleNameForDisplay, oldScore, calculatedAvg);
          console.log(`📧 Sent correction email to ${user.email}`);
        } else {
          console.log(`⚠️ Could not send email. User not found for interview ${interview._id}`);
        }
        fixedCount++;
      }
    }
    
    console.log(`\n🎉 Process complete. Fixed ${fixedCount} interviews.`);
    process.exit(0);
  } catch (err) {
    console.error("Fatal Error:", err);
    process.exit(1);
  }
}

run();
