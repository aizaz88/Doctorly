import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    const uToken = req.header("uToken");

    if (!uToken) {
      return res.json({
        success: false,
        message: "Unauthorized access - login required",
      });
    }

    const decoded = jwt.verify(uToken, process.env.JWT_SECRET);
    req.userId = decoded.id;

    next();
  } catch (error) {
    return res.json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authUser;
