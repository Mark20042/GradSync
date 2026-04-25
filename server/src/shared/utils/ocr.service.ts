import Tesseract from 'tesseract.js';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';

const _require = createRequire(import.meta.url);
const pdf = _require('pdf-parse') as (dataBuffer: Buffer) => Promise<{ text: string }>;

interface OCRResult {
  verified: boolean;
  matchCount?: number;
  foundKeywords?: string[];
  message: string;
}

export const verifyDocument = async (filePath: string, type: 'tor' | 'businessPermit'): Promise<OCRResult> => {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    let text = '';

    if (fileExtension === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (['.jpg', '.jpeg', '.png', '.bmp'].includes(fileExtension)) {
      const { data: { text: ocrText } } = await Tesseract.recognize(filePath, 'eng');
      text = ocrText;
    } else {
      return { verified: false, message: 'Unsupported file format' };
    }

    text = text.toLowerCase();
    let keywords: string[] = [];

    if (type === 'businessPermit') {
      keywords = [
        'republic of the philippines',
        'office of the mayor',
        'business permit',
        "mayor's permit",
        'city of',
        'municipality of',
        'barangay',
        'tax year',
        'permit no',
        'business tax',
        'valid until',
      ];
    } else if (type === 'tor') {
      keywords = [
        'transcript of records',
        'official transcript',
        'academic record',
        'scholastic record',
        'registrar',
        'semester',
        'units',
        'grade',
        'grading system',
        'subject',
        'course',
        'degree',
        'bachelor',
        'general weighted average',
        'gwa',
        'university',
        'college',
        'school',
        'institute',
        'academy',
        'student name',
        'student number',
        'student no',
        'date of graduation',
        'graduated',
        'remarks',
        'credited',
        'evaluator',
        'prepared by',
        'checked by',
      ];
    }

    const foundKeywords = keywords.filter((keyword) => text.includes(keyword));
    const matchCount = foundKeywords.length;

    // 2 keyword matches required for verification
    const threshold = 2;
    const isVerified = matchCount >= threshold;
    const docLabel = type === 'tor' ? 'Transcript of Records' : 'Business Permit';

    return {
      verified: isVerified,
      matchCount,
      foundKeywords,
      message: isVerified
        ? `${docLabel} verified successfully.`
        : `${docLabel} verification failed. Please ensure you uploaded a clear, valid ${docLabel}.`,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return { verified: false, message: 'Error processing document.' };
  }
};
