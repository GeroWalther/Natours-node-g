// // this file is used to configure express
// const express = require('express');
// const morgan = require('morgan');
// const res = require('express/lib/response');
// const { nextTick } = require('process');

// const AppError = require('./utils/appError');
// const globalErrorHandler = require('./controllers/errorController');
// const tourRouter = require('./routes/tourRoutes');
// const userRouter = require('./routes/userRoutes');

// const app = express(); // adds a bunch of methods to the app variable such as listen

// ////// 1) Middlewares - that should apply to all routes
// if (process.env.NODE_ENV === 'developement') {
//   app.use(morgan('dev'));
// }
// app.use(express.json());
// app.use(express.static(`${__dirname}/public/`));

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// //// 3) ROUTES - that should apply only to certain routes

// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/tours', tourRouter); // specifies on which route we use tourRouter to create a sub-app for the resources - mounting a new router on a route; Has to come after we declare the variable - can not use router before declaring them.

// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
// });

// app.use(globalErrorHandler);

// module.exports = app;

const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
