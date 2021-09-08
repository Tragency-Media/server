import jwt from "jsonwebtoken";
const decode = async (req, res, next) => {
  const token = req.header("x-auth-header");
  //   console.log(token);
  if (!token) return res.status(401).json({ msg: "Action Not Authorized" });
  try {
    //   const user = await User.findById()
    const secret = process.env.SECRET;
    const { user } = jwt.verify(token, secret);
    // console.log(decoded);
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ msg: "Token Not Valid" });
  }
};

export default decode;
