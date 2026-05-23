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
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from "@/services/cloudinary.service.js";
import { verifyDocument } from "@/utils/ocr.service.js";
import {
  sendVerificationSuccessEmail,
  sendVerificationFailedEmail,
} from "@/utils/email.service.js";
import fs from "fs";
import path from "path";
import os from "os";

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

    const user = new User({
      firstName,
      middleName,
      lastName,
      fullName,
      email,
      password,
      role,
      degree,
      companyName,
      avatar: avatarUrl,
      companyLogo: isEmployer ? avatarUrl : "",
      tor: torUrl,
      businessPermit: businessPermitUrl,
      verified: false,
      verificationStatus: "pending",
      verificationMessage: "Your document is currently being reviewed.",
    });
    await user.save();

    // Background OCR Processing
    const runBackgroundVerification = async () => {
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

    res.status(StatusCodes.CREATED).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      verified: false,
      verificationPending: true,
      message:
        "Registration successful. Please wait for an email to get verified.",
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
    if (user.password !== password)
      throw new UnauthenticatedError("Invalid email or password");
    if (!user.verified && !user.isAdmin) {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "Your account is not yet verified.",
        isUnverified: true,
      });
      return;
    }

    generateTokens(user, res);

    const isProfileComplete =
      user.role === "graduate"
        ? !!(user.university && user.university.trim() !== "")
        : user.isProfileComplete || true;

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
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("accessToken");
    res.status(StatusCodes.OK).json({ message: "User logged out" });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) throw new NotFoundError("User not found");
    res.status(StatusCodes.OK).json(user);
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
    if (req.user.role !== "graduate") {
      throw new BadRequestError("Only graduates can update this profile");
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

export {
  register,
  login,
  logout,
  getMe,
  setupProfileGrad,
  uploadImage,
  uploadResume,
};
