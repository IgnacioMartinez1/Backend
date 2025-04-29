const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { engine } = require("express-handlebars");
const path = require("path");

const productRoutes = require("./routes/products");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Configurar Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Ruta para la vista "realTimeProducts"
app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});

// Configurar rutas de productos
app.set("io", io); // Hacer que la instancia de Socket.IO esté disponible en toda la app
app.use("/api/products", productRoutes);

// Configurar Socket.IO
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");
});

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
