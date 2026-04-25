// Validation for email
export const validateEmail = (email) => {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email";
  return "";
};

export const validatePassword = (password) => {
  if (!password.trim()) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  return "";
};

export const validateAvatar = (file) => {
  if (!file) return "";
  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.type))
    return "Avatar must be a JPEG, or PNG file";
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) return "Avatar size must be less than 5MB";
  return "";
};

export const getInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  return name
    .split(" ")
    .map((n) => n[0].toUpperCase())
    .join("");
};
