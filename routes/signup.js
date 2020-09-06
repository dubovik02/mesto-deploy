const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { checkURL } = require('../common/UrlValidator');
const { createUser } = require('../controllers/signup');

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().custom(checkURL),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);

module.exports = router;
