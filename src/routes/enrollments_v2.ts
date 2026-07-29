import { Router, type Request, type Response } from "express";
import { zCourseId } from "../libs/zodValidators.ts";

import type { CustomRequest, Enrollment } from "../libs/types.ts";
import { enrollments } from "../db/db.ts";
import { authenticateToken } from "../middlewares/authenMiddleware.ts";
import { authAdmin } from "../middlewares/authenAdminLevel.ts";

const router = Router();

router.get("/", authenticateToken, (req: Request, res: Response) => {
  try {
    let UserPayload = (req as CustomRequest).user;
    if (UserPayload?.role !== "ADMIN") {
      return res.status(200).json({
        ok: true,
        enrollments: enrollments.filter(
          (e) => e.studentId === UserPayload?.studentId,
        ),
      });
    }
    return res.status(200).json({
      ok: true,
      enrollments: enrollments,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

router.post(
  "/",
  authenticateToken,
  authAdmin,
  (req: Request, res: Response) => {
    try {
      let User = (req as CustomRequest).user;
      let body = req.body.courseId;
      let UserEnroll = zCourseId.safeParse(body);
      if (!UserEnroll.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: UserEnroll.error.issues[0]?.message,
        });
      }
      if (
        enrollments.find(
          (e) =>
            e.courseId === UserEnroll.data && e.studentId === User?.studentId,
        ) === undefined
      ) {
        let p: Enrollment = {
          studentId: User?.studentId!,
          courseId: UserEnroll.data,
        };
        enrollments.push(p);
        return res.status(200).json({
          ok: true,
          message: "Your enrollments had been added",
          enrollments: enrollments.filter(
            (e) => e.studentId === User?.studentId,
          ),
        });
      }
      return res.status(400).json({
        ok: false,
        message: "You had been added that coures already",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Somthing is wrong, please try again",
        error: err,
      });
    }
  },
);

router.delete(
  "/",
  authenticateToken,
  authAdmin,
  (req: Request, res: Response) => {
    try {
      let cId = req.body.courseNo;
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
        return res.status(400).json({
          ok: false,
          message: "You has not regestier that course any more",
        });
      }
      enrollments.splice(index, 1);
      return res.status(200).json({
        ok: true,
        message: "You has dropped from this course. See you next semeter",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Somthing is wrong, please try again",
        error: err,
      });
    }
  },
);

export default router;
