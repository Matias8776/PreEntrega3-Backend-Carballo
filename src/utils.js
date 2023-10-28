import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import config from './config/config.js';
import nodemailer from 'nodemailer';

const __fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(__fileName);
const PRIVATE_KEY = config.passportSecret;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${__dirname}/public/img`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const uploader = multer({
  storage,
  onError: function (err, next) {
    console.error(err);
    next();
  }
});

export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) =>
  bcrypt.compareSync(password, user.password);

export const generateToken = (user) => {
  const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '30m' });
  return token;
};

export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        let errorMessage = info.message ? info.message : info.toString();

        if (strategy === 'current' && errorMessage === 'jwt expired') {
          errorMessage = 'El token ha expirado';
        }

        if (strategy === 'current' && errorMessage === 'No auth token') {
          errorMessage = 'No se ha enviado el token';
        }

        if (strategy === 'current' && errorMessage === 'invalid token') {
          errorMessage = 'El token es inválido';
        }

        return res
          .status(401)
          .send({ status: 'error', message: [errorMessage] });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
    user: config.email,
    pass: config.emailPassword
  }
});

export const sendPurchaseEmail = async (to, withStock, withoutStock, total, code) => {
  await transport.sendMail({
    from: `Ecommerce <${config.email}>`,
    to: `${to}`,
    subject: 'Resumen de compra',
    html: `
    <section>
      <h1>Compra realizada con éxito</h1>
      <h3>Le acercamos el resumen de la compra realizada en Ecommerce</h3>
      <br>
      <p>Productos comprados:</p>
      <ul>
        ${withStock.map((product) => `<li>${product}</li>`).join('')}
      </ul>
      <br>
      <p>Productos sin stock:</p>
      <ul>
        ${withoutStock.map((product) => `<li>${product}</li>`).join('')}
      </ul>
      <br>
      <p>El total de la compra es de $${total}</p>
      <br>
      <p>Gracias por su compra</p>
      <br>
      <p>Ecommerce</p>
      <br>
      <p>Código de compra: ${code}</p>
    </section>
    `
  });
};

export default __dirname;
