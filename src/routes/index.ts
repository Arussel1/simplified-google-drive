import express from 'express';
import { controlSignUpPost, controlLoginPost, isAuthenticated } from '../controllers/authentication';
import upload from '../config/multerConfig';
const router = express.Router();

router.get('/', isAuthenticated, (req, res, next) => {
    res.render('index', {title: "Express-ts"});
  });
router.get('/register', (req, res, next) => {
  res.render('register', {
    errors: [],
    formInfo: {},
  });
})

router.post('/register', controlSignUpPost);

router.get('/login', (req, res, next) => {
  if(req.isAuthenticated()){
    res.redirect('/')
  }
  res.render('login', {
    errors: [],
    formInfo: {}
  });
})

router.post('/login', controlLoginPost);

router.post('/logout', (req, res, next) => {
  req.logout((err) => { 
    if (err) { 
      return next(err); 
    }
    res.redirect('/login'); 
  });
});

router.post('/upload', isAuthenticated, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.redirect('/');
});

module.exports = router;

export default router