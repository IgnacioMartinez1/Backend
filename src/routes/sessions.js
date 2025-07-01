const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createHash, isValidPassword } = require("../utils/hash");
const passport = require("passport");
const router = express.Router();

const JWT_SECRET = "jwtSecret";

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email ya registrado" });
    const user = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: createHash(password),
    });
    res.status(201).json({ status: "Registrado", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ error: info?.message || "Login inválido" });
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  })(req, res, next);
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user._id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
      cart: req.user.cart,
      role: req.user.role,
    });
  }
);

module.exports = router;
