import { PrismaClient } from '@prisma/client';

export interface User {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    password: string;
}

export class UserQueries {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getUser(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { username: username },
        });
    }

    async getUserById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({
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
