import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import type { User, CustomRequest } from "../libs/types.ts";

// import database
import { users, reset_users } from "../db/db.ts";
import { success } from "zod";
import { authenticateToken } from "../middlewares/authenMiddleware.ts";

const router = Router();

// GET /api/v2/users
router.get("/", (req: Request, res: Response) => {
  try {
    // return all users
    return res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/v2/users/login
router.post("/login", (req: Request, res: Response) => {
  // 1. get username and password from body
  let body = req.body;
  let userLogin: User = body;

  // 2. check if user exists (search with username & password in DB)
  let found = users.find(
    (u) =>
      u.username === userLogin.username && u.password === userLogin.password,
  );
  if (found === undefined) {
    return res.json(404).json({
      success: false,
      message: "No user",
    });
  }
  const jwt_secret = process.env.JWT_SECRET || "this_is_my_secret";
  const token = jwt.sign(
    {
      username: userLogin.username,
      studentId: found.studentId,
      role: found.role,
      ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    },
    jwt_secret,
    { expiresIn: "30m" },
  );
  return res.status(200).json({
    success: true,
    message: "Login successful",
    token,
  });
});

// POST /api/v2/users/logout
router.post(
  "/logout",
  authenticateToken,
  (req: CustomRequest, res: Response) => {
    // 1. check Request if "authorization" header exists
    //    and container "Bearer ...JWT-Token..."

    // 2. extract the "...JWT-Token..." if available

    // 3. verify token using JWT_SECRET_KEY and get payload (username, studentId and role)

    // 4. check if user exists (search with username)

    // 5. proceed with logout process and return HTTP response
    //    (optional: remove the token from User data)

    const payload_user = req.user;
    const payload_token = req.token;
    const user = users.find((u) => u.username === payload_user?.username);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 5. proceed with logout process and return HTTP response
    //    (optional: remove the token from User data)
    user.tokens = user.tokens?.filter((Token) => Token !== payload_token);
    // if (!user.tokens) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "User Not found",
    //   });
    // }
    return res.status(200).json({
      success: true,
      message: "Sign out successful",
    });

    return res.status(500).json({
      success: false,
      message: "POST /api/v2/users/logout has not been implemented yet",
    });
  },
);

// POST /api/v2/users/reset
router.post("/reset", (req: Request, res: Response) => {
  try {
    reset_users();
    return res.status(200).json({
      success: true,
      message: "User database has been reset",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

export default router;
