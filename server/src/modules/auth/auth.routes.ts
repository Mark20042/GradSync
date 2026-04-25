import { Router } from 'express';
import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../shared/config/environment.js';
import { protect } from '../../shared/middleware/auth.middleware.js';
import User from '../../shared/models/User.model.js';
import type { AuthenticatedRequest } from '../../shared/interfaces/base.interfaces.js';
import { upload } from '../../shared/middleware/upload.middleware.js';
import { verifyDocument } from '../../shared/utils/ocr.service.js';
import { sendVerificationSuccessEmail, sendVerificationFailedEmail } from '../../shared/utils/email.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const generateToken = (id: string): string => {
  return jwt.sign({ id }, env.JWT_SECRET as jwt.Secret, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
};

// Helper to cleanup files
const cleanupFiles = (files: any) => {
  if (!files) return;
  try {
    if (files.avatar && files.avatar[0]) fs.unlinkSync(files.avatar[0].path);
    if (files.tor && files.tor[0]) fs.unlinkSync(files.tor[0].path);
    if (files.businessPermit && files.businessPermit[0])
      fs.unlinkSync(files.businessPermit[0].path);
  } catch (err: any) {
    console.error('File cleanup error:', err.message);
  }
};

// POST /api/auth/register
router.post('/register', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'tor', maxCount: 1 },
  { name: 'businessPermit', maxCount: 1 },
]), async (req: any, res: Response) => {
  try {
    const { fullName, email, password, role, degree, companyName } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      cleanupFiles(req.files);
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    let avatarUrl = '';
    let torUrl = '';
    let businessPermitUrl = '';
    const host = env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    if (req.files) {
      if (req.files.avatar) avatarUrl = `${host}/uploads/${req.files.avatar[0].filename}`;
      if (req.files.tor) torUrl = `${host}/uploads/${req.files.tor[0].filename}`;
      if (req.files.businessPermit) businessPermitUrl = `${host}/uploads/${req.files.businessPermit[0].filename}`;
    }

    const isEmployer = role === 'employer';

    const user = new User({
      fullName, email, password, role, degree, companyName,
      avatar: avatarUrl, companyLogo: isEmployer ? avatarUrl : '',
      tor: torUrl, businessPermit: businessPermitUrl,
      verified: false, verificationStatus: 'pending',
      verificationMessage: 'Your document is currently being reviewed.',
    });
    await user.save();

    // Background OCR Processing
    const runBackgroundVerification = async () => {
      try {
        let ocrResult = { verified: false, message: 'No document uploaded.' };

        if (isEmployer && req.files && req.files.businessPermit) {
          const filePath = req.files.businessPermit[0].path;
          console.log(`🔍 Running OCR verification in background on Business Permit for ${fullName}...`);
          ocrResult = await verifyDocument(filePath, 'businessPermit');
        } else if (!isEmployer && req.files && req.files.tor) {
          const filePath = req.files.tor[0].path;
          console.log(`🔍 Running OCR verification in background on TOR for ${fullName}...`);
          ocrResult = await verifyDocument(filePath, 'tor');
        }

        console.log(`📄 OCR Result for ${fullName}:`, ocrResult);

        if (ocrResult.verified) {
          user.verified = true;
          user.verificationStatus = 'verified';
          user.verificationMessage = ocrResult.message;
          await (user as any).save();
          sendVerificationSuccessEmail(user.email, user.fullName, user.role).catch(err => console.error(err));
        } else {
          console.log(`🗑️ OCR Failed. Deleting unverified user: ${user.email}`);
          await User.findByIdAndDelete(user._id);
          if (req.files) cleanupFiles(req.files);
          sendVerificationFailedEmail(user.email, user.fullName, user.role).catch(err => console.error(err));
        }
      } catch (err: any) {
        console.error('Background verification error:', err.message);
      }
    };

    runBackgroundVerification();

    res.status(201).json({
      _id: user._id, fullName: user.fullName, email: user.email, role: user.role,
      verified: false, verificationPending: true,
      message: 'Registration successful. Please wait for an email to get verified.',
    });
  } catch (error: any) {
    if (req.files) cleanupFiles(req.files);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) { res.status(400).json({ message: 'User not found' }); return; }
    if (user.password !== password) { res.status(400).json({ message: 'Invalid email or password' }); return; }
    if (!user.verified && !user.isAdmin) {
      res.status(403).json({ message: 'Your account is not yet verified.', isUnverified: true });
      return;
    }
    const token = generateToken(String(user._id));
    const isProfileComplete = user.role === 'graduate'
      ? !!(user.university && user.university.trim() !== '')
      : user.isProfileComplete || true;
    res.status(200).json({
      _id: user._id, fullName: user.fullName, email: user.email, role: user.role,
      degree: user.degree, avatar: user.avatar || '', companyName: user.companyName || '',
      companyLogo: user.companyLogo || '', companyDescription: user.companyDescription || '',
      resume: user.resume || '', isAdmin: user.isAdmin, verified: user.verified, isProfileComplete, token,
    });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

// GET /api/auth/me
router.get('/me', protect as any, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.status(200).json(user);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

// PUT /api/auth/setup-profile-grad
router.put('/setup-profile-grad', protect as any, async (req: any, res: Response) => {
  try {
    if (req.user.role !== 'graduate') {
      res.status(403).json({ message: 'Only graduates can update this profile' }); return;
    }
    const { university, graduationYear, portfolio, linkedin, github, resume, skills, degree,
      bio, address, phone, website, major, experiences, internships, education, awards,
      certifications, projects, languages, jobPreferences } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, {
      degree, university, graduationYear, portfolio, linkedin, github, resume, skills,
      bio, address, phone, website, major, experiences, internships, education, awards,
      certifications, projects, languages, jobPreferences, isProfileComplete: true,
    }, { new: true }).select('-password');
    res.status(200).json(user);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
});

// POST /api/auth/upload-image
router.post('/upload-image', protect as any, upload.single('image'), async (req: any, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ message: 'No file uploaded' }); return; }
    
    const host = env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${host}/uploads/${req.file.filename}`;
    const currentUser = await User.findById(req.user._id);

    if (currentUser?.avatar) {
      const previousFilename = currentUser.avatar.split('/').pop();
      if (previousFilename) {
        const previousFilePath = path.join(__dirname, '../../../../uploads', previousFilename);
        if (fs.existsSync(previousFilePath)) fs.unlinkSync(previousFilePath);
      }
    }

    if (currentUser) {
      currentUser.avatar = imageUrl;
      await currentUser.save();
    }
    res.status(200).json({ imageUrl, avatarUrl: imageUrl, message: 'Avatar updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// POST /api/auth/upload-resume
router.post('/upload-resume', protect as any, upload.single('resume'), async (req: any, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ message: 'No file uploaded' }); return; }
    
    const host = env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const resumeUrl = `${host}/uploads/${req.file.filename}`;
    const currentUser = await User.findById(req.user._id);

    if (currentUser?.resume) {
      const previousFilename = currentUser.resume.split('/').pop();
      if (previousFilename) {
        const previousFilePath = path.join(__dirname, '../../../../uploads', previousFilename);
        if (fs.existsSync(previousFilePath)) fs.unlinkSync(previousFilePath);
      }
    }

    if (currentUser) {
      currentUser.resume = resumeUrl;
      await currentUser.save();
    }
    res.status(200).json({ resumeUrl, message: 'Resume updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error uploading resume' });
  }
});

export default router;
