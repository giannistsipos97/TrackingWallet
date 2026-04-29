import { User } from "../models/User"; // Adjust path to your User model

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        // Add any other properties the authMiddleware attaches (e.g., email, role)
      };
    }
  }
}
