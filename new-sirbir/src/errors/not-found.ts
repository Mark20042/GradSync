import { StatusCodes } from "http-status-codes";
import { CustomAPIError } from "./custom-error.js";

export class NotFoundError extends CustomAPIError {
  constructor(message: string) {
    super(message, StatusCodes.NOT_FOUND);
  }
}
