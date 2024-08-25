import { Request, Response, NextFunction  } from 'express';
import { body, validationResult } from 'express-validator';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { UserQueries, User } from '../config/queries';
import { hash } from 'crypto';

const userQueries = new UserQueries();

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if(req.isAuthenticated()){
    next();
} else {
    res.redirect('/login');
}
}

export const controlSignUpPost = [
  body('firstname')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .escape(),
  body('lastname')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .escape(),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters long')
    .matches(/^[a-zA-Z0-9_.]+$/)
    .withMessage('Username must contain only letters, numbers, underscores, or periods')
    .escape(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 64 })
    .withMessage('Password must be between 8 and 64 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('confirmpassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('register', {
        errors: errors.array(),
        formInfo: req.body,
      });
    }

    try {
      const { firstname, lastname, username, password } = req.body;
      const usernameExists = await userQueries.getUser(username) !== null;
      if (usernameExists) {
        return res.render('register', {
          errors: [{ msg: 'Username already exists' }],
          formInfo: req.body,
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await userQueries.addUser(firstname, lastname, username, hashedPassword);
      return res.redirect('/login');
    } catch (error) {
      console.error('Error during user sign-up:', error);
      return res.render('register', {
        errors: [{ msg: 'An error occurred during sign-up. Please try again.' }],
        formInfo: req.body,
      });
    }
  }
];

export const controlLoginPost = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters long')
    .matches(/^[a-zA-Z0-9_.]+$/)
    .withMessage('Username must contain only letters, numbers, underscores, or periods')
    .escape(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 64 })
    .withMessage('Password must be between 8 and 64 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('login', {
        errors: errors.array(),
        formInfo: req.body,
      });
    }

    try {
      const { username, password } = req.body;
      const user = await userQueries.getUser(username);
      if (!user) {
        return res.render('login', {
          errors: [{ msg: 'Username does not exist' }],
          formInfo: req.body,
        });
      }
      passport.authenticate('local', (err: Error | null, user: User | null, info: any) => {
        if (err) { // Handle errors
          console.error('Error during user login:', err);
          return res.render('login', {
            errors: [{ msg: 'An error occurred during login. Please try again.' }],
            formInfo: req.body,
          });
        }

        if (!user) { // Handle failed authentication
          return res.render('login', {
            errors: [{ msg: 'Incorrect username or password' }],
            formInfo: req.body,
          });
        }

        // Successful authentication - redirect or perform other actions
        req.login(user, (loginErr) => {  // Use passport.login for session management
          if (loginErr) {
            console.error('Error during login session:', loginErr);
            return res.render('login', {
              errors: [{ msg: 'An error occurred during login. Please try again.' }],
              formInfo: req.body,
            });
          }
          return res.redirect('/');
        });
      })(req, res, next);

    } catch (error) {
      console.error('Error during user login:', error);
      return res.render('login', {
        errors: [{ msg: 'An error occurred during login. Please try again.' }],
        formInfo: req.body,
      });
    }
  }
];