import jwt from "jsonwebtoken";
const decode = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    //   console.log(token);
    if (!token)
      return res
        .status(401)
        .json({ errors: [{ msg: "Action Not Authorized" }] });
    //   const user = await User.findById()
    const secret = process.env.SECRET;
    const { user } = jwt.verify(token, secret);
    // console.log(decoded);
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ errors: [{ msg: "Token Not Valid" }] });
  }
};

export default decode;
