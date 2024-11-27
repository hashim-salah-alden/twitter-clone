import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return next(new ApiError(401, "Unauthorized: No Token Provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new ApiError(401, "Unauthorized: Invalid Token"));
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(500, "Internal Server Error"));
  }
};
