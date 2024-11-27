import Post from "../../models/post.model.js";
import User from "../../models/user.model.js";

import { ApiError } from "../../utils/apiError.js";

export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "creator",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (!posts) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const getFollowingPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next(new ApiError(404, "User not found"));

    const followingUsers = user.following;

    const feedPosts = await Post.find({ creator: { $in: followingUsers } })
      .sort({ createdAt: -1 })
      .populate({
        path: "creator",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (!feedPosts) {
      return res.status(200).json([]);
    }

    res.status(200).json(feedPosts);
  } catch (error) {
    return next(new ApiError(500, "Internal server error"));
  }
};

export const getLikedPosts = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return next(new ApiError(404, "User not found"));

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .sort({ createdAt: -1 })
      .populate({
        path: "creator",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (!likedPosts) {
      return res.status(200).json([]);
    }
    res.status(200).json(likedPosts);
  } catch (error) {
    return next(new ApiError(500, "Internal server error"));
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return next(new ApiError(404, "User not found"));

    const userPosts = await Post.find({ creator: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "creator",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (!userPosts) {
      return res.status(200).json([]);
    }
    res.status(200).json(userPosts);
  } catch (error) {
    return next(new ApiError(500, "Internal server error"));
  }
};
