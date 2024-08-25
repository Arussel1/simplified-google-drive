import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import  { PrismaClient } from '@prisma/client';
import express, { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import passport from 'passport';
import expressSession from 'express-session';
import indexRouter from './routes/index';
import usersRouter from './routes/users';
import passportInstance  from './config/passportConfig';

const app = express();

app.set('views', path.join(__dirname, './../views')); 
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.static("node_modules"));

passportInstance.use
app.use(passport.initialize());
app.use(
  expressSession({
    cookie: {
     maxAge: 30 * 7 * 24 * 60 * 60 * 1000, // ms
     httpOnly: true, 
     sameSite: 'strict'
    },
    secret: process.env.FOO_COOKIE_SECRET!,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      new PrismaClient(),
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
);
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) =>{
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status((err as any).status || 500);
  res.render('error');
});

export default app;
