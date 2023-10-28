import passport from 'passport';
import usersModel from '../dao/models/users.js';
import { createHash, generateToken, passportCall } from '../utils.js';
import config from '../config/config.js';
import UserDTO from '../dao/DTOs/Users.js';

export const passportLogin = passport.authenticate('login', {
  failureRedirect: '/api/sessions/faillogin',
  failureMessage: true
});

export const passportRegister = passport.authenticate('register', {
  failureRedirect: '/api/sessions/failregister',
  failureMessage: true
});

export const passportGithub = passport.authenticate('github', {
  scope: ['user: email']
});

export const passportGithubCallback = passport.authenticate('github', {
  failureRedirect: '/api/sessions/faillogin'
});

export const passportCurrent = passportCall('current');

export const login = async (req, res) => {
  if (!req.user) {
    return res
      .status(400)
      .send({ status: 'error', message: 'Credenciales inválidas' });
  }
  if (req.user.email === config.adminName) {
    req.session.user = {
      name: 'Administrador',
      email: req.user.email,
      age: 35,
      role: 'admin',
      cart: '64fda47eecb725fd4fc1639a'
    };
    const token = generateToken(req.session.user);
    res
      .cookie('coderCookie', token, {
        httpOnly: true
      })
      .send({ status: 'success', payload: req.session.user });
  } else {
    req.session.user = {
      name: `${req.user.first_name} ${req.user.last_name}`,
      email: req.user.email,
      age: req.user.age,
      role: req.user.role,
      cart: req.user.cart
    };
    const token = generateToken(req.session.user);
    res
      .cookie('coderCookie', token, {
        httpOnly: true
      })
      .send({ status: 'success', payload: req.session.user });
  }
};

export const failLogin = (req, res) => {
  const message = req.session.messages;
  res.status(400).send({
    status: 'error',
    message
  });
};

export const register = async (req, res) => {
  res.send({
    status: 'success',
    message: 'Usuario registrado correctamente',
    payload: req.user._id
  });
};

export const failRegister = (req, res) => {
  const message = req.session.messages;
  res.status(400).send({
    status: 'error',
    message
  });
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al destruir la sesión:', err);
    }
    res.clearCookie('coderCookie');
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};

export const github = async (req, res) => {};

export const githubCallback = async (req, res) => {
  req.session.user = {
    name: `${req.user.first_name} ${req.user.last_name}`,
    email: req.user.email || 'Sin email',
    age: req.user.age,
    role: req.user.role,
    cart: req.user.cart
  };
  const token = generateToken(req.session.user);
  res
    .cookie('coderCookie', token, {
      httpOnly: true
    })
    .redirect('/products');
};

export const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ status: 'error', message: 'Faltan datos' });
  }
  const user = await usersModel.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .send({ status: 'error', message: 'No existe el usuario' });
  }
  const passwordHash = createHash(password);
  await usersModel.updateOne({ email }, { $set: { password: passwordHash } });
  res.send({
    status: 'success',
    message: 'Contraseña actualizada correctamente'
  });
};

export const current = (req, res) => {
  const user = new UserDTO(req.user);
  res.send(user);
};
