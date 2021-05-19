const express = require("express"); // skapar Function för inlogningen genom att kalla Express router
const router = express.Router();
const UserModel = require("../models/UserModel"); // Kallar users Model
const FollowerModel = require("../models/FollowerModel");
const jwt = require("jsonwebtoken"); // genom denna vi implementerar logiken bakom att skicka JSON Web Tokens från servern till en klient
const bcrypt = require("bcryptjs"); // kallar bcrypt för random Lösenord
const isEmail = require("validator/lib/isEmail"); // Email validation
const authMiddleware = require("../middleware/authMiddleware"); // Kallar authMiddleware för Athentication

// Inlogning genom authMiddleware
router.get("/", authMiddleware, async (req, res) => {
  const { userId } = req;

  try {
    const user = await UserModel.findById(userId);

    const userFollowStats = await FollowerModel.findOne({ user: userId });

    return res.status(200).json({ user, userFollowStats });
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});
// vi Kör function post så att logga in om user är samma user som har registerat sig
router.post("/", async (req, res) => {
  const { email, password } = req.body.user;

  if (!isEmail(email)) return res.status(401).send("Invalid Email");

  if (password.length < 6) {
    return res.status(401).send("Password must be atleast 6 characters");
  }

  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).send("Invalid Credentials");
    }

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      return res.status(401).send("Invalid Credentials");
    }

    const payload = { userId: user._id };
    jwt.sign(payload, process.env.jwtSecret, { expiresIn: "2d" }, (err, token) => {
      if (err) throw err;
      res.status(200).json(token);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

module.exports = router;
