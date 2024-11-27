import express from "express";
import { signup, login, getMe,logout } from "../controllers/auth.controller.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protectedRoute, logout);
router.get("/me", protectedRoute, getMe);

export default router;
