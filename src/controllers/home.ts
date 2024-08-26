import { UserQueries, User, FolderQueries, FileQueries } from "../config/queries";
import { Request, Response, NextFunction } from "express";
import path from 'path';

const userQueries = new UserQueries();
const folderQueries = new FolderQueries();
const fileQueries = new FileQueries();

export const getFolderPath = async (folderId: number, userId: number): Promise<string[]> => {
    const path = [];
    let currentFolder = await folderQueries.getSingleFolderById(userId,folderId);

    while (currentFolder) {
        path.unshift(currentFolder.name); 
        currentFolder = currentFolder.parentId 
            ? await folderQueries.getSingleFolderById(userId,currentFolder.parentId)
            : null;
    }
    console.log(path)
    return path;
};

export const getFolderPathIds = async (folderId: number, userId: number): Promise<number[]> => {
    const pathIds: number[] = [];
    let currentFolder = await folderQueries.getSingleFolderById(userId, folderId);

    while (currentFolder) {
        pathIds.unshift(currentFolder.id); 
        currentFolder = currentFolder.parentId 
            ? await folderQueries.getSingleFolderById(userId, currentFolder.parentId)
            : null;
    }
    console.log(pathIds)
    return pathIds;
};

export const controlFolderGet = async (req: Request, res: Response, next: NextFunction) => {
    const user = await userQueries.getUserById((req.user as User).id);
    let files, folders, currentFolderId, folderPath:string[], folderIds: number[];
    
    if (req.params && req.params.id) {
        const folderId = Number(req.params.id);
        files = await fileQueries.getFileByFolderId((req.user as User).id, folderId);
        folders = await folderQueries.getFolderById((req.user as User).id, folderId);
        currentFolderId = folderId;
        folderPath = await getFolderPath(folderId, (req.user as User).id);
        folderIds = await getFolderPathIds(folderId, (req.user as User).id); 
    } else {
        files = await fileQueries.getFileByFolderId((req.user as User).id, null);
        folders = await folderQueries.getFolderById((req.user as User).id, null);
        currentFolderId = null;
        folderPath = [];
        folderIds = [];
    }
    
    res.render('index', {
        firstname: user?.firstname,
        lastname: user?.lastname,
        files,
        folders,
        currentFolderId,
        folderPath,
        folderIds
    });
};


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
