const express = require('express');
const ProductManager = require('../managers/ProductManager');

const router = express.Router();
const productManager = new ProductManager('./data/products.json');

router.get('/', async (req, res) => {
  const products = await productManager.getAllProducts();
  res.json(products);
});

router.get('/:pid', async (req, res) => {
  const product = await productManager.getProductById(req.params.pid);
  if (product) res.json(product);
  else res.status(404).json({ error: 'Product not found' });
});

router.post('/', async (req, res) => {
  const newProduct = await productManager.addProduct(req.body);
  res.status(201).json(newProduct);
});

router.put('/:pid', async (req, res) => {
  const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
  if (updatedProduct) res.json(updatedProduct);
  else res.status(404).json({ error: 'Product not found' });
});

router.delete('/:pid', async (req, res) => {
  const success = await productManager.deleteProduct(req.params.pid);
  if (success) res.json({ message: 'Product deleted' });
  else res.status(404).json({ error: 'Product not found' });
});

module.exports = router;