const express = require("express");
const User = require("../models/User");
const { createHash } = require("../utils/hash");
const passport = require("../config/passport");
const router = express.Router();

// Crear usuario
router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, cart, role } =
      req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email ya registrado" });
    const user = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: createHash(password),
      cart,
      role,
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leer todos
router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Leer uno
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "No encontrado" });
  res.json(user);
});

// Actualizar
router.put("/:id", async (req, res) => {
  const { password, ...rest } = req.body;
  let update = { ...rest };
  if (password) update.password = createHash(password);
  const user = await User.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });
  if (!user) return res.status(404).json({ error: "No encontrado" });
  res.json(user);
});

// Eliminar
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "No encontrado" });
    res.json({ status: "Eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
