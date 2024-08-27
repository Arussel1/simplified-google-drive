import express from 'express';
import { controlSignUpPost, controlLoginPost, isAuthenticated } from '../controllers/authentication';
import {  controlFolderPost, controlFolderGet, controlFolderDelete, controlFolderPut } from '../controllers/folders'
import { controlFileGet, controlFilePost, downloadFile } from '../controllers/files';
import upload from '../config/multerConfig';
const router = express.Router();

router.get('/', isAuthenticated, controlFolderGet);
router.get('/folders/create', isAuthenticated, (req, res, next) => {
  res.render('createFolder', { currentFolderId: null});
});
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

router.post('/upload', isAuthenticated, upload.single('file'), controlFilePost);
router.post('/upload/:folderId', isAuthenticated, upload.single('file'), controlFilePost);
router.get('/folders/create/:id', isAuthenticated, (req, res, next) => {
  res.render('createFolder', { currentFolderId: req.params.id});
});
router.post('/folders/create', isAuthenticated, controlFolderPost);
router.post('/folders/create/:id', isAuthenticated, controlFolderPost);


router.get('/folders/update/:id', isAuthenticated, (req, res, next) => {
  res.render('updateFolder', { folderId: req.params.id})
})
router.post('/folders/update/:id', isAuthenticated, controlFolderPut)

router.post('/folders/delete/:id', isAuthenticated, controlFolderDelete)

export default router