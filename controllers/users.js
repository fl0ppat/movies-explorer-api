const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const NotFoundError = require('../errors/NotFound');
const ConflictError = require('../errors/Conflict');
const UnauthorizedError = require('../errors/Unauthorized');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUser = (req, res, next) => {
  User.findById(req.user)
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => res.status(200)
      .send({ name: user.name, email: user.email, movies: user.movies }))
    .catch((err) => next(err));
};

module.exports.updateUserData = (req, res, next) => {
  const newData = {};
  if (req.body.name) {
    newData.name = req.body.name;
  }

  if (req.body.email) {
    newData.email = req.body.email;
  }

  User.findByIdAndUpdate(req.user, newData, { runValidators: true, new: true })
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => res.send({ name: user.name, email: user.email, movies: user.movies }))
    .catch((err) => next(err));
};

module.exports.createUser = (req, res, next) => {
  if (typeof (req.body) === 'undefined') {
    return next(new UnauthorizedError('Указан неверный логин или пароль'));
  }
  const {
    name,
    email,
    password,
  } = req.body;

  return bcrypt.hash(password, 10).then((hash) => {
    User.create({
      name, email, password: hash,
    })
      .then((user) => res.send({
        _id: user._id, name, email,
      }))
      .catch((err) => {
        if (err.name === 'MongoError' && err.code === 11000) {
          return next(new ConflictError('Email уже зарегестрирован'));
        }

        return next(err);
      });
  });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let _id;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('Указан неверный логин или пароль'));
      }
      _id = user._id;
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        return Promise.reject(new UnauthorizedError('Указан неверный логин или пароль'));
      }
      return res.status(200).cookie(
        '_id',
        jwt.sign(_id.toJSON(), NODE_ENV === 'production' ? JWT_SECRET : '12345'),
        { maxAge: 604800000, /* 7days */ httpOnly: true },
      ).status(200).send({ mesage: 'Вход выполнен' });
    })
    .catch((err) => next(err));
};

module.exports.signOut = (req, res) => {
  res.clearCookie('_id').send({ message: 'Выход успешно совершён' });
};
