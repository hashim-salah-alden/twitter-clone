import express from "express";
import {
  getNotifications,
  deleteNotifications,
} from "../controllers/notification.controller.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";

const router = express.Router();

router.get("/", protectedRoute, getNotifications);
router.delete("/delete", protectedRoute, deleteNotifications);

export default router;
