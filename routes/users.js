const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { checkURL } = require('../common/UrlValidator');

const {
  readUsers, findUserById, updateUserInfo, updateUserAvatar,
} = require('../controllers/users');

router.get('/', readUsers);
router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().length(24),
  }),
}), findUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUserInfo);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(checkURL),
  }),
}), updateUserAvatar);

module.exports = router;
