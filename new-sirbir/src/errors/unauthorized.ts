import { StatusCodes } from "http-status-codes";
import { CustomAPIError } from "./custom-error.js";

export class UnauthorizedError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.FORBIDDEN);
  }
}
