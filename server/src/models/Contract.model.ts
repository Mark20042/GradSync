import mongoose, { Schema, type Document, type Types } from "mongoose";

// ─── Work Experience Subdocument (embedded in Contract for job lifecycle tracking) ───
export interface IContractExperience {
  companyName: string;
  startDate: Date;
  endDate?: Date | null;
  /** Automatically populated by the backend when endDate is first set on a previously-open record */
  exitStatus?: "Resigned" | "Terminated" | "Contract Ended" | null;
}

const contractExperienceSchema = new Schema<IContractExperience>(
  {
    companyName: { type: String, required: [true, "Company name is required"] },
    startDate: { type: Date, required: [true, "Start date is required"] },
    endDate: { type: Date, default: null },
    exitStatus: {
      type: String,
      enum: ["Resigned", "Terminated", "Contract Ended", null],
      default: null,
    },
  },
  { _id: true },
);

// ─── Contract Interface ──────────────────────────────────────────────────────
export interface IContract extends Document {
  _id: Types.ObjectId;
  /** The employer who owns this contract */
  employer: Types.ObjectId;
  /** The jobseeker / graduate under contract */
  employee: Types.ObjectId;
  /** The job posting this contract is linked to */
  job: Types.ObjectId;
  /** Reference to the accepted application */
  application: Types.ObjectId;

  contractType: "Fixed-Term" | "Indefinite";
  startDate: Date;
  /** Nullable — set at creation for Fixed-Term; always null for Indefinite; may be patched later for extensions */
  endDate: Date | null;
  status: "Applied" | "In Review" | "Accepted" | "Resigned" | "Contract Ended" | "Terminated";

  /** Embedded work-experience snapshot for the employee's profile lifecycle */
  workExperience: IContractExperience;

  /** Audit trail for extension edits (keeps history of endDate changes) */
  extensionHistory: Array<{
    previousEndDate: Date | null;
    newEndDate: Date | null;
    changedAt: Date;
    changedBy: Types.ObjectId;
    reason?: string;
  }>;

  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Contract Schema ─────────────────────────────────────────────────────────
const contractSchema = new Schema<IContract>(
  {
    employer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employer is required"],
      index: true,
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee is required"],
      index: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job is required"],
    },
    application: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: [true, "Application reference is required"],
    },

    contractType: {
      type: String,
      required: [true, "Contract type is required"],
      enum: {
        values: ["Fixed-Term", "Indefinite"],
        message: "{VALUE} is not a valid contract type",
      },
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (this: IContract, v: Date | null): boolean {
          // Allow end date on Indefinite contracts when ending employment
          const isEnding = ["Contract Ended", "Resigned", "Terminated"].includes(this.status);
          // Indefinite contracts must NOT have an endDate unless being ended
          if (this.contractType === "Indefinite" && v !== null && !isEnding) return false;
          // If an endDate is provided, it must be after startDate
          if (v !== null && this.startDate && v <= this.startDate) return false;
          return true;
        },
        message:
          "End date must be after start date, and Indefinite contracts cannot have an end date unless the contract is being ended",
      },
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [
          "Applied",
          "In Review",
          "Accepted",
          "Resigned",
          "Contract Ended",
          "Terminated",
        ],
        message: "{VALUE} is not a valid contract status",
      },
      default: "Applied",
    },

    workExperience: {
      type: contractExperienceSchema,
      required: true,
    },

    extensionHistory: [
      {
        previousEndDate: { type: Date, default: null },
        newEndDate: { type: Date, default: null },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
        reason: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Compound Indexes ────────────────────────────────────────────────────────
// Fast lookup for cron: find active fixed-term contracts whose endDate has passed
contractSchema.index({ status: 1, contractType: 1, endDate: 1 });
// Fast lookup for employer dashboard
contractSchema.index({ employer: 1, status: 1 });
// Fast lookup for employee dashboard
contractSchema.index({ employee: 1, status: 1 });
// One active (Accepted) contract per employee per job
contractSchema.index(
  { employee: 1, job: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "Accepted" } },
);

// ─── Pre-save Hook: enforce Indefinite endDate = null (only for active contracts) ─
contractSchema.pre("save", function (next) {
  // Only force null endDate for Indefinite contracts that are still active
  // Allow endDate when the contract is being ended
  const isEnding = ["Contract Ended", "Resigned", "Terminated"].includes(this.status);
  if (this.contractType === "Indefinite" && !isEnding) {
    this.endDate = null;
  }
  next();
});

const Contract = mongoose.model<IContract>("Contract", contractSchema);
export default Contract;
