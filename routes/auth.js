const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const { createUser, login, signOut } = require('../controllers/users');

const errorMessages = require('../errors/errorMessages');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom((value) => {
      if (validator.isEmail(value)) return value;
      throw new Error();
    }).messages(errorMessages.email),
    password: Joi.string().required().min(6).messages(errorMessages.password),
  }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom((value) => {
      if (validator.isEmail(value)) return value;
      throw new Error();
    }).messages(errorMessages.email),
    password: Joi.string().required().min(6).messages(errorMessages.password),
    name: Joi.string().required().min(2).max(30)
      .messages({
        'any.rquired': 'Не указана почта',
        'string.empty': 'Поле "имя" не содержит информацию',
        'string.min': 'Имя должно содержать не менее {#limit} символов',
        'string.max': 'Имя должно содержать не более {#limit} символов',
      }),
  }),
}), createUser);

router.get('/signout', signOut);

module.exports = router;
