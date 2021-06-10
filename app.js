const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const handleError = require('./middlewares/error');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { DB = 'mongodb://localhost:27017/bitfilmsdb' } = process.env;

const app = express();

app.use(helmet());
app.disable('x-powered-by');
app.use(cors({
  credentials: true,
  origin: 'https://fl0ppat-diplom.nomoredomains.club',
}));

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(requestLogger);
app.use(require('./utils/rateLimiter'));
app.use(require('./routes/auth'));
app.use(require('./middlewares/auth'));
app.use(require('./routes/index'));
app.use(require('./errors/errorHandler'));

app.use(errorLogger);
app.use((err, req, res, next) => handleError(err, req, res, next));

module.exports = app;
