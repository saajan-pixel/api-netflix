const jwt = require("jsonwebtoken");

function verify(req, res, next) {
  // in postman: at Headers -> key:token value:Bearer tokenValue::::
  const authHeader = req.headers.token;
  //   console.log("AuthHeader", authHeader);

  if (authHeader) {
    // for eg: authHeader=Bearer ju89000rururuuuu... =>splitted by space and taking [1] which is ju89000rururuuuu
    const token = authHeader.split(" ")[1];

    // (err,user) user chai auth.js ko login ma token sign grda hamile { id: user._id, isAdmin: user.isAdmin,} user greko xa tai ya declare greko ho
    jwt.verify(token, process.env.SECRECT_KEY, (err, user) => {
      if (err) {
        res.status(403).json("Token is not valid!");
      } else {
        req.user = user;

        // next le chai sidai routing ma lanxa
        next();
      }
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
}

module.exports = verify;
