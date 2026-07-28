import {
  response,
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  zCourseId,
  zCoursePostBody,
  zCoursePutBody,
} from "../libs/zodValidators.ts";

import type { Student, Course, CustomRequest } from "../libs/types.ts";
import { enrollments, students } from "../db/db.ts";
import { authenticateToken } from "../middlewares/authenMiddleware.ts";
import { authAdmin } from "../middlewares/authenAdminLevel.ts";
import { checkRole } from "../middlewares/checkRole.ts";
// import database
import { courses } from "../db/db.ts";

const router = Router();

router.get(
  "/",
  authenticateToken,
  checkRole,
  (req: Request, res: Response, next: NextFunction) => {
    let UserPayload = (req as CustomRequest).user;
    if (UserPayload?.role !== "ADMIN") {
      next();
    }
    return res.status(200).json({
      ok: true,
      enrollments: enrollments,
    });
  },
);

router.get("/", (req: Request, res: Response) => {
  let UserPayload = (req as CustomRequest).user;
  return res.status(200).json({
    ok: true,
    enrollments: enrollments.filter(
      (e) => e.studentId === UserPayload?.studentId,
    ),
  });
});

router.post(
  "/",
  authenticateToken,
  checkRole,
  authAdmin,
  (req: Request, res: Response) => {
    return res.status(200).json({
      ok: true,
      message: "isStudent",
    });
  },
);

router.delete(
  "/",
  authenticateToken,
  checkRole,
  authAdmin,
  (req: Request, res: Response) => {
    let cId = req.body.courseId;
    let s = zCourseId.safeParse(cId);
    if (!s.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: s.error.issues[0]?.message,
      });
    }
    let UserPayload = (req as CustomRequest).user;
    let index = enrollments.findIndex(
      (e) => e.studentId === UserPayload?.studentId && e.courseId === cId,
    );
    if (index === -1) {
      return res.status(404).json({
        ok: false,
        message: "You has not regestier that course any more",
      });
    }
    enrollments.splice(index, 1);
    return res.status(200).json({
      ok: true,
      message: "You has dropped from this course. See you next semeter",
    });
  },
);

export default router;
