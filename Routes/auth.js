const router = require("express").Router();
const User = require("../Models/User");
const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    // // Encrypt
    password: CryptoJs.AES.encrypt(
      req.body.password,
      process.env.SECRECT_KEY
    ).toString(),
  });
  try {
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (e) {
    res.status(500).json(e);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(401).json("Wrong password or email!");

    // Decrypt
    const bytes = CryptoJs.AES.decrypt(user.password, process.env.SECRECT_KEY);
    const originalPassword = bytes.toString(CryptoJs.enc.Utf8);

    originalPassword !== req.body.password &&
      res.status(401).json("wrong password");

    // token: jwt.sign->creates access token {id:user._id,isAdmin:isAdmin}->hides this info in token
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.SECRECT_KEY,
      { expiresIn: "3d" }
    );


    // as password field is appearing while getting response we need to hide it as:
    const { password, ...others } = user._doc;
    res.status(200).json({...others,accessToken});
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
