import { v2 as cloudinary } from "cloudinary";
import { env } from "@/config/environment.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param fileBuffer - The file buffer from multer memory storage
 * @param folder - The Cloudinary folder to upload to
 * @param resourceType - "image" | "raw" (for PDFs, docs, etc.)
 * @param originalFilename - Original filename to preserve extension (e.g. "resume.pdf")
 * @returns Cloudinary upload result with secure_url
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = "gradsync",
  resourceType: "image" | "raw" | "auto" = "auto",
  originalFilename?: string,
): Promise<{ url: string; publicId: string }> => {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  let publicId: string | undefined;
  let format: string | undefined;

  if (originalFilename) {
    const ext = originalFilename.split(".").pop() || "";
    const baseName = originalFilename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    if (resourceType === "raw") {
      // Raw files: extension MUST be in public_id (Cloudinary doesn't auto-add it)
      publicId = `${baseName}-${uniqueSuffix}.${ext}`;
    } else if (resourceType === "image") {
      // Images: use format option, don't put extension in public_id
      publicId = `${baseName}-${uniqueSuffix}`;
      format = ext;
    } else {
      publicId = `${baseName}-${uniqueSuffix}`;
    }
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: resourceType,
          ...(publicId && { public_id: publicId, use_filename: true, unique_filename: false }),
          ...(format && { format }),
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        },
      )
      .end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by its public ID
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "raw" = "image",
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};

/**
 * Extract Cloudinary public_id from a Cloudinary URL
 * For images: strips the extension (gradsync/avatar-123)
 * For raw files: keeps the extension (gradsync/resumes/resume-123.pdf)
 *   because the extension is part of the public_id for raw resources
 */
export const getPublicIdFromUrl = (url: string, keepExtension: boolean = false): string | null => {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const pathAfterUpload = parts[1]!;
    const withoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
    if (keepExtension) {
      // Raw files: extension is part of the public_id
      return withoutVersion;
    }
    // Images: strip extension
    const publicId = withoutVersion.replace(/\.[^.]+$/, "");
    return publicId;
  } catch {
    return null;
  }
};

export default cloudinary;
