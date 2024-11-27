import {
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
} from "./getPosts.controller.js";
import { ApiError } from "../../utils/apiError.js";

import { v2 as cloudinary } from "cloudinary";

// models
import Post from "../../models/post.model.js";
import User from "../../models/user.model.js";
import Notification from "../../models/notification.model.js";

export const createPosts = async (req, res, next) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const creator = await User.findById(req.user._id);
    if (!creator) return next(new ApiError(404, "User not found"));

    if (!text && !img) {
      return next(new ApiError(400, "Post must have text or image"));
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      creator: creator._id.toString(),
      text,
      img,
    });

    await newPost.save();

    res.status(200).json({ newPost });
  } catch (error) {
    return next(new ApiError(500, "Internal server error"));
  }
};

export const likeUnlikePost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return next(new ApiError(404, "Post not found"));
    }



    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      // like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const newNotification = new Notification({
        from: userId,
        to: post.creator,
        type: "like",
      });
      await newNotification.save();

      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    return next(new ApiError(500, "Internal server error"));
  }
};

export const CommentOnPost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;
    const { text } = req.body;

    if (!text) {
      return next(new ApiError(400, "Text field is required"));
    }

    const post = await Post.findById(postId);

    if (!post) {
      return next(new ApiError(404, "Post not found"));
    }

    const comment = { user: userId, text };

    post.comments.push(comment);
    await post.save();

    const updatedComment = post.comments;

    res.status(200).json(updatedComment);
  } catch (error) {
    return next(new ApiError(500, "Internal server error"));
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new ApiError(404, "Post not found"));
    }

    if (post.creator.toString() !== userId.toString()) {
      return next(
        new ApiError(401, "You are not authorized to delete this post")
      );
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return next(new ApiError(500, "Internal server error"));
  }
};

export { getAllPosts, getFollowingPosts, getLikedPosts, getUserPosts };
