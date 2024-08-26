import express from 'express';
import { controlSignUpPost, controlLoginPost, isAuthenticated } from '../controllers/authentication';
import {  controlFolderPost, controlFolderGet, controlFileGet, downloadFile } from '../controllers/home'

import upload from '../config/multerConfig';
const router = express.Router();

router.get('/', isAuthenticated, controlFolderGet);
router.get('/folders/:id', isAuthenticated, controlFolderGet);
router.get('/files/:id', isAuthenticated, controlFileGet);
router.get('/files/download/:id', isAuthenticated, downloadFile);

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
router.get('/folders/create', isAuthenticated, (req, res, next) => {
  res.render('createFolder', { currentFolderId: null});
});
router.get('/folders/create/:id', isAuthenticated, (req, res, next) => {
  res.render('createFolder', { currentFolderId: req.params.id});
});
router.post('/folders/create/:id', isAuthenticated, controlFolderPost);
router.post('/folders/create', isAuthenticated, controlFolderPost);


export default router