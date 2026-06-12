import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
  try {
    const aToken = req.header("aToken");

    if (!aToken) {
      return res.json({
        success: false,
        message: "Unauthorized access login again...!",
      });
    }

    const decoded = jwt.verify(aToken, process.env.JWT_SECRET);

    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.json({
        success: false,
        message: "Unauthorized access ...!",
      });
    }

    next();
  } catch (error) {
    return res.json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authAdmin;
