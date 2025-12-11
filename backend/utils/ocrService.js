const Tesseract = require("tesseract.js");
const fs = require("fs");
const pdf = require("pdf-parse");
const path = require("path");

const verifyDocument = async (filePath, type) => {
    try {
        const fileExtension = path.extname(filePath).toLowerCase();
        let text = "";

        if (fileExtension === ".pdf") {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            text = data.text;
        } else if ([".jpg", ".jpeg", ".png", ".bmp"].includes(fileExtension)) {
            const { data: { text: ocrText } } = await Tesseract.recognize(filePath, "eng");
            text = ocrText;
        } else {
            return { verified: false, message: "Unsupported file format" };
        }

        text = text.toLowerCase();
        let keywords = [];

        if (type === "businessPermit") {
            keywords = [
                "republic of the philippines",
                "office of the mayor",
                "business permit",
                "mayor's permit",
                "city of",
                "municipality of",
                "barangay",
                "tax year",
                "permit no",
                "business tax",
                "valid until",
            ];
        }

        const foundKeywords = keywords.filter((keyword) => text.includes(keyword));
        const matchCount = foundKeywords.length;

        // Threshold: Lowered to 2 as requested to be less strict
        const threshold = 2; // Was 7
        const isVerified = matchCount >= threshold;

        return {
            verified: isVerified,
            matchCount,
            foundKeywords,
            message: isVerified
                ? "Document verified successfully."
                : "Business Permit verification failed. Please ensure you uploaded a clear, valid Business Permit.",
        };
    } catch (error) {
        console.error("OCR Error:", error);
        return { verified: false, message: "Error processing document." };
    }
};

module.exports = { verifyDocument };
