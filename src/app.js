const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { engine } = require("express-handlebars");
const path = require("path");
const mongoose = require("mongoose");
const Cart = require("./models/Cart");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");

const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/carts");

const userRoutes = require("./routes/users");
const sessionRoutes = require("./routes/sessions");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const handlebars = require("handlebars");

app.engine(
  "handlebars",
  engine({
    handlebars: handlebars,
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
    helpers: {
      multiply: (a, b) => a * b,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

mongoose
  .connect("mongodb://localhost:27017/EntregaFinal", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error de conexión a MongoDB:", err));

app.set("io", io);

app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(flash());
const initializePassport = require("./config/passport");
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);

app.get("/", (req, res) => {
  res.render("home", {
    error: req.flash("error"),
    success: req.flash("success"),
    user: req.user,
  });
});

app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});

app.post(
  "/register",
  passport.authenticate("register", {
    successRedirect: "/",
    failureRedirect: "/",
    failureFlash: true,
  })
);

app.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/",
    failureFlash: true,
  })
);

// Logout
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");
});

mongoose.connection.once("open", async () => {
  let cart = await Cart.findOne();
  if (!cart) {
    cart = await Cart.create({ products: [] });
    console.log("Carrito de prueba creado:", cart._id);
  } else {
    console.log("Carrito de prueba existente:", cart._id);
  }
  app.set("testCartId", cart._id.toString());

  const PORT = 8080;
  httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
});
