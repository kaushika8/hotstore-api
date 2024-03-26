import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  const token = req.headers;
  if (!token) return next(errorHandler(401, "Unauthorized"));
  jwt.verify(
    token?.authorization?.slice(7, token?.authorization?.length),
    process.env.JWT_SECRET,
    (err, user) => {
      if (err) return next(errorHandler(403, "Forbidden"));
      req.user = user;
      next();
    }
  );
};
