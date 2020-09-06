const Cards = require('../models/card');
const ServerError = require('../errors/ServerError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

// Список карточек
module.exports.readCards = (req, res, next) => {
  Cards.find({})
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch(() => {
      next(new ServerError());
    });
};
// Создание карточки
module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Cards.create({ name, link, owner })
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch(next);
};
// Удаление карточки
module.exports.deleteCardById = (req, res, next) => {
  Cards.findById(req.params.id)
    .then((card) => {
      if (!card) {
        throw new NotFoundError(`Карточка c ID ${req.params.id} не существует`);
      } else if (card.owner.toString() === req.user._id) {
        Cards.findByIdAndDelete(card._id)
          .then((removedCard) => {
            res.status(200).send({ data: removedCard });
          })
          .catch(next);
      } else {
        throw new ForbiddenError('Нет прав на удаление');
      }
    })
    .catch(next);
};
// Like
module.exports.like = (req, res, next) => {
  // eslint-disable-next-line max-len
  Cards.findByIdAndUpdate({ _id: req.params.cardId }, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((result) => {
      if (result) {
        res.status(200).send({ message: 'Like++', count: result.likes.length });
      } else {
        throw new NotFoundError(`Карточка с ID ${req.params.cardId} не найдена.`);
      }
    })
    .catch(next);
};
// Dislike
module.exports.dislike = (req, res, next) => {
  // eslint-disable-next-line max-len
  Cards.findByIdAndUpdate({ _id: req.params.cardId }, { $pull: { likes: req.user._id } }, { new: true })
    .then((result) => {
      if (result) {
        res.status(200).send({ message: 'Like--', count: result.likes.length });
      } else {
        throw new NotFoundError(`Карточка с ID ${req.params.cardId} не найдена.`);
      }
    })
    .catch(next);
};
