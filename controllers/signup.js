const bcrypt = require('bcryptjs');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
// const ServerError = require('../errors/ServerError');

// const validationErrName = 'ValidationError';
// const serverErrMessage = 'На сервере произошла ошибка';

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
      // return res.status(400).send({ message: 'Пароль не задан' });
      throw new BadRequestError('Пароль не задан');
    }

    // пароль не может состоять из пробелов
    if (!password.split(' ').join('').length) {
      // return res.status(400).send({ message: 'Пароль не может состоять только из пробелов' });
      throw new BadRequestError('Пароль не может состоять только из пробелов');
    }

    // проверка длины пароля
    if (password.length < PASS_LENGTH) {
      // eslint-disable-next-line max-len
      // return res.status(400).send({ message: `Длина пароля должна быть не менее ${PASS_LENGTH} символов` });
      throw new BadRequestError(`Длина пароля должна быть не менее ${PASS_LENGTH} символов`);
    }
  } catch (err) {
    next(err);
    return;
  }

  User.findUserByEmail(email)
    .then((user) => {
      if (user) {
        // res.status(409).send({ message: 'Пользователь с таким email уже существует' });
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
            // .catch((err) => {
            //   if (err.name === validationErrName) {
            //     // res.status(400).send({ error: err.message });
            //     next(new BadRequestError(err.message));
            //   } else {
            //     next(new ServerError());
            //     // res.status(500).send({ message: serverErrMessage });
            //   }
            // }));
            .catch((err) => {
              next(err);
            }));
      }
    })
    .catch(next);
  // res.status(500).send({ message: serverErrMessage });
  // );
};
