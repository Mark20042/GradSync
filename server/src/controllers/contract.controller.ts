import type { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@/errors/index.js";
import { type AuthRequest } from "@/middlewares/auth.middleware.js";
import Contract from "@/models/Contract.model.js";
import Application from "@/models/Application.model.js";
import Job from "@/models/Job.model.js";
import User from "@/models/User.model.js";
import TerminationReview from "@/models/TerminationReview.model.js";
import { createNotification } from "@/utils/notification.helper.js";
import { getIo } from "@/services/socket.service.js";
import { addMonths, addYears } from "date-fns";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateEndDate(startDate: Date, duration: number, unit: "months" | "years"): Date {
  return unit === "years" ? addYears(startDate, duration) : addMonths(startDate, duration);
}

async function assertEmployerOwnership(contractId: string, employerId: string) {
  const contract = await Contract.findById(contractId);
  if (!contract) throw new NotFoundError("Contract not found");
  if (String(contract.employer) !== String(employerId)) {
    throw new UnauthorizedError("You are not the employer for this contract");
  }
  return contract;
}

// ─── 1. Create Contract (Employer) ───────────────────────────────────────────

const createContract = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== "employer") {
      throw new UnauthorizedError("Only employers can create contracts");
    }

    const { applicationId, contractType, startDate, duration, durationUnit } = req.body;

    const application = await Application.findById(applicationId)
      .populate("job", "title location type companyName")
      .populate("applicant", "fullName companyName");
    if (!application) throw new NotFoundError("Application not found");
    if (application.status !== "Accepted") {
      throw new BadRequestError("Contract can only be created for Accepted applications");
    }

    if (!["Fixed-Term", "Indefinite"].includes(contractType)) {
      throw new BadRequestError(
        `Invalid contractType "${contractType}". Must be "Fixed-Term" or "Indefinite".`,
      );
    }

    let endDate: Date | null = null;
    const parsedStart = new Date(startDate);
    if (isNaN(parsedStart.getTime())) throw new BadRequestError("Invalid startDate");

    if (contractType === "Fixed-Term") {
      if (!duration || !durationUnit) {
        throw new BadRequestError(
          "Fixed-Term contracts require `duration` (number) and `durationUnit` (months or years)",
        );
      }
      if (!["months", "years"].includes(durationUnit)) {
        throw new BadRequestError("durationUnit must be 'months' or 'years'");
      }
      endDate = calculateEndDate(parsedStart, Number(duration), durationUnit);
    }

    const existing = await Contract.findOne({
      employee: application.applicant,
      job: application.job,
      status: "Accepted",
    });
    if (existing) throw new BadRequestError("An active contract already exists for this employee and job");

    const job = await Job.findById(application.job).populate("company", "companyName");
    const companyData = (job?.company as any) || {};
    const workExperience = {
      companyName: companyData.companyName || req.user.companyName || "Unknown Company",
      startDate: parsedStart,
      endDate,
      exitStatus: null,
    };

    const contract = await Contract.create({
      employer: req.user._id,
      employee: application.applicant,
      job: application.job,
      application: application._id,
      contractType,
      startDate: parsedStart,
      endDate,
      status: "Accepted",
      workExperience,
    });

    try {
      const notif = await createNotification(
        application.applicant,
        "APPLICATION",
        "Contract Created",
        `A ${contractType} contract has been created for you by ${req.user.companyName || "your employer"}.`,
        contract._id,
      );
      getIo().to(String(application.applicant)).emit("receiveNotification", notif);
    } catch (e) {
      console.error("Contract creation notification error:", e);
    }

    res.status(StatusCodes.CREATED).json({ message: "Contract created", contract });
  } catch (error) {
    next(error);
  }
};

// ─── 2. Transition Status (Employer) ─────────────────────────────────────────

const updateContractStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== "employer") {
      throw new UnauthorizedError("Only employers can update contract status");
    }

    const { status, endDate } = req.body;
    const allowed = ["Resigned", "Contract Ended", "Terminated"] as const;
    if (!allowed.includes(status)) {
      throw new BadRequestError(
        `Status must be one of: ${allowed.join(", ")}. Received: "${status}"`,
      );
    }

    const contract = await assertEmployerOwnership(String(req.params.id), String(req.user._id));

    if (contract.status !== "Accepted") {
      throw new BadRequestError(
        `Cannot transition from "${contract.status}". Only "Accepted" (Active) contracts can be ended.`,
      );
    }

    const terminationDate = endDate ? new Date(endDate) : new Date();

    contract.status = status;
    contract.workExperience.exitStatus = status;
    contract.workExperience.endDate = terminationDate;
    await contract.save();

    const application = await Application.findById(contract.application);
    if (application) {
      if (application.experienceRef) {
        await User.updateOne(
          { _id: contract.employee, "experiences._id": application.experienceRef },
          {
            $set: {
              "experiences.$.endDate": terminationDate,
              "experiences.$.current": false,
            },
          },
        );
      }
      
      // Create TerminationReview stub so they can rate each other
      const tenureDays = Math.max(0, Math.floor(
        (terminationDate.getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24)
      ));

      const review = await TerminationReview.create({
        application: application._id,
        job: contract.job,
        company: contract.employer,
        employee: contract.employee,
        terminationDate: terminationDate,
        tenureDays,
        // No terminationReason by default for Resigned or Contract Ended
      });
      
      application.status = status as any;
      application.terminatedAt = terminationDate;
      (application as any).terminationReview = review._id;
      await application.save();
    }

    try {
      const notif = await createNotification(
        contract.employee,
        "APPLICATION",
        `Contract ${status}`,
        `Your contract has been marked as "${status}".`,
        contract._id,
      );
      getIo().to(String(contract.employee)).emit("receiveNotification", notif);
    } catch (e) {
      console.error("Contract status notification error:", e);
    }

    res.json({ message: `Contract status updated to "${status}"`, contract });
  } catch (error) {
    next(error);
  }
};

// ─── 3. Extend / Edit endDate (Employer, active Fixed-Term only) ─────────────

const extendContract = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== "employer") {
      throw new UnauthorizedError("Only employers can extend contracts");
    }

    const contract = await assertEmployerOwnership(String(req.params.id), String(req.user._id));

    if (contract.contractType !== "Fixed-Term") {
      throw new BadRequestError("Only Fixed-Term contracts can be extended");
    }
    if (contract.status !== "Accepted") {
      throw new BadRequestError("Only active (Accepted) contracts can be extended");
    }

    const { duration, durationUnit, reason } = req.body;
    if (!duration || !durationUnit) {
      throw new BadRequestError("`duration` (number) and `durationUnit` (months|years) are required");
    }
    if (!["months", "years"].includes(durationUnit)) {
      throw new BadRequestError("durationUnit must be 'months' or 'years'");
    }

    const previousEndDate = contract.endDate;
    const newEndDate = calculateEndDate(contract.startDate, Number(duration), durationUnit);

    contract.extensionHistory.push({
      previousEndDate,
      newEndDate,
      changedAt: new Date(),
      changedBy: req.user._id,
      reason: reason || "",
    });

    contract.endDate = newEndDate;
    contract.workExperience.endDate = newEndDate;
    await contract.save();

    try {
      const notif = await createNotification(
        contract.employee,
        "APPLICATION",
        "Contract Extended",
        `Your Fixed-Term contract end date has been extended to ${newEndDate.toISOString().split("T")[0]}.`,
        contract._id,
      );
      getIo().to(String(contract.employee)).emit("receiveNotification", notif);
    } catch (e) {
      console.error("Contract extension notification error:", e);
    }

    res.json({ message: "Contract extended", contract });
  } catch (error) {
    next(error);
  }
};

// ─── 4. Read Operations ──────────────────────────────────────────────────────

const getContracts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filter =
      req.user.role === "employer"
        ? { employer: req.user._id }
        : { employee: req.user._id };

    const contracts = await Contract.find(filter)
      .populate("job", "title location type")
      .populate("employee", "fullName email avatar")
      .populate("employer", "fullName companyName companyLogo")
      .sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error) {
    next(error);
  }
};

const getContractById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("job", "title description location type")
      .populate("employee", "fullName email avatar")
      .populate("employer", "fullName companyName companyLogo")
      .populate("application");

    if (!contract) throw new NotFoundError("Contract not found");

    const userId = String(req.user._id);
    if (String(contract.employer) !== userId && String(contract.employee) !== userId) {
      throw new UnauthorizedError("Not authorized to view this contract");
    }

    res.json(contract);
  } catch (error) {
    next(error);
  }
};

export { createContract, updateContractStatus, extendContract, getContracts, getContractById };