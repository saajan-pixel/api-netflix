const router = require("express").Router();
const User = require("../Models/User");
const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Create a new user
 *     description: Endpoint to create a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Name of the user
 *               email:
 *                 type: string
 *                 description: Email of the user
 *               password:
 *                 type: string
 *                 description: password of the user
 *             example:
 *               username: John Doe
 *               email: john.doe@example.com
 *               password: string
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID of the created user
 *                 name:
 *                   type: string
 *                   description: Name of the created user
 *                 email:
 *                   type: string
 *                   description: Email of the created user
 *       400:
 *         description: Invalid input
 */
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

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: login user
 *     description: login user.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user
 *               password:
 *                 type: string
 *                 description: password of the user
 *             example:
 *               email: john.doe@example.com
 *               password: string
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID of the created user
 *                 name:
 *                   type: string
 *                   description: Name of the created user
 *                 email:
 *                   type: string
 *                   description: Email of the created user
 *       400:
 *         description: Invalid input
 */
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
    res.status(200).json({ ...others, accessToken });
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
