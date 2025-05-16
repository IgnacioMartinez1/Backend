const express = require("express");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const router = express.Router();

let testCartId = null;

router.use((req, res, next) => {
  testCartId = req.app.get("testCartId");
  next();
});

router.get("/products", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const sort =
    req.query.sort === "asc" ? 1 : req.query.sort === "desc" ? -1 : null;
  const query = req.query.query;

  let filter = {};
  if (query) {
    if (query === "true" || query === "false") {
      filter.status = query === "true";
    } else {
      filter.category = query;
    }
  }

  const totalDocs = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalDocs / limit);
  let productsQuery = Product.find(filter);
  if (sort) productsQuery = productsQuery.sort({ price: sort });
  const products = await productsQuery.skip((page - 1) * limit).limit(limit);

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  const cartId = req.app.get("testCartId");

  res.render("products", {
    products,
    totalPages,
    prevPage,
    nextPage,
    page,
    hasPrevPage: prevPage !== null,
    hasNextPage: nextPage !== null,
    prevLink: prevPage
      ? `/products?page=${prevPage}&limit=${limit}${
          sort ? `&sort=${req.query.sort}` : ""
        }${query ? `&query=${query}` : ""}`
      : null,
    nextLink: nextPage
      ? `/products?page=${nextPage}&limit=${limit}${
          sort ? `&sort=${req.query.sort}` : ""
        }${query ? `&query=${query}` : ""}`
      : null,
    cartId,
  });
});

router.get("/products/:pid", async (req, res) => {
  const product = await Product.findById(req.params.pid);
  res.render("productDetail", { product, cartId: testCartId });
});

router.get("/carts/:cid", async (req, res) => {
  let cart = await Cart.findById(req.params.cid).populate("products.product");

  if (!cart) {
    cart = { _id: req.params.cid, products: [] };
  }

  if (!Array.isArray(cart.products)) {
    cart.products = [];
  }
  res.render("cart", { cart });
});

module.exports = router;
