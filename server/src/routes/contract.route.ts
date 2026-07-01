import { Router } from "express";
import {
  createContract,
  updateContractStatus,
  extendContract,
  getContracts,
  getContractById,
} from "@/controllers/contract.controller.js";
import { authenticationMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticationMiddleware as any);

router.post("/", createContract as any);
router.get("/", getContracts as any);
router.get("/:id", getContractById as any);
router.patch("/:id/status", updateContractStatus as any);
router.patch("/:id/extend", extendContract as any);

export default router;
