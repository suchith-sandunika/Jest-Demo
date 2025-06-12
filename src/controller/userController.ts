import { Request, Response } from "express";
import * as userService from "../service/userService";
import validateEmail from "../utils/validate";
import { hashPassword, verifyPassword } from "../utils/bcrypt";
import { user, update, editName, editEmail, editPassword } from "../types/types";

const fetchAllUserData = async (req: Request, res: Response): Promise<any> => {
    try {
        const users = await userService.getAllUsers();

        if (!users || users.length === 0) {
           return res.status(404).send('No users found');
        }

        return res.status(200).json({ message: "User Data Found", data: users });
    } catch (error: any) {
        console.log("Error fetching all users:", error);
        return res.status(500).send("Internal server error");
    }
}

const fetchUserById = async (req: Request, res: Response): Promise<any> => {
    const id: number = parseInt(req.params.id);

    if (!id) {
        return res.status(401).send("User ID Required & Required as a number");
    }

    try {
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).send("User not found");
        }

        return res.status(200).json({ message: `User Found for ${id}`, data: user });
    } catch (error: any) {
        console.log("Error fetching user by ID:", error);
        return res.status(500).send("Internal server error");
    }
}

const addNewUser = async (req: Request, res: Response): Promise<any> => {
    const { name, email, age, dob, password }: user = req.body;

    if(!name || !email || !dob || !password) {
        return res.status(401).send("All fields are required");
    }

    if (isNaN(age) || age <= 0 || !age ) {
        return res.status(401).send("Age is required and must be a positive number greater than 0");
    }

    if(!validateEmail(email)) {
        return res.status(401).send("Invalid email format");
    }

    try {
        const existingUserWithEmail = await userService.getUserByEmail(email);

        if (existingUserWithEmail) {
            return res.status(400).send("Email already exists");
        }

        const hashedPassword = await hashPassword(password);

        if(!hashedPassword) {
            return res.status(400).send("Error hashing password");
        }

        const newUser = await userService.createUser({ name: name, email: email, age: age, dob: new Date(dob), password: hashedPassword });

        if (!newUser) {
            return res.status(400).send("Error creating user");
        }

        return res.status(201).json({ message: "User created successfully", data: newUser });
    } catch (error: any) {
        console.log("Error adding new user:", error);
        return res.status(500).send("Internal server error");
    }
}

const updateUserDetails = async (req: Request, res: Response): Promise<any> => {
    const id: number = parseInt(req.params.id);
    const { name, email, age, dob }: update = req.body;

    if (!id || isNaN(id)) {
        return res.status(401).send("User ID Required & Required as a number");
    }

    if(!name || !email || !dob) {
        return res.status(401).send("All fields are required");
    }

    if (isNaN(age) || age <= 0 || !age ) {
        return res.status(401).send("Age is required and must be a positive number greater than 0");
    }

    if(!validateEmail(email)) {
        return res.status(400).send("Invalid email format");
    }

    try {
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).send("User not found");
        }

        // const existingUser = await userService.getUserByEmail(email);
        //
        // if (existingUser) {
        //     return res.status(400).send("Email already exists");
        // }

        const updatedUser = await userService.updateUser( id, { name, email, age, dob: new Date(dob) });

        if(!updatedUser) {
            return res.status(400).send("User Update Failed");
        }

        return res.status(200).json({ message: "User updated successfully", data: updatedUser });
    } catch (error: any) {
        console.log("Error updating user details:", error);
        return res.status(500).send("Internal server error");
    }
}

const deleteUserDetails = async (req: Request, res: Response): Promise<any> => {
    const id: number = parseInt(req.params.id);

    if (!id) {
        return res.status(401).send("User ID Required & Required as a number");
    }

    try {
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).send("User not found");
        }

        const deletedUser = await userService.deleteUser(id);

        if (!deletedUser) {
            return res.status(400).send("User deletion failed");
        }

        return res.status(200).json({ message: `User with ID ${id} deleted successfully`, data: deletedUser });
    } catch (error: any) {
        console.log("Error deleting user:", error);
        return res.status(500).send("Internal server error");
    }
}

const updateUsersName = async (req: Request, res: Response): Promise<any> => {
    const id: number = parseInt(req.params.id);
    const { name }: editName = req.body;

    if (!id || isNaN(id)) {
        return res.status(401).send("User ID Required & Required as a number");
    }

    if (!name) {
        return res.status(401).send("Name is required");
    }

    try {
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).send("User not found");
        }

        const updatedUser = await userService.updateUserName(id, name);

        if (!updatedUser) {
            return res.status(400).send("User Name Update Failed");
        }

        return res.status(200).json({ message: "User name updated successfully", data: updatedUser });
    } catch (error: any) {
        console.log("Error updating user name:", error);
        return res.status(500).send("Internal server error");
    }
}

const updateUsersEmail = async (req: Request, res: Response): Promise<any> => {
    const id: number = parseInt(req.params.id);
    const { email }: editEmail = req.body;

    if (!id) {
        return res.status(401).send("User ID Required & Required as a number");
    }

    if (!email) {
        return res.status(401).send("Email is required");
    }

    if (!validateEmail(email)) {
        return res.status(400).send("Invalid email format");
    }

    try {
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).send("User not found");
        }

        const existingUserWithEmail = await userService.getUserByEmail(email);

        if (existingUserWithEmail) {
            return res.status(400).send("Email already exists");
        }

        const updatedUser = await userService.updateUserEmail(id, email);

        if (!updatedUser) {
            return res.status(400).send("User Email Update Failed");
        }

        return res.status(200).json({ message: "User Email updated successfully", data: updatedUser });
    } catch (error: any) {
        console.log("Error updating user name:", error);
        return res.status(500).send("Internal server error");
    }
}

const updateUsersPassword = async (req: Request, res: Response): Promise<any> => {
    const id: number = parseInt(req.params.id);
    const { newPassword, oldPassword }: editPassword = req.body;

    if (!id) {
        return res.status(401).send("User ID Required & Required as a number");
    }

    if (!newPassword || !oldPassword) {
        return res.status(401).send("New & Old Passwords Required");
    }

    try {
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).send("User not found");
        }

        const userPassword = user.password;

        const isPasswordValid = await verifyPassword(oldPassword, userPassword);

        if (!isPasswordValid) {
            return res.status(400).send("Old password, entered is incorrect");
        }

        const hashedNewPassword = await hashPassword(newPassword);

        if (!hashedNewPassword) {
            return res.status(400).send("Error hashing new password");
        }

        const updatedUser = await userService.updateUserPassword(id, newPassword);

        if (!updatedUser) {
            return res.status(400).send("User Password Update Failed");
        }

        return res.status(200).json({ message: "User Password updated successfully", data: updatedUser });
    } catch (error: any) {
        console.log("Error updating user name:", error);
        return res.status(500).send("Internal server error");
    }
}

export { fetchAllUserData, fetchUserById, addNewUser, updateUserDetails, deleteUserDetails, updateUsersName, updateUsersEmail, updateUsersPassword };