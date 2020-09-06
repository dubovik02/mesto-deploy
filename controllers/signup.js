const bcrypt = require('bcryptjs');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');

const PASS_LENGTH = 8;

// Создание
// eslint-disable-next-line consistent-return
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  try {
    // если пароль не задан, пароль перед сохранением не захишируем -
    // создание не возможно.
    if (!password) {
      throw new BadRequestError('Пароль не задан');
    }

    // пароль не может состоять из пробелов
    if (!password.split(' ').join('').length) {
      throw new BadRequestError('Пароль не может состоять только из пробелов');
    }

    // проверка длины пароля
    if (password.length < PASS_LENGTH) {
      // eslint-disable-next-line max-len
      throw new BadRequestError(`Длина пароля должна быть не менее ${PASS_LENGTH} символов`);
    }
  } catch (err) {
    next(err);
    return;
  }

  User.findUserByEmail(email)
    .then((user) => {
      if (user) {
        throw new BadRequestError('Пользователь с таким email уже существует');
      } else {
        bcrypt.hash(password, 10)
          .then((hash) => User.create({
            name, about, avatar, email, password: hash,
          })
            .then((newUser) => {
              res.status(200).send({
                _id: newUser._id,
                name: newUser.name,
                about: newUser.about,
                avatar: newUser.avatar,
                email: newUser.email,
              });
            })
            .catch((err) => {
              next(err);
            }));
      }
    })
    .catch(next);
};
