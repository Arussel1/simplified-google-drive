import { PrismaClient } from '@prisma/client';


export interface FileRecord {
    id: number;
    name: string;
    url: string;
    size: number;
    folderId: number | null;
    userId: number;
  }
export interface User {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    password: string;
}

export interface Folder{
    name: string;
    id: number;
    parentId: number | null;
}

export interface File{
    id: number,
    name: string
}

export interface DetailFile extends File{
    createdAt: Date; 
    url: string;
    size: number; 
}

export class UserQueries {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getUser(username: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { username: username },
        });
    }

    async getUserById(id: number): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: { id: id },
        });
    }
    async addUser(firstname: string, lastname: string, username: string, hashPassword: string): Promise<void> {
        try {
            await this.prisma.user.create({
                data: {
                    firstname,
                    lastname,
                    username,
                    password: hashPassword
                }
            });
        } catch (error) {
            console.error("Error adding user:", error);
            throw error; 
        }
    }
}

export class FolderQueries {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async createFolder(name: string, userId: number, parentId?: number): Promise<void> {
        await this.prisma.folder.create({
            data: {
                name,
                user: { connect: { id: userId } },
                parent: parentId ? { connect: { id: parentId } } : undefined,
            },
        });
    }

    async getFolderById(userId: number, parentId: number | null): Promise<Folder[]> {
        return await this.prisma.folder.findMany({
            where: { userId, parentId },
            include: {
                children: true,
            },
        });
    }
    async getSingleFolderById(userId: number, folderId: number): Promise<Folder | null> {
        return await this.prisma.folder.findFirst({
            where: {
                id: folderId,
                userId,
            },
        });
    }
    async updateFolderName(userId: number, folderId: number, newName: string): Promise<void>{
         await this.prisma.folder.update({
            data: {
                name: newName
            },
            where: {
                id: folderId,
                userId
            }
        })
    }

    async deleteFolderById(folderId: number, userId: number): Promise<void>{
        await this.prisma.folder.delete({
            where: {
                id: folderId,
                userId
            }
        })
    }

}

export class FileQueries{
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getFileByFolderId(userId: number, folderId: number | null): Promise<File[]>{
        return await this.prisma.file.findMany({
            where: { userId, folderId },
            select: {
                name: true,
                id: true
            }
        })
    }
    async getFileById(userId: number, fileId: number): Promise<DetailFile>{
        return await this.prisma.file.findFirstOrThrow({
            where: { userId, id: fileId },
            select: { id: true, name: true, size: true , createdAt: true, url:true,  }
        })
    }
    async saveFileUrlToDatabase( name: string, url: string, size: number, userId: number, folderId?: number): Promise<FileRecord> {
        const fileRecord = await this.prisma.file.create({
          data: {
            name,
            url,
            size,
            userId,
            folderId, 
          },
        });
      
        return fileRecord;
      }
      async deleteFilesByFolderId(folderId: number, userId: number): Promise<void> {
        await this.prisma.file.deleteMany({
            where: {
                folderId, userId
            }
        })
      }
    }