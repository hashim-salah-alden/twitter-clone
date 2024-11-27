import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/apiError.js";

import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export const signup = async (req, res, next) => {
  try {
    const { username, fullname, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError(400, "Invalid email format"));
    }

    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingUser || existingEmail) {
      return next(new ApiError(400, "The UserName Or Email is already taken"));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      fullname,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      // const { password: savedPassword, ...newUser } = newUser._doc;

      res.status(201).json({ ...newUser._doc, password: null });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    return next(new ApiError(500, "Internal Server Error"));
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return next(new ApiError(400, "Invalid username or password"));
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({ ...user._doc, password: null });
  } catch (error) {
    return next(new ApiError(500, "Internal Server Error"));
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    return next(new ApiError(500, "Internal Server Error"));
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return next(new ApiError(500, "Internal Server Error"));
  }
};
