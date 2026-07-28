import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { type CustomRequest, type UserPayload } from "../libs/types.ts";

export const authAdmin = (
  req: CustomRequest, // using a custom request
  res: Response,
  next: NextFunction,
) => {
  let UserPayload = (req as CustomRequest).user;
  if (UserPayload?.role === "ADMIN") {
    return res.status(403).json({
      ok: true,
      message: "Only Students can access this API routes",
    });
  }
  next();
};
