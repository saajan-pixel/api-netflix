const router = require("express").Router();
const User = require("../Models/User");
const CryptoJs = require("crypto-js");
const verify = require("./VerifyToken");

// UPDATE
router.put("/:id", verify, async (req, res) => {
  // console.log("userReq",req.user) came from verifyToken line no.17
  if (req.user.id === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      req.body.password = CryptoJs.AES.encrypt(
        req.body.password,
        process.env.SECRECT_KEY
      ).toString();
    }

    try {
      // new:true will return the updated data otherwise it will show the previous data but the data is updated at database
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    //   403 forbidden
    res.status(403).json("You can update only your account !");
  }
});
// DELETE
router.delete("/:id", verify, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("User has been deleted !");
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    res.status(403).json("You can delete only your account!");
  }
});

// GET
// dont need to verify eveyone can reach the user
router.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    // hiding password
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (e) {
    res.status(500).json(e);
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a list of users
 *     description: Retrieve a list of users from the database.
 *     responses:
 *       200:
 *         description: Successful response with a list of users.
 */
router.get("/", verify, async (req, res) => {
  const query = req.query.new;
  if (req.user.isAdmin) {
    try {
      const users = query
        ? await User.find().sort({ _id: -1 }).limit(5)
        : await User.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed to see all users!");
  }
});

// GET USER STATS(PER MONTH)
router.get("/stats", async (req, res) => {
  // const today = new Date();
  // const latYear = today.setFullYear(today.setFullYear() - 1);
  try {
    const data = await User.aggregate([
      {
        // $month is inbuilt in mongodb we can use $year if we requier
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          // _id:mandatory name,total can be of any name
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
