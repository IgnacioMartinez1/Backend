const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const router = express.Router();

router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate(
      "products.product"
    );
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).send("Carrito no encontrado");
    cart.products = cart.products.filter(
      (p) => p.product.toString() !== req.params.pid
    );
    await cart.save();

    if (req.accepts("html")) {
      return res.redirect("/carts/" + req.params.cid);
    } else {
      return res.json({ status: "success", message: "Producto eliminado" });
    }
  } catch (error) {
    if (req.accepts("html")) {
      res.status(500).send(error.message);
    } else {
      res.status(500).json({ status: "error", error: error.message });
    }
  }
});

router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).send("Carrito no encontrado");
    const { quantity } = req.body;
    const prodIndex = cart.products.findIndex(
      (p) => p.product.toString() === req.params.pid
    );
    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).send("Producto no encontrado");

    let requestedQty = Number(quantity) || 1;
    let currentQty = prodIndex >= 0 ? cart.products[prodIndex].quantity : 0;
    let maxQty = product.stock;

    let newQty = currentQty + requestedQty;
    if (newQty > maxQty) newQty = maxQty;

    if (prodIndex >= 0) {
      cart.products[prodIndex].quantity = newQty;
    } else {
      cart.products.push({
        product: req.params.pid,
        quantity: Math.min(requestedQty, maxQty),
      });
    }
    await cart.save();
    res.redirect("/carts/" + req.params.cid);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(
      req.params.cid,
      { products: req.body.products },
      { new: true }
    );
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });
    const prod = cart.products.find(
      (p) => p.product.toString() === req.params.pid
    );
    if (!prod)
      return res.status(404).json({
        status: "error",
        error: "Producto no encontrado en el carrito",
      });
    prod.quantity = req.body.quantity;
    await cart.save();
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.post("/:cid/purchase", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate(
      "products.product"
    );
    if (!cart) return res.status(404).send("Carrito no encontrado");

    for (const item of cart.products) {
      const prod = item.product;
      if (prod.stock < item.quantity) {
        return res
          .status(400)
          .send(`No hay suficiente stock para ${prod.title}`);
      }
    }
    for (const item of cart.products) {
      const prod = await Product.findById(item.product._id);
      prod.stock -= item.quantity;
      await prod.save();
    }

    cart.products = [];
    await cart.save();

    res.send(
      "¡Compra finalizada con éxito! El stock fue actualizado y el carrito vaciado."
    );
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
