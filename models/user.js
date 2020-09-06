/* eslint-disable max-len */
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ServerError = require('../errors/ServerError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    validate: {
      validator(avatar) {
        return validator.isURL(avatar);
      },
    },
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

// Поиск пользователя по email
userSchema.statics.findUserByEmail = function findByEmail(email) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (user) {
        return user;
      }
      return null;
    })
    .catch(() => Promise.reject(new ServerError()));
};

// Поиск пользователя по email и паролю
userSchema.statics.findUserByCredentials = function findByCredentials(email, password) {
  return this.findUserByEmail(email)
    .then((user) => {
      if (user) {
        return bcrypt.compare(password, user.password)
          .then((matched) => {
            if (!matched) {
              return Promise.reject(new UnauthorizedError('Некорректные имя пользователя или пароль'));
            }
            return user;
          });
      }
      return Promise.reject(new UnauthorizedError('Некорректные имя пользователя или пароль'));
    })
    .catch((err) => Promise.reject(err));
};

module.exports = mongoose.model('user', userSchema);
