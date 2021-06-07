const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

const { getUser, updateUserData } = require('../controllers/users');

router.get('/me', getUser);

router.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).messages({
        'string.min': 'Имя может содержать не менее {#limit} символов',
        'string.max': 'Имя может содержать не более {#limit} символов',
      }),
      email: Joi.string()
        .min(2)
        .max(30)
        .custom((value) => {
          if (validator.isEmail(value)) return value;
          throw new Error();
        })
        .messages({
          'string.min': 'Почта может содержать не менее {#limit} символов',
          'string.max': 'Почта может содержать не более {#limit} символов',
          'any.custom': 'Почта не прошла валидацию',
        }),
    }),
  }),
  updateUserData,
);

module.exports = router;
