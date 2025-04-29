const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const productsFilePath = path.join(__dirname, "../data/products.json");

// Leer productos desde el archivo JSON
const readProducts = () => {
  if (!fs.existsSync(productsFilePath)) {
    return []; // Si el archivo no existe, retorna un array vacío
  }
  const data = fs.readFileSync(productsFilePath, "utf-8");
  return JSON.parse(data);
};

// Guardar productos en el archivo JSON
const saveProducts = (products) => {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

router.get("/", (req, res) => {
  try {
    const products = readProducts();
    res.status(200).send(products);
  } catch (error) {
    console.error("Error al leer los productos:", error);
    res.status(500).send({ error: "Error al leer los productos" });
  }
});
// POST: Agregar un nuevo producto
router.post("/", (req, res) => {
  try {
    const products = readProducts();
    const newProduct = {
      id: Date.now().toString(),
      ...req.body,
    };

    products.push(newProduct);
    saveProducts(products);

    // Emitir evento de actualización de productos
    const io = req.app.get("io"); // Obtén la instancia de Socket.IO
    io.emit("updateProducts", products);

    res.status(201).send({ message: "Producto agregado", product: newProduct });
  } catch (error) {
    console.error("Error al agregar el producto:", error);
    res.status(500).send({ error: "Error al agregar el producto" });
  }
});

module.exports = router;
