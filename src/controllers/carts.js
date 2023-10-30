import ticketModel from '../dao/models/tickets.js';
import { sendPurchaseEmail } from '../utils.js';
import { Carts, Products, cartProducts } from '../dao/factory.js';

const cartManager = new Carts();
const productManager = new Products();

export const addCart = async (req, res) => {
  const cart = await cartManager.addCart();

  res.send({ status: 'success', message: `Creado con el id: ${cart._id}` });
};

export const getCarts = async (req, res) => {
  const carts = await cartManager.getCarts();

  if (carts.length === 0) {
    res.status(404).send({
      status: 'error',
      message: 'No existen carritos'
    });
    return;
  }

  res.send(carts);
};

export const getCartById = async (req, res) => {
  const cid = req.params.cid;
  const cart = await cartManager.getCartById(cid);

  if (!cart) {
    res.status(404).send({
      status: 'error',
      message: `No existe el carrito con el id ${cid}`
    });
  } else if (cart.products.length === 0) {
    res.send('El carrito esta vacío');
  } else {
    res.send(cart);
  }
};

export const addProductToCart = async (req, res) => {
  const pid = req.params.pid;
  const cid = req.params.cid;
  const product = await productManager.getProductById(pid);
  const cart = await cartManager.getCartById(cid);

  if (!product) {
    res.status(404).send({
      status: 'error',
      message: `No existe el producto con el id ${pid}`
    });
    return;
  }

  if (!cart) {
    res.status(404).send({
      status: 'error',
      message: `No existe el carrito con el id ${cid}`
    });
    return;
  }
  await cartManager.addProductToCart(cid, pid);

  res.send({ status: 'success' });
};

export const deleteProductInCart = async (req, res) => {
  const pid = req.params.pid;
  const cid = req.params.cid;
  const product = await productManager.getProductById(pid);
  const cart = await cartManager.getCartById(cid);
  const productsInCart = await cartProducts(cart);

  if (!product) {
    res.status(404).send({
      status: 'error',
      message: `No existe el producto con el id ${pid}`
    });
    return;
  }

  if (!cart) {
    res.status(404).send({
      status: 'error',
      message: `No existe el carrito con el id ${cid}`
    });
    return;
  }

  const productIndex = productsInCart.findIndex(
    (product) => product._id._id == pid
  );

  if (productIndex === -1) {
    res.status(404).send({
      status: 'error',
      message: 'Producto no encontrado en el carrito'
    });
    return;
  }

  await cartManager.deleteProductInCart(cart._id, product._id);

  res.send({ status: 'success' });
};

export const updateCart = async (req, res) => {
  const cid = req.params.cid;
  const cart = await cartManager.getCartById(cid);
  if (!cart) {
    res.status(404).send({
      status: 'error',
      message: `No existe el carrito con el id ${cid}`
    });
    return;
  }

  const updateCart = req.body;
  const errors = [];

  for (const prod of updateCart) {
    const existProd = await productManager.getProductById(prod._id._id);
    if (!existProd) {
      errors.push({
        status: 'error',
        message: `No existe el producto con el id ${prod._id._id}`
      });
    }
  }

  if (errors.length > 0) {
    res.status(404).send(errors);
    return;
  }

  await cartManager.updateCart(cart._id, updateCart);
  const updatedCart = await cartManager.getCartById(cid);
  res.send(updatedCart);
};

export const updateProductQuantityInCart = async (req, res) => {
  const pid = req.params.pid;
  const cid = req.params.cid;
  const product = await productManager.getProductById(pid);
  const cart = await cartManager.getCartById(cid);

  if (!product) {
    res.status(404).send({
      status: 'error',
      message: `No existe el producto con el id ${pid}`
    });
    return;
  }

  if (!cart) {
    res.status(404).send({
      status: 'error',
      message: `No existe el carrito con el id ${cid}`
    });
    return;
  }

  const productIndex = cart.products.findIndex(
    (product) => product._id._id == pid
  );

  if (productIndex === -1) {
    res.status(404).send({
      status: 'error',
      message: 'Producto no encontrado en el carrito'
    });
    return;
  }

  const updateQuantity = req.body;
  await cartManager.updateProductQuantityInCart(
    cart._id,
    product._id,
    updateQuantity
  );
  const updatedCart = await cartManager.getCartById(cid);
  res.send(updatedCart);
};

export const deleteProductsInCart = async (req, res) => {
  const cid = req.params.cid;
  const cart = await cartManager.getCartById(cid);

  if (!cart) {
    res.status(404).send({
      status: 'error',
      message: `No existe el carrito con el id ${cid}`
    });
    return;
  }

  await cartManager.deleteProductsInCart(cart._id);
  res.send({ status: 'success' });
};

export const purchase = async (req, res) => {
  const cid = req.params.cid;
  const cart = await cartManager.getCartById(cid);
  const products = await cartProducts(cart);

  if (!cart) {
    res.status(404).send({
      status: 'error',
      message: `No existe el carrito con el id ${cid}`
    });
    return;
  }

  const withStock = [];
  const withoutStock = [];
  let totalPurchase = 0;

  for (const product of products) {
    if (product._id.stock > 0) {
      const newQuantity = { stock: product._id.stock - product.quantity };
      await productManager.updateProduct(product._id._id, newQuantity);
      await cartManager.deleteProductInCart(cid, product._id._id);
      const total = product._id.price * product.quantity;
      withStock.push(
        `${product._id.title} x ${product.quantity} = ${parseFloat(
          total.toFixed(2)
        )}`
      );
      totalPurchase += total;
    } else {
      withoutStock.push(`${product._id.title} x ${product.quantity}`);
    }
  }

  const ticket = {
    code: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
    amount: parseFloat(totalPurchase.toFixed(2)),
    purchaser: req.user.user.email
  };

  await ticketModel.create(ticket);

  await sendPurchaseEmail(
    req.user.user.email,
    withStock,
    withoutStock,
    ticket.amount,
    ticket.code
  );

  res.send({
    status: 'success',
    message: `Se completo la compra con éxito de los siguientes productos: (${withStock}) por un total de $${ticket.amount} y por falta de stock los siguientes productos van a quedar en el carrito: (${withoutStock})`
  });
};
