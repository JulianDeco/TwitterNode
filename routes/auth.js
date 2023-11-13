const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const session = require('express-session');

const router = express.Router();


router.get('/register', (req, res) => {
  res.render('register');
});

// Ruta para procesar el formulario de registro
router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await newUser.save();
    res.redirect('/auth/login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error durante el registro');
  }
});


router.get('/login', (req, res) => {
  res.render('login'); 
});

// Ruta para procesar el formulario de inicio de sesión
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  console.log(user)
  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = username
    req.session.userId = user._id;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid username or password' });
  }
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

module.exports = router;