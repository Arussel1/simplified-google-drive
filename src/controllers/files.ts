import { User,  FileQueries } from "../config/queries";
import { Request, Response, NextFunction } from "express";
import { supabase } from './../config/supabaseClient';
import { Readable } from 'stream';

const fileQueries = new FileQueries();
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
            fileUrl: file.url,
            fileId: file.id
        });
    } catch (error) {
        next(error);
    }
};
export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = await fileQueries.getFileById((req.user as User).id, Number(req.params.id));
      const fullPath = file.url;
      const { data, error } = await supabase.storage.from('fileUploader').download(fullPath);
      console.log(data);
      
    if (error) {
        console.error('Error downloading file from Supabase:', error);
        return res.status(500).json({ error: 'Error downloading file from Supabase' });
      }
  
      if (data) {
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
  
        const bufferStream = Readable.from(buffer);
  
        res.setHeader('Content-Type', 'text/plain;charset=utf-8'); 
        res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`); 
  
        bufferStream.pipe(res);
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

const uploadFile = async (fileBuffer: Buffer, originalName: string) => {
    const { error, data } = await supabase.storage
        .from('fileUploader')
        .upload(`upload/${Date.now()}-${originalName}`, fileBuffer);

    if (error) {
        throw new Error(error.message);
    }
    const modifiedFullPath = data?.fullPath.startsWith(`fileUploader/`)
    ? data?.fullPath.substring(13)
    : data?.fullPath;
    return {
        id: data?.id,
        path: data?.path,
        fullPath: modifiedFullPath
    };
};
export const controlFilePost = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    try {
        const { id, path, fullPath } = await uploadFile(req.file.buffer, req.file.originalname);
        const fileUrl = `${fullPath}`;
        const fileSize = req.file.size;
        const userId = (req.user as User).id; 
        const folderId = Number(req.params.folderId);
        await fileQueries.saveFileUrlToDatabase(req.file.originalname, fileUrl, fileSize, userId, folderId);
        if(folderId) {
            res.redirect(`/folders/${folderId}`)
        } else{
            res.redirect('/');
        }
        
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).send({ message: 'File upload failed', error: error.message });
        } else {
            res.status(500).send({ message: 'File upload failed', error: 'Unknown error occurred' });
        }
    }
}