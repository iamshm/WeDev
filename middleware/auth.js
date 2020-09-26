const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  //Get token from header
  const token = req.header("x-auth-token");

  //check if no token
  if (!token) return res.status(401).json("No token, Authorization Denied");
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;
    console.log(req.user.id);
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token Invalid" });
  }
};
