import express from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import {
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  createPosts,
  likeUnlikePost,
  CommentOnPost,
  deletePost,
} from "../controllers/posts/post.controller.js";
const router = express.Router();

router.get("/all", protectedRoute, getAllPosts);
router.get("/following", protectedRoute, getFollowingPosts);
router.get("/liked/:id", protectedRoute, getLikedPosts);
router.get("/user/:username", protectedRoute, getUserPosts);

router.post("/create", protectedRoute, createPosts);
router.post("/like/:id", protectedRoute, likeUnlikePost);
router.post("/comment/:id", protectedRoute, CommentOnPost);
router.delete("/delete/:id", protectedRoute, deletePost);

export default router;
