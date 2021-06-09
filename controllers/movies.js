const Movie = require('../models/movie');
const User = require('../models/user');

const NotFoundError = require('../errors/NotFound');
const BadRequestError = require('../errors/BadRequest');

const { addOwnerToMovie } = require('../utils/index');

module.exports.getSavedMovies = (req, res, next) => {
  Movie.find({ owner: req.user }).orFail(new NotFoundError('Фильмы не найдены'))
    .then((movies) => res.status(200).send(movies))
    .catch((err) => next(err));
};

module.exports.createMovie = (req, res, next) => {
  if (typeof (req.body) === 'undefined') {
    return next(new BadRequestError('Ошибка добавления в избранное'));
  }

  return User.findByIdAndUpdate(
    req.user,
    { $addToSet: { movies: req.body.movieId } },
  )
    .orFail(new NotFoundError('Ошибка добавления в избранное. Пользователь не найден'))
    .then(Movie.create(addOwnerToMovie(req.body, req.user)))
    .then(res.send({ message: `Фильм ${req.body.nameRU} добавлен в избранное` }))
    .catch((err) => next(err));
};

module.exports.deleteMovie = (req, res, next) => User.findByIdAndUpdate(
  req.user,
  { $pull: { movies: req.params.id } },
)
  .orFail(new NotFoundError('Ошибка удаления из избранного. Пользователь не найден'))
  .then(Movie.deleteMany({ _id: req.params.id, owner: req.user })
    .then((result) => {
      if (result.deletedCount === 0) {
        return next(new NotFoundError('Ошибка удаления из избранного. Фильм не найден'));
      }
      return res.send({ message: 'Фильм удалён из избранного' });
    }).catch((err) => next(err)));
