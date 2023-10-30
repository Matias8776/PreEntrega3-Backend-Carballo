import { Products } from '../dao/factory.js';
import __dirname, { passportCall, uploader } from '../utils.js';
import path from 'path';

const productManager = new Products();

export const passportAdmin = passportCall('admin');

export const uploaderProduct = uploader.array('thumbnails');

export const getProducts = async (req, res) => {
  const limit = req.query.limit;
  const page = req.query.page;
  const category = req.query.category;
  const disponibility = req.query.disponibility;
  const sort = +req.query.sort;
  const products = await productManager.getProducts(
    limit || 10,
    page || 1,
    category,
    disponibility,
    sort
  );

  res.send({ status: 'success', payload: products });
};

export const getProductById = async (req, res) => {
  const pid = req.params.pid;
  const product = await productManager.getProductById(pid);

  if (!product) {
    res.status(404).send({
      status: 'error',
      message: `No existe el producto con el id ${pid}`
    });
    return;
  }

  res.send(product);
};

export const addProduct = async (req, res) => {
  let { title, description, price, thumbnails, code, stock, status, category } =
    req.body;

  if (req.files) {
    thumbnails = req.files.map((file) => {
      return path.join(__dirname, '/public/img/', file.filename);
    });
  }

  const validationResult = await productManager.addProduct({
    title,
    description,
    price,
    thumbnails,
    code,
    stock,
    status,
    category
  });

  if (!validationResult.success) {
    res.status(409).send({
      status: 'error',
      message: `Error al crear el producto, ${validationResult.message}`
    });
  } else {
    res.send({
      status: 'success',
      message: `Creado correctamente con el Id ${validationResult.id}`
    });
  }
};

export const updateProduct = async (req, res) => {
  const pid = req.params.pid;
  const product = await productManager.getProductById(pid);

  if (!product) {
    res.status(404).send({
      status: 'error',
      message: `No existe el producto con el id ${pid}`
    });
    return;
  }
  const updateProduct = req.body;
  await productManager.updateProduct(product._id, updateProduct);
  const updatedProduct = await productManager.getProductById(pid);
  res.send(updatedProduct);
};

export const deleteProduct = async (req, res) => {
  const pid = req.params.pid;
  const product = await productManager.getProductById(pid);

  if (!product) {
    res.status(404).send({
      status: 'error',
      message: `No existe el producto con el id ${pid}`
    });
    return;
  }

  await productManager.deleteProduct(product._id);
  res.send({ status: 'success' });
};
