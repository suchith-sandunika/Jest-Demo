import { prisma } from "../db/db";
import { user, update } from "../types/types";

const getAllUsers = async () => {
    return prisma.user.findMany();
}

const getUserById = async (id: number) => {
    return prisma.user.findUnique({
        where: {
            id: id
        }
    });
}

const getUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: {
            email: email
        }
    });
}

const createUser = async ({ name, email, age, dob, password }: user) => {
    return prisma.user.create({
        data: {
            name: name,
            email: email,
            age: age,
            dob: dob,
            password: password
        }
    });
}

const updateUser = async ( id: number, { name, email, age, dob }: update ) => {
    return prisma.user.update({
        where: {
            id: id
        },
        data: {
            name: name,
            email: email,
            age: age,
            dob: dob
        }
    });
}

const updateUserName = async (id: number, name: string) => {
    return prisma.user.update({
        where: {
            id: id
        },
        data: {
            name: name
        }
    });
}

const updateUserEmail = async (id: number, email: string) => {
    return prisma.user.update({
        where: {
            id: id
        },
        data: {
            email: email
        }
    });
}

const updateUserPassword = async (id: number, password: string) => {
    return prisma.user.update({
        where: {
            id: id
        },
        data: {
            password: password
        }
    });
}

const deleteUser = async (id: number) => {
    return prisma.user.delete({
        where: {
            id: id
        }
    });
}

export { getAllUsers, getUserById, getUserByEmail, createUser, updateUser, deleteUser, updateUserName, updateUserEmail, updateUserPassword };