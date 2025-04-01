const fs = require('fs').promises;

class ProductManager {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async getAllProducts() {
    const data = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(data);
  }

  async getProductById(id) {
    const products = await this.getAllProducts();
    return products.find(product => product.id === id);
  }

  async addProduct(product) {
    const products = await this.getAllProducts();
    const newProduct = { id: Date.now().toString(), ...product };
    products.push(newProduct);
    await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
    return newProduct;
  }

  async updateProduct(id, updates) {
    const products = await this.getAllProducts();
    const index = products.findIndex(product => product.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates, id };
    await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.getAllProducts();
    const filteredProducts = products.filter(product => product.id !== id);
    if (products.length === filteredProducts.length) return false;
    await fs.writeFile(this.filePath, JSON.stringify(filteredProducts, null, 2));
    return true;
  }
}

module.exports = ProductManager;