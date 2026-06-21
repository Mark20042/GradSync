import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/interfaces/base.interfaces.js';
import TerminationReview from '@/models/TerminationReview.model.js';
import TerminationReason from '@/models/TerminationReason.model.js';
import Application from '@/models/Application.model.js';
import Job from '@/models/Job.model.js';
import User from '@/models/User.model.js';
import { createNotification } from '@/utils/notification.helper.js';
import { getIo } from '@/services/socket.service.js';

// ─── Helper: Recalculate and persist rating aggregates ─────────────────────

async function recalcJobRating(jobId: any) {
  const result = await TerminationReview.aggregate([
    { $match: { job: jobId, isJobseekerRated: true } },
    { $group: { _id: null, sum: { $sum: '$jobseekerRating' }, count: { $sum: 1 } } },
  ]);
  const { sum = 0, count = 0 } = result[0] || {};
  await Job.findByIdAndUpdate(jobId, {
    ratingSum: sum,
    ratingCount: count,
    averageRating: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
  });
}

async function recalcCompanyRating(companyId: any) {
  const result = await TerminationReview.aggregate([
    { $match: { company: companyId, isJobseekerRated: true } },
    { $group: { _id: null, sum: { $sum: '$jobseekerRating' }, count: { $sum: 1 } } },
  ]);
  const { sum = 0, count = 0 } = result[0] || {};
  await User.findByIdAndUpdate(companyId, {
    companyRatingSum: sum,
    companyRatingCount: count,
    companyAverageRating: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
  });
}

async function recalcEmployeeRating(employeeId: any) {
  const result = await TerminationReview.aggregate([
    { $match: { employee: employeeId, isEmployerRated: true } },
    { $group: { _id: null, sum: { $sum: '$employerRating' }, count: { $sum: 1 } } },
  ]);
  const { sum = 0, count = 0 } = result[0] || {};
  await User.findByIdAndUpdate(employeeId, {
    employeeRatingSum: sum,
    employeeRatingCount: count,
    employeeAverageRating: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
  });
}

// ─── EMPLOYER: Terminate applicant ─────────────────────────────────────────

export const terminateApplicant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { applicationId, terminationReasonId } = req.body;
    const employer = req.user;

    if (employer.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can terminate applicants.' });
    }

    const application = await Application.findById(applicationId).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    if (application.status === 'Terminated') {
      return res.status(400).json({ message: 'This applicant is already terminated.' });
    }

    const job = application.job as any;
    if (String(job.company) !== String(employer._id)) {
      return res.status(403).json({ message: 'You do not own this job.' });
    }

    const terminationDate = new Date();
    const tenureDays = Math.floor(
      (terminationDate.getTime() - new Date(application.createdAt!).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Create the TerminationReview stub
    const review = await TerminationReview.create({
      application: application._id,
      job: job._id,
      company: employer._id,
      employee: application.applicant,
      terminationReason: terminationReasonId || null,
      terminationDate,
      tenureDays,
    });

    // Update the application
    application.status = 'Terminated';
    application.terminatedAt = terminationDate;
    application.terminationReason = terminationReasonId || null;
    (application as any).terminationReview = review._id;
    await application.save();

    // Notify the jobseeker
    const notification = await createNotification(
      application.applicant,
      'TERMINATION',
      'Employment Terminated',
      `Your employment at ${employer.companyName || 'the company'} has been terminated. Please take a moment to rate your experience.`
    );
    getIo().to(application.applicant.toString()).emit("receiveNotification", notification);

    return res.status(200).json({ message: 'Applicant terminated successfully.', review });
  } catch (error) {
    console.error('terminateApplicant error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── EMPLOYER: Submit rating for the employee ───────────────────────────────

export const submitEmployerRating = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, feedback, tags } = req.body;
    const employer = req.user;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const review = await TerminationReview.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (String(review.company) !== String(employer._id)) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }
    if (review.isEmployerRated) {
      return res.status(400).json({ message: 'You have already rated this employee.' });
    }

    review.employerRating = rating;
    review.employerFeedback = feedback || '';
    review.employerTags = tags || [];
    review.employerRatedAt = new Date();
    review.isEmployerRated = true;
    await review.save();

    // Recalculate employee's aggregate rating
    await recalcEmployeeRating(review.employee);

    // Notify the employee
    await createNotification(
      review.employee,
      'EMPLOYER_REVIEW',
      'Employment Review Received',
      `${employer.companyName || 'Your previous employer'} has left a conduct rating for your profile.`
    );

    return res.status(200).json({ message: 'Rating submitted successfully.' });
  } catch (error) {
    console.error('submitEmployerRating error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── JOBSEEKER: Submit rating for the company/job ──────────────────────────

export const submitJobseekerRating = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, feedback, tags } = req.body;
    const user = req.user;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const review = await TerminationReview.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (String(review.employee) !== String(user._id)) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }
    if (review.isJobseekerRated) {
      return res.status(400).json({ message: 'You have already rated this experience.' });
    }

    review.jobseekerRating = rating;
    review.jobseekerFeedback = feedback || '';
    review.jobseekerTags = tags || [];
    review.jobseekerRatedAt = new Date();
    review.isJobseekerRated = true;
    await review.save();

    // Recalculate job and company aggregate ratings
    await Promise.all([recalcJobRating(review.job), recalcCompanyRating(review.company)]);

    // Notify the employer
    await createNotification(
      review.company,
      'JOBSEEKER_REVIEW',
      'New Job Review',
      `A former employee has left a review for one of your jobs.`
    );

    return res.status(200).json({ message: 'Review submitted successfully.' });
  } catch (error) {
    console.error('submitJobseekerRating error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── JOBSEEKER: Get pending (unrated) termination reviews ──────────────────

export const getMyPendingRatings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (user.role === 'employer') {
      const pending = await TerminationReview.find({
        company: user._id,
        isEmployerRated: false,
      })
        .populate('job', 'title')
        .populate('employee', 'fullName avatar')
        .populate('terminationReason', 'label')
        .sort({ terminationDate: -1 });
      return res.status(200).json(pending);
    } else {
      const pending = await TerminationReview.find({
        employee: user._id,
        isJobseekerRated: false,
      })
        .populate('job', 'title')
        .populate('company', 'companyName companyLogo')
        .populate('terminationReason', 'label')
        .sort({ terminationDate: -1 });
      return res.status(200).json(pending);
    }
  } catch (error) {
    console.error('getMyPendingRatings error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── JOBSEEKER: Dismiss the rating prompt ("Rate Later") ───────────────────

export const dismissRatingPrompt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const review = await TerminationReview.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });

    if (user.role === 'employer') {
      if (String(review.company) !== String(user._id)) {
        return res.status(403).json({ message: 'Unauthorized.' });
      }
      review.employerRatingPromptDismissed = true;
    } else {
      if (String(review.employee) !== String(user._id)) {
        return res.status(403).json({ message: 'Unauthorized.' });
      }
      review.jobseekerRatingPromptDismissed = true;
    }

    await review.save();

    return res.status(200).json({ message: 'Prompt dismissed.' });
  } catch (error) {
    console.error('dismissRatingPrompt error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── PUBLIC: Get anonymous jobseeker reviews for a job ─────────────────────

export const getJobReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;

    const reviews = await TerminationReview.find({ job: jobId, isJobseekerRated: true })
      .select('jobseekerRating jobseekerFeedback jobseekerTags jobseekerRatedAt tenureDays')
      .populate('employee', 'role major degree') // anonymous: role/field only, no name
      .populate('job', 'title')
      .sort({ jobseekerRatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await TerminationReview.countDocuments({ job: jobId, isJobseekerRated: true });

    // Strip any identifying info — return only role and job category
    const anonymized = reviews.map((r: any) => ({
      _id: r._id,
      rating: r.jobseekerRating,
      feedback: r.jobseekerFeedback,
      tags: r.jobseekerTags,
      ratedAt: r.jobseekerRatedAt,
      tenureDays: r.tenureDays,
      reviewerRole: r.employee?.role || 'Applicant',
      reviewerMajor: r.employee?.major || '',
    }));

    return res.status(200).json({ reviews: anonymized, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('getJobReviews error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── PUBLIC: Get anonymous jobseeker reviews for a company ─────────────────

export const getCompanyReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const jobId = req.query.jobId as string;

    const query: any = { company: companyId, isJobseekerRated: true };
    if (jobId) query.job = jobId;

    const reviews = await TerminationReview.find(query)
      .select('jobseekerRating jobseekerFeedback jobseekerTags jobseekerRatedAt tenureDays terminationDate terminationReason')
      .populate('employee', 'role major degree')
      .populate('job', 'title')
      .populate('terminationReason', 'label')
      .sort({ jobseekerRatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await TerminationReview.countDocuments(query);

    const anonymized = reviews.map((r: any) => ({
      _id: r._id,
      rating: r.jobseekerRating,
      feedback: r.jobseekerFeedback,
      tags: r.jobseekerTags,
      ratedAt: r.jobseekerRatedAt,
      tenureDays: r.tenureDays,
      terminationDate: r.terminationDate,
      terminationReason: r.terminationReason?.label || 'N/A',
      jobTitle: (r.job as any)?.title || '',
      reviewerRole: r.employee?.role || 'Applicant',
    }));

    return res.status(200).json({ reviews: anonymized, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('getCompanyReviews error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── PUBLIC: Get employee conduct score only (no feedback text) ─────────────

export const getEmployeeConductScore = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const employee = await User.findById(userId).select('employeeAverageRating employeeRatingCount');
    if (!employee) return res.status(404).json({ message: 'User not found.' });

    return res.status(200).json({
      averageRating: employee.employeeAverageRating || 0,
      ratingCount: employee.employeeRatingCount || 0,
    });
  } catch (error) {
    console.error('getEmployeeConductScore error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getEmployeeReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;

    const reviews = await TerminationReview.find({ employee: userId, isEmployerRated: true })
      .select('employerRating employerFeedback employerTags employerRatedAt tenureDays terminationDate terminationReason company job')
      .populate('company', 'companyName companyLogo')
      .populate('job', 'title')
      .populate('terminationReason', 'label')
      .sort({ employerRatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await TerminationReview.countDocuments({ employee: userId, isEmployerRated: true });

    const formatted = reviews.map((r: any) => ({
      _id: r._id,
      rating: r.employerRating,
      feedback: r.employerFeedback,
      tags: r.employerTags,
      ratedAt: r.employerRatedAt,
      tenureDays: r.tenureDays,
      terminationDate: r.terminationDate,
      terminationReason: r.terminationReason?.label || 'N/A',
      companyName: r.company?.companyName || 'Unknown Company',
      companyLogo: r.company?.companyLogo || '',
      jobTitle: r.job?.title || 'Unknown Position',
    }));

    return res.status(200).json({ reviews: formatted, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('getEmployeeReviews error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── ADMIN: Get all termination reasons ────────────────────────────────────

export const getTerminationReasons = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const reasons = await TerminationReason.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    return res.status(200).json(reasons);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const createTerminationReason = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { label, description, order } = req.body;
    if (!label) return res.status(400).json({ message: 'Label is required.' });
    const reason = await TerminationReason.create({ label, description, order: order || 0 });
    return res.status(201).json(reason);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateTerminationReason = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const reason = await TerminationReason.findByIdAndUpdate(id, req.body, { new: true });
    if (!reason) return res.status(404).json({ message: 'Reason not found.' });
    return res.status(200).json(reason);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteTerminationReason = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await TerminationReason.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Reason deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
