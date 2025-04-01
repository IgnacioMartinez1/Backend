const express = require('express');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/carts');

const app = express();
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});