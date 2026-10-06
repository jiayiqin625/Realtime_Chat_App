import type { HydratedDocument } from "mongoose";
import type { UserDocument } from "../model/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<UserDocument>;
    }
  }
}

export {};
