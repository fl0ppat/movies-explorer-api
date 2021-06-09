const routes = require('express').Router();
const NotFoundError = require('../errors/NotFound');

routes.use('/users', require('./users'));
routes.use('/movies', require('./movies'));

routes.use('/', (req, res, next) => next(new NotFoundError('Ресурс не найден')));

module.exports = routes;
