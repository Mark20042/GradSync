import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import { generateTokens } from "@/utils/generateToken.js";
import { env } from "@/config/environment.js";
import User from "@/models/User.model.js";
import SystemSettings from "@/models/SystemSettings.model.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from "@/services/cloudinary.service.js";
import { verifyDocument } from "@/utils/ocr.service.js";
import {
  sendVerificationSuccessEmail,
  sendVerificationFailedEmail,
  sendForgotPasswordEmail,
} from "@/utils/email.service.js";
import Otp from "@/models/Otp.model.js";
import { autoGenerateForUser } from "@/services/generation.service.js";
import fs from "fs";
import path from "path";
import os from "os";
import bcrypt from "bcrypt";

/**
 * Helper: write buffer to a temp file for OCR processing
 * (OCR service needs a file path, not a buffer)
 */
const bufferToTempFile = (buffer: Buffer, originalname: string): string => {
  const tempPath = path.join(os.tmpdir(), `ocr-${Date.now()}-${originalname}`);
  fs.writeFileSync(tempPath, buffer);
  return tempPath;
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, middleName, lastName, email, password, role, degree, companyName } = req.body;
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

    const userExists = await User.findOne({ email });
    if (userExists) throw new BadRequestError("User already exists");

    let avatarUrl = "";
    let torUrl = "";
    let businessPermitUrl = "";

    // Upload files to Cloudinary
    if ((req as any).files) {
      const files = (req as any).files;
      if (files.avatar && files.avatar[0]) {
        const result = await uploadToCloudinary(
          files.avatar[0].buffer,
          "gradsync/avatars",
          "image",
          files.avatar[0].originalname,
        );
        avatarUrl = result.url;
      }
      if (files.tor && files.tor[0]) {
        const result = await uploadToCloudinary(
          files.tor[0].buffer,
          "gradsync/documents",
          "image",
          files.tor[0].originalname,
        );
        torUrl = result.url;
      }
      if (files.businessPermit && files.businessPermit[0]) {
        const result = await uploadToCloudinary(
          files.businessPermit[0].buffer,
          "gradsync/documents",
          "image",
          files.businessPermit[0].originalname,
        );
        businessPermitUrl = result.url;
      }
    }

    const isEmployer = role === "employer";
    const isJobSeeker = role === "jobseeker";
    const isGraduate = role === "graduate";

    let aiTokens = 0;
    try {
      const settings = await SystemSettings.findOne();
      if (settings && settings.initialTokens) {
        if (isJobSeeker) aiTokens = settings.initialTokens.jobseeker;
        else if (isEmployer) aiTokens = settings.initialTokens.employer;
        else if (isGraduate) aiTokens = settings.initialTokens.graduate;
      } else {
        // Fallbacks if not set
        if (isJobSeeker) aiTokens = 5;
        else if (isEmployer) aiTokens = 5;
        else if (isGraduate) aiTokens = 5;
      }
    } catch (err) {
      console.error("Failed to fetch SystemSettings for tokens", err);
      if (isJobSeeker) aiTokens = 5;
      else if (isEmployer) aiTokens = 5;
      else if (isGraduate) aiTokens = 5;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      firstName,
      middleName,
      lastName,
      fullName,
      email,
      password: hashedPassword,
      role,
      degree,
      companyName,
      avatar: avatarUrl,
      companyLogo: isEmployer ? avatarUrl : "",
      tor: torUrl,
      businessPermit: businessPermitUrl,
      verified: isJobSeeker ? true : false,
      verificationStatus: isJobSeeker ? "verified" : "pending",
      verificationMessage: isJobSeeker ? "Job Seeker account created successfully." : "Your document is currently being reviewed.",
      aiTokens,
    });
    await user.save();

    // Background OCR Processing
    const runBackgroundVerification = async () => {
      if (isJobSeeker) return;
      try {
        let ocrResult = { verified: false, message: "No document uploaded." };

        if (
          isEmployer &&
          (req as any).files &&
          (req as any).files.businessPermit
        ) {
          const file = (req as any).files.businessPermit[0];
          const tempPath = bufferToTempFile(file.buffer, file.originalname);
          console.log(
            `🔍 Running OCR verification on Business Permit for ${fullName}... (${file.originalname})`,
          );
          ocrResult = await verifyDocument(tempPath, "businessPermit");
          fs.unlinkSync(tempPath); // cleanup temp file
        } else if (
          !isEmployer &&
          (req as any).files &&
          (req as any).files.tor
        ) {
          const file = (req as any).files.tor[0];
          const tempPath = bufferToTempFile(file.buffer, file.originalname);
          console.log(
            `🔍 Running OCR verification on TOR for ${fullName}... (${file.originalname})`,
          );
          ocrResult = await verifyDocument(tempPath, "tor");
          fs.unlinkSync(tempPath);
        }

        console.log(`📄 OCR Result for ${fullName}:`, ocrResult);

        if (ocrResult.verified) {
          user.verified = true;
          user.verificationStatus = "verified";
          user.verificationMessage = ocrResult.message;

          // Automatically delete documents from Cloudinary after verification
          const cleanups: Promise<void>[] = [];
          if (torUrl) {
            const pid = getPublicIdFromUrl(torUrl);
            if (pid) cleanups.push(deleteFromCloudinary(pid, "image"));
          }
          if (businessPermitUrl) {
            const pid = getPublicIdFromUrl(businessPermitUrl);
            if (pid) cleanups.push(deleteFromCloudinary(pid, "image"));
          }
          await Promise.allSettled(cleanups);

          // Remove the references from the database
          user.tor = "";
          user.businessPermit = "";

          await (user as any).save();
          sendVerificationSuccessEmail(
            user.email,
            user.fullName,
            user.role,
          ).catch((err) => console.error(err));
        } else {
          console.log(`🗑️ OCR Failed. Deleting unverified user: ${user.email}`);
          // Delete ALL uploaded files from Cloudinary
          const cleanups: Promise<void>[] = [];
          if (avatarUrl) {
            const pid = getPublicIdFromUrl(avatarUrl);
            if (pid) {
              cleanups.push(deleteFromCloudinary(pid, "image"));
              console.log(`🧹 Deleting avatar from Cloudinary: ${pid}`);
            }
          }
          if (torUrl) {
            const pid = getPublicIdFromUrl(torUrl);
            if (pid) {
              cleanups.push(deleteFromCloudinary(pid, "image"));
              console.log(`🧹 Deleting TOR from Cloudinary: ${pid}`);
            }
          }
          if (businessPermitUrl) {
            const pid = getPublicIdFromUrl(businessPermitUrl);
            if (pid) {
              cleanups.push(deleteFromCloudinary(pid, "image"));
              console.log(
                `🧹 Deleting Business Permit from Cloudinary: ${pid}`,
              );
            }
          }
          await Promise.allSettled(cleanups);
          await User.findByIdAndDelete(user._id);
          console.log(
            `✅ User ${user.email} and all Cloudinary files deleted.`,
          );
          sendVerificationFailedEmail(
            user.email,
            user.fullName,
            user.role,
          ).catch((err) => console.error(err));
        }
      } catch (err: any) {
        console.error("Background verification error:", err.message);
      }
    };

    runBackgroundVerification();

    if (isJobSeeker) {
      generateTokens(user, res);
      res.status(StatusCodes.CREATED).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        verified: true,
        verificationPending: false,
        isProfileComplete: false,
        autoLogin: true,
        message: "Registration successful.",
      });
      return;
    }

    res.status(StatusCodes.CREATED).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      verified: false,
      verificationPending: true,
      message: "Registration successful. Please wait for an email to get verified.",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new UnauthenticatedError("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthenticatedError("Invalid email or password");

    if (!user.verified && !user.isAdmin) {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "Your account is not yet verified.",
        isUnverified: true,
      });
      return;
    }

    generateTokens(user, res);

    let isProfileComplete: boolean = user.isProfileComplete || true;
    if (user.role === "graduate") {
      isProfileComplete = !!(user.university && user.university.trim() !== "");
    } else if (user.role === "jobseeker") {
      isProfileComplete = user.isProfileComplete || false;
    }

    res.status(StatusCodes.OK).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      degree: user.degree,
      avatar: user.avatar || "",
      companyName: user.companyName || "",
      companyLogo: user.companyLogo || "",
      companyDescription: user.companyDescription || "",
      resume: user.resume || "",
      isAdmin: user.isAdmin,
      verified: user.verified,
      isProfileComplete,
      aiTokens: user.aiTokens,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const isProduction = env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "strict",
    });
    res.status(StatusCodes.OK).json({ message: "User logged out" });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();
    if (!user) throw new NotFoundError("User not found");
    const settings = await SystemSettings.findOne().lean();
    res.status(StatusCodes.OK).json({
      ...user,
      systemSettings: settings || {
        aiCosts: { interview: 20, jobMatch: 1, suitability: 1, skillVerification: 1, profileGeneration: 1 },
        initialTokens: { graduate: 5, jobseeker: 5, employer: 5 },
        tokenPackages: {
          basic: { tokens: 5, price: 109 },
          popular: { tokens: 15, price: 239 },
          premium: { tokens: 30, price: 549 }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const setupProfileGrad = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.user.role !== "graduate" && req.user.role !== "jobseeker") {
      throw new BadRequestError("Only graduates and job seekers can update this profile");
    }
    const {
      university,
      universityAddress,
      birthdate,
      graduationYear,
      portfolio,
      linkedin,
      github,
      resume,
      skills,
      degree,
      bio,
      address,
      phone,
      website,
      major,
      experiences,
      internships,
      education,
      awards,
      certifications,
      projects,
      languages,
      jobPreferences,
      firstName,
      middleName,
      lastName,
    } = req.body;

    // Construct fullName if any name part is provided
    let updateFields: any = {
      degree,
      university,
      universityAddress,
      birthdate,
      graduationYear,
      portfolio,
      linkedin,
      github,
      resume,
      skills,
      bio,
      address,
      phone,
      website,
      major,
      experiences,
      internships,
      education,
      awards,
      certifications,
      projects,
      languages,
      jobPreferences,
      isProfileComplete: true,
    };

    if (firstName !== undefined || middleName !== undefined || lastName !== undefined) {
      if (firstName !== undefined) updateFields.firstName = firstName;
      if (middleName !== undefined) updateFields.middleName = middleName;
      if (lastName !== undefined) updateFields.lastName = lastName;

      const currentFirstName = firstName !== undefined ? firstName : req.user.firstName;
      const currentMiddleName = middleName !== undefined ? middleName : req.user.middleName;
      const currentLastName = lastName !== undefined ? lastName : req.user.lastName;

      updateFields.fullName = [currentFirstName, currentMiddleName, currentLastName].filter(Boolean).join(" ");
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true },
    ).select("-password");

    // Auto-generate AI questions in the background (interview first, then assessments)
    const skillsArray = Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',') : []);
    const allSkills = Array.from(new Set(
      skillsArray.map((s: any) => typeof s === 'object' ? (s.name || s.skill || JSON.stringify(s)) : s)
        .filter((s: any) => s && typeof s === 'string' && s.trim() !== '')
    )) as string[];

    // Queue this user — interview questions generated FIRST (based on desired job title),
    // then assessments for each skill. Multiple users are processed one at a time.
    autoGenerateForUser(req.user._id.toString(), allSkills);

    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    next(error);
  }
};

const uploadImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) throw new BadRequestError("No file uploaded");

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      "gradsync/avatars",
      "image",
      req.file.originalname,
    );
    const imageUrl = result.url;

    const currentUser = await User.findById(req.user._id);

    // Delete previous avatar from Cloudinary
    if (currentUser?.avatar) {
      const previousPublicId = getPublicIdFromUrl(currentUser.avatar);
      if (previousPublicId) await deleteFromCloudinary(previousPublicId);
    }

    if (currentUser) {
      currentUser.avatar = imageUrl;
      await currentUser.save();
    }
    res
      .status(StatusCodes.OK)
      .json({
        imageUrl,
        avatarUrl: imageUrl,
        message: "Avatar updated successfully",
      });
  } catch (error) {
    next(error);
  }
};

const uploadResume = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) throw new BadRequestError("No file uploaded");

    // Upload to Cloudinary as image (PDFs work under image type on free Cloudinary)
    const result = await uploadToCloudinary(
      req.file.buffer,
      "gradsync/resumes",
      "image",
      req.file.originalname,
    );
    const resumeUrl = result.url;

    const currentUser = await User.findById(req.user._id);

    // Delete previous resume from Cloudinary
    if (currentUser?.resume) {
      const previousPublicId = getPublicIdFromUrl(currentUser.resume);
      if (previousPublicId)
        await deleteFromCloudinary(previousPublicId, "image");
    }

    if (currentUser) {
      currentUser.resume = resumeUrl;
      await currentUser.save();
    }
    res
      .status(StatusCodes.OK)
      .json({ resumeUrl, message: "Resume updated successfully" });
  } catch (error) {
    next(error);
  }
};

const checkEmailExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new BadRequestError("Email is required");

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundError("We can't find your account.");
    }

    res.status(StatusCodes.OK).json({
      message: "User found",
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar || null
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundError("We can't find your account.");

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Save the new OTP
    await Otp.create({
      email: email.toLowerCase(),
      otp: otpCode,
    });

    // Send the email
    await sendForgotPasswordEmail(user.email, otpCode);

    res.status(StatusCodes.OK).json({ message: "OTP sent to your email" });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await Otp.findOne({ email: email.toLowerCase() });
    if (!otpRecord) {
      throw new BadRequestError("OTP expired or not found. Please request a new one.");
    }

    // Strictly enforce 5-minute (300000ms) limit, since MongoDB TTL is not instantaneous
    const now = new Date();
    const diffInMs = now.getTime() - new Date(otpRecord.createdAt).getTime();
    if (diffInMs > 5 * 60 * 1000) {
      await Otp.deleteOne({ _id: otpRecord._id });
      throw new BadRequestError("OTP expired. Please request a new one.");
    }

    if (otpRecord.otp !== otp) {
      throw new BadRequestError("Invalid OTP");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Automatically delete OTP record upon successful reset
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(StatusCodes.OK).json({ message: "Password has been successfully reset" });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // We expect req.user to be set via authenticationMiddleware
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError("Incorrect old password");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(StatusCodes.OK).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

export {
  register,
  login,
  logout,
  getMe,
  setupProfileGrad,
  uploadImage,
  uploadResume,
  forgotPassword,
  resetPassword,
  checkEmailExists,
  changePassword,
};
