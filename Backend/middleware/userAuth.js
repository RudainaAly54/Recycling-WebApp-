
import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.json({ success: false, message: "Not Authorized, Login again" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      // safe place to store userId
      req.userId = tokenDecode.id;
    } else {
      return res.json({ success: false, message: "Not Authorized, Login again" });
    }

    next(); // go to controller
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default userAuth;
