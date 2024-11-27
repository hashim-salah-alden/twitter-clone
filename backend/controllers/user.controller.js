import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// models
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }
    res.status(200).json(user);
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const followUnfollowUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userToFollow = await User.findById(id).select("-password");
    const currentUser = await User.findById(req.user._id);

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return next(new ApiError(400, "You can't follow/unfollow yourself"));
    }

    if (!userToFollow || !currentUser) {
      return next(new ApiError(404, "User not found"));
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // this user is already following  :   unfollow hem
      await User.findByIdAndUpdate(id, {
        $pull: { followers: currentUser._id },
      });
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: id },
      });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // this user is not following  :   follow him
      await User.findByIdAndUpdate(id, {
        $push: { followers: currentUser._id },
      });
      await User.findByIdAndUpdate(currentUser._id, {
        $push: { following: id },
      });
      // send notification here
      const newNotification = new Notification({
        from: currentUser._id,
        to: userToFollow._id,
        type: "follow",
      });
      await newNotification.save();

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const getSuggestedUsers = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const usersFollowedByMe = currentUser.following;

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: currentUser._id },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    res.status(200).json(suggestedUsers);
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const updateUser = async (req, res, next) => {
  const { username, fullname, email, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  try {
    let user = await User.findById(req.user._id);
    if (!user) return next(new ApiError(404, "User not found"));

    if (
      (newPassword && !currentPassword) ||
      (!newPassword && currentPassword)
    ) {
      return next(
        new ApiError(
          400,
          "Please provide both current password and new password"
        )
      );
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return next(new ApiError(400, "Current password is incorrect"));
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};
