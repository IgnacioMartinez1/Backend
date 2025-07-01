const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
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

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    res.json({
      status: "success",
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage: prevPage !== null,
      hasNextPage: nextPage !== null,
      prevLink: prevPage
        ? `${baseUrl}?page=${prevPage}&limit=${limit}${
            sort ? `&sort=${req.query.sort}` : ""
          }${query ? `&query=${query}` : ""}`
        : null,
      nextLink: nextPage
        ? `${baseUrl}?page=${nextPage}&limit=${limit}${
            sort ? `&sort=${req.query.sort}` : ""
          }${query ? `&query=${query}` : ""}`
        : null,
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);

    req.app.get("io").emit("updateProducts", await Product.find());
    res.status(201).json({ message: "Producto agregado", product: newProduct });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

module.exports = router;
