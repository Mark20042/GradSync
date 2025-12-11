import { API_PATH } from "./apiPath";
import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await axiosInstance.post(
      API_PATH.AUTH.UPLOAD_IMAGE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Upload image response:", response.data);
    return response.data; // Returns { avatarUrl: "...", message: "..." }
  } catch (error) {
    console.error("Error uploading image:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

export default uploadImage;
