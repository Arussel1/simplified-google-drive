import { UserQueries, User, FolderQueries, FileQueries } from "../config/queries";
import { Request, Response, NextFunction } from "express";
import path from 'path';

const userQueries = new UserQueries();
const folderQueries = new FolderQueries();
const fileQueries = new FileQueries();

export const controlFolderGet = async (req: Request, res: Response, next: NextFunction) => {
    const user = await userQueries.getUserById((req.user as User).id);
    let files, folders, currentFolderId
    if(req.params){
        files = await fileQueries.getFileByFolderId((req.user as User).id, Number(req.params.id));
        folders = await folderQueries.getFolderById((req.user as User).id, Number(req.params.id));
        currentFolderId = req.params.id
    } else {
        files = await fileQueries.getFileByFolderId((req.user as User).id, null);
        folders = await folderQueries.getFolderById((req.user as User).id, null);
        currentFolderId = null;
    }
    res.render('index', { firstname: user?.firstname,
                      lastname: user?.lastname, files, folders, currentFolderId
    });
}

export const controlFolderPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        const userId = (req.user as User).id;

        if (req.params.id) {
            const parentId = Number(req.params.id);
            await folderQueries.createFolder(name, userId, parentId);
            res.redirect(`/folders/${parentId}`);
        } else {
            await folderQueries.createFolder(name, userId, undefined);
            res.redirect('/');
        }
    } catch (error) {
        next(error); 
    }
};
export const controlFileGet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fileId = Number(req.params.id);
        const userId = (req.user as User).id;

        const file = await fileQueries.getFileById(userId, fileId);

        if (!file) {
            return res.status(404).send('File not found');
        }

        res.render('fileDetails', {
            fileName: file.name,
            fileSize: file.size,
            uploadTime: file.createdAt,
            fileUrl: `/files/download/${file.id}`  
        });
    } catch (error) {
        next(error); 
    }}
export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fileId = Number(req.params.id);
        const userId = (req.user as User).id;

        const file = await fileQueries.getFileById(userId, fileId);

        if (!file) {
            return res.status(404).send('File not found');
        }

        const filePath = path.join(__dirname, '../uploads', file.name);  

        res.download(filePath, file.name);
    } catch (error) {
        next(error); 
    }
};