import mongoose from 'mongoose';
import config from '../config/config.js';

const mongoURL = config.mongoUrl;

export let Products;
export let Carts;

switch (config.persistence) {
  case 'MONGO': {
    mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    const { default: ProductsMongo } = await import('./mongoDb/ProductManager.js');
    const { default: CartsMongo } = await import('./mongoDb/CartManager.js');
    Products = ProductsMongo;
    Carts = CartsMongo;
    break;
  }
  case 'FILE': {
    const { default: ProductsFile } = await import('./fileSystem/controllers/ProductManager.js');
    const { default: CartsFile } = await import('./fileSystem/controllers/CartManager.js');
    Products = ProductsFile;
    Carts = CartsFile;
    break;
  }
}
