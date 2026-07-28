import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { type CustomRequest, type UserPayload } from "../libs/types.ts";
import { users } from "../db/db.ts";

export const checkRole = (
  req: CustomRequest, // using a custom request
  res: Response,
  next: NextFunction,
) => {
  let UserPayload = (req as CustomRequest).user;
  let found = users.find(
    (u) => u.username === UserPayload?.username && u.role === UserPayload?.role,
  );
  if (found === undefined) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }
  next();
};
