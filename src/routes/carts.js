const express = require('express');
const CartManager = require('../managers/CartManager');

const router = express.Router();
const cartManager = new CartManager('./data/carts.json');

router.post('/', async (req, res) => {
  const newCart = await cartManager.createCart();
  res.status(201).json(newCart);
});

router.get('/:cid', async (req, res) => {
  const cart = await cartManager.getCartById(req.params.cid);
  if (cart) res.json(cart);
  else res.status(404).json({ error: 'Cart not found' });
});

router.post('/:cid/product/:pid', async (req, res) => {
  const updatedCart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
  if (updatedCart) res.json(updatedCart);
  else res.status(404).json({ error: 'Cart or Product not found' });
});

module.exports = router;