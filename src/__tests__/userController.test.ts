import { Request, Response } from "express";
import * as userController from "../controller/userController";
import * as userService from "../service/userService";
import {hashPassword, verifyPassword} from "../utils/bcrypt";
import validateEmail from "../utils/validate";

const mockUsers = [{ id: 1, name: "John Wick1", email: "johnwick1@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "hashed_password123" }, { id: 1, name: "John Wick2", email: "johnwick2@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "hashed_password456" }, { id: 3, name: "John Wick3", email: "johnwick3@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "hashed_password789" }];
const mockUser = { id: 1, name: "John Wick", email: "johnwick1@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "hashed_password123" };
const mockUser1 = { name: "Johny English", email: "johnwick@gmail.com", age: 68, dob: new Date("1959-12-22"), password: "password12312" };

jest.mock("../service/userService");

jest.mock("../utils/bcrypt", () => ({
    hashPassword: jest.fn(),
    verifyPassword: jest.fn().mockReturnValue(true)
}));

jest.mock("../utils/validate", () => ({
    __esModule: true,
    default: jest.fn().mockReturnValue(true)
    // validateEmail: jest.fn().mockReturnValue(true)
}));

describe("User Controller", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let sendMock: jest.Mock;

    beforeEach(() => {
        req = { }
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        sendMock = jest.fn();

        res = {
            status: statusMock,
            json: jsonMock,
            send: sendMock
        };
    });

    describe("fetchAllUserData Function", () => {
        it("should return user data if found", async () => {
            (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);
            await userController.fetchAllUserData(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ message: "User Data Found", data: mockUsers });
        });

        it('should return 404 if no users found', async () => {
            (userService.getAllUsers as jest.Mock).mockResolvedValue([]);
            await userController.fetchAllUserData(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(sendMock).toHaveBeenCalledWith('No users found');
        });

        it('should return 500 on any error', async () => {
            (userService.getAllUsers as jest.Mock).mockRejectedValue(new Error("Database error"));
            await userController.fetchAllUserData(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(sendMock).toHaveBeenCalledWith("Internal server error");
        });

        it('should return 500 on network error', async () => {
            (userService.getAllUsers as jest.Mock).mockRejectedValue(new Error("network timeout"));
            await userController.fetchAllUserData(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(sendMock).toHaveBeenCalledWith("Internal server error");
        });
    });

    describe("fetchUserById Function", () => {
        it('should return user data for valid ID', async () => {
            req = { params: { id: "1" } };
            (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
            await userController.fetchUserById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ message: "User Found for 1", data: mockUser });
        });

        it('should return error for invalid ID', async () => {
            req = { params: { id: "abd" } };
            await userController.fetchUserById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("User ID Required & Required as a number");
        });

        it('should return error if id is empty', async () => {
            req = { params: { id: "" } };
            await userController.fetchUserById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("User ID Required & Required as a number");
        });

        it('should return 404 if user not found', async () => {
            req = { params: { id: "2" } };
            (userService.getUserById as jest.Mock).mockResolvedValue(null);
            await userController.fetchUserById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(sendMock).toHaveBeenCalledWith("User not found");
        });

        it('should return 500 on any error', async () => {
            (userService.getUserById as jest.Mock).mockRejectedValue(new Error("Database error"));
            await userController.fetchAllUserData(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(sendMock).toHaveBeenCalledWith("Internal server error");
        });

        it('should return 500 on network error', async () => {
            (userService.getUserById as jest.Mock).mockRejectedValue(new Error("network timeout"));
            await userController.fetchAllUserData(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(sendMock).toHaveBeenCalledWith("Internal server error");
        });
    });

    describe("addNewUser Function", () => {
       it('should add a new user successfully', async () => {
           const mockUserInput = { name: "John Wick", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
           const mockCreatedUser = { id: 2, name: mockUserInput.name, email: mockUserInput.email, age: mockUserInput.age, dob: mockUserInput.dob, password: "hashed_password" }
           req = { body: mockUserInput };
           (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
           (hashPassword as jest.Mock).mockResolvedValue("hashed_password");
           (userService.createUser as jest.Mock).mockResolvedValue(mockCreatedUser);
           await userController.addNewUser(req as Request, res as Response);
           expect(statusMock).toHaveBeenCalledWith(201);
           expect(jsonMock).toHaveBeenCalledWith({ message: "User created successfully", data: mockCreatedUser });
       });

       it('should return 400 if the user insertion failed', async () => {
            const mockUserInput = { name: "John Wick", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
            req = { body: mockUserInput };
            (validateEmail as jest.Mock).mockReturnValue(true);
            (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
            (hashPassword as jest.Mock).mockResolvedValue("hashed_password");
            (userService.createUser as jest.Mock).mockResolvedValue(null);
            await userController.addNewUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(sendMock).toHaveBeenCalledWith("Error creating user");
       });

       it('should return 401 error if name is empty', async () => {
           const mockUserInput = { name: "", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
           req = { body: mockUserInput };
           await userController.addNewUser(req as Request, res as Response);
           expect(statusMock).toHaveBeenCalledWith(401);
           expect(sendMock).toHaveBeenCalledWith("All fields are required");
       });

       it('should return 401 error if email is empty', async () => {
            const mockUserInput = { name: "John Wick", email: "", age: 57, dob: new Date("1966-09-02"), password: "password123" };
            req = { body: mockUserInput };
            await userController.addNewUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("All fields are required");
       });

       it('should return 401 if email is not valid', async () => {
            const mockUserInput = { name: "John Wick", email: "johnwick", age: 57, dob: new Date("1966-09-02"), password: "password123" };
            req = { body: mockUserInput };
            (validateEmail as jest.Mock).mockReturnValue(false);
            await userController.addNewUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("Invalid email format");
       });

       it('should return 401 error if age is not a number', async () => {
            const mockUserInput = { name: "John Wick", email: "johnwick@gmail.com", age: 'abc', dob: new Date("1966-09-02"), password: "password123" };
            req = { body: mockUserInput };
            await userController.addNewUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("Age is required and must be a positive number greater than 0");
       });

       it('should return 401 error if age is not a positive number', async () => {
            const mockUserInput = { name: "John Wick", email: "johnwick@gmail.com", age: -2, dob: new Date("1966-09-02"), password: "password123" };
            req = { body: mockUserInput };
            await userController.addNewUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("Age is required and must be a positive number greater than 0");
       });

       it('should return 401 error if age is not zero', async () => {
            const mockUserInput = { name: "John Wick", email: "johnwick@gmail.com", age: 0, dob: new Date("1966-09-02"), password: "password123" };
            req = { body: mockUserInput };
            await userController.addNewUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("Age is required and must be a positive number greater than 0");
       });

       it('should return 401 error if dob is empty', async () => {
            const mockUserInput = { name: "John Wick", email: "johnwick@gmail.com", age: 57, dob: "", password: "password123" };
            req = { body: mockUserInput };
            await userController.addNewUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("All fields are required");
       });

       it('should return 401 error if password is empty', async () => {
            const mockUserInput = { name: "John Wick", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "" };
            req = { body: mockUserInput };
            await userController.addNewUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("All fields are required");
       });

       it('should return 400 if there is user data for the entered email', async () => {
            const mockUserInput = { name: "John Wick", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
            req = { body: mockUserInput };
            (validateEmail as jest.Mock).mockReturnValue(true); // extremely important to mock this ...
            (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser1);
            await userController.addNewUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(sendMock).toHaveBeenCalledWith("Email already exists");
        });

       it('should return 400 if there is an error in hashing password', async () => {
            const mockUserInput = { name: "John Wick", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
            req = { body: mockUserInput };
            (validateEmail as jest.Mock).mockReturnValue(true);
            (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
            (hashPassword as jest.Mock).mockResolvedValue(null);
            await userController.addNewUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(sendMock).toHaveBeenCalledWith("Error hashing password");
        });

       it('should return 500 on any error', async () => {
            const mockUserInput = { name: "John Wick1", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
            req = { body: mockUserInput };
            (validateEmail as jest.Mock).mockReturnValue(true);
            (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
            (hashPassword as jest.Mock).mockResolvedValue("hashed_password");
            (userService.createUser as jest.Mock).mockRejectedValue(new Error("Database error"));
            await userController.addNewUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(sendMock).toHaveBeenCalledWith("Internal server error");
       });

       it('should return 500 on network error', async () => {
            const mockUserInput = { name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
            req = { body: mockUserInput };
            (validateEmail as jest.Mock).mockReturnValue(true);
            (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
            (hashPassword as jest.Mock).mockResolvedValue("hashed_password");
            (userService.createUser as jest.Mock).mockRejectedValue(new Error("network timeout"));
            await userController.addNewUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(sendMock).toHaveBeenCalledWith("Internal server error");
       });
    });

    describe("updateUserDetails Function", () => {
        it('should return 401 if user ID is not provided', async () => {
            const mockUserInput = { name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02") };
            req = { params: { id: "" }, body: mockUserInput };
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("User ID Required & Required as a number");
        });

        it('should return 401 if user ID is not a number', async () => {
            const mockUserInput = { name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02") };
            req = { params: { id: "abc" }, body: mockUserInput };
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("User ID Required & Required as a number");
        });

        it('should return 401 if name is empty', async () => {
            const mockUserInput = { name: "", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02") };
            req = { params: { id: "1" }, body: mockUserInput };
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("All fields are required");
        });

        it('should return 401 if email is empty', async () => {
            const mockUserInput = { name: "John Wick2", email: "", age: 57, dob: new Date("1966-09-02") };
            req = { params: { id: "1" }, body: mockUserInput };
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("All fields are required");
        });

        it('should return 401 if age is empty', async () => {
            const mockUserInput = { name: "John Wick2", email: "johnwick@gmail.com", age: "", dob: new Date("1966-09-02") };
            req = { params: { id: "1" }, body: mockUserInput };
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("Age is required and must be a positive number greater than 0");
        });

        it('should return 401 if age is not a number', async () => {
            const mockUserInput = { name: "John Wick2", email: "johnwick@gmail.com", age: "abc", dob: new Date("1966-09-02") };
            req = { params: { id: "1" }, body: mockUserInput };
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("Age is required and must be a positive number greater than 0");
        });

        it('should return 401 if age is 0', async () => {
            const mockUserInput = { name: "John Wick2", email: "johnwick@gmail.com", age: 0, dob: new Date("1966-09-02") };
            req = { params: { id: "1" }, body: mockUserInput };
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("Age is required and must be a positive number greater than 0");
        });

        it('should return 401 if dob is empty', async () => {
            const mockUserInput = { name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: "" };
            req = { params: { id: "1" }, body: mockUserInput };
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("All fields are required");
        });

        it('should return 400 if email is not valid', async () => {
            const mockUserInput = { name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02") };
            req = { params: { id: "1" }, body: mockUserInput };
            (validateEmail as jest.Mock).mockReturnValue(false);
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(sendMock).toHaveBeenCalledWith("Invalid email format");
        });

        it('should return 404 if the user not found for given ID', async () => {
            req = { params: { id: "1" }, body: { name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02") } };
            (validateEmail as jest.Mock).mockReturnValue(true);
            (userService.getUserById as jest.Mock).mockResolvedValue(null);
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(sendMock).toHaveBeenCalledWith("User not found");
        });

        // it('should return 400 if user data found for given Email', async () => {
        //     const mockUser = { id: 1, name: "John Wick", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
        //     req = { params: { id: "1" }, body: { name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02") } };
        //     (validateEmail as jest.Mock).mockReturnValue(true);
        //     (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
        //     (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
        //     await userController.updateUserDetails(req as Request, res as Response);
        //     expect(statusMock).toHaveBeenCalledWith(400);
        //     expect(sendMock).toHaveBeenCalledWith("Email already exists");
        // });

        it('should return 400 if user update failed', async () => {
            const mockUserInput = { name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02") };
            req = { params: { id: "1" }, body: mockUserInput };
            (validateEmail as jest.Mock).mockReturnValue(true);
            (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
            (userService.updateUser as jest.Mock).mockResolvedValue(null);
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(sendMock).toHaveBeenCalledWith("User Update Failed");
        });

        it('should return success, 200 if user update is successful', async () => {
            const mockUserInput = { name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02") };
            req = { params: { id: "1" }, body: mockUserInput };
            (validateEmail as jest.Mock).mockReturnValue(true);
            (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
            (userService.updateUser as jest.Mock).mockResolvedValue(mockUserInput);
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ message: "User updated successfully", data: mockUserInput });
        });

        it('should return 500 on any error', async () => {
            const mockUserInput = { name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02") };
            req = { params: { id: "1" }, body: mockUserInput };
            (userService.updateUser as jest.Mock).mockRejectedValue(new Error("Database error"));
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(sendMock).toHaveBeenCalledWith("Internal server error");
        });

        it('should return 500 on network error', async () => {
            const mockUserInput = { name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02") };
            req = { params: { id: "1" }, body: mockUserInput };
            (userService.updateUser as jest.Mock).mockRejectedValue(new Error("network timeout"));
            await userController.updateUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(sendMock).toHaveBeenCalledWith("Internal server error");
        });
    });

    describe("deleteUserDetails Function", () => {
        it('should return 401 if user ID is not provided', async () => {
            req = { params: { id: "" } };
            await userController.deleteUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("User ID Required & Required as a number");
        });

        it('should return 401 if user ID is not a number', async () => {
            req = { params: { id: "abc" } };
            await userController.deleteUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith("User ID Required & Required as a number");
        });

        it('should return 404 if the user not found for given ID', async () => {
            req = { params: { id: "1" } };
            (userService.getUserById as jest.Mock).mockResolvedValue(null);
            await userController.deleteUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(sendMock).toHaveBeenCalledWith("User not found");
        });

        it('should return success, 200 if the user is deleted', async () => {
            req = { params: { id: "1" } };
            (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
            (userService.deleteUser as jest.Mock).mockResolvedValue(mockUser);
            await userController.deleteUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ message: `User with ID 1 deleted successfully`, data: mockUser });
        });

        it('should return 500 on any error', async () => {
            req = { params: { id: "1" } };
            (userService.deleteUser as jest.Mock).mockRejectedValue(new Error("Database error"));
            await userController.deleteUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(sendMock).toHaveBeenCalledWith("Internal server error");
        });

        it('should return 500 on network error', async () => {
            req = { params: { id: "1" } };
            (userService.deleteUser as jest.Mock).mockRejectedValue(new Error("network timeout"));
            await userController.deleteUserDetails(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(sendMock).toHaveBeenCalledWith("Internal server error");
        });
    });

    describe("updateUsersName Function", () => {
       it('should return 401 if the user ID not provided', async () => {
          req = { params: { id: "" }, body: { name: "John Wick" } };
          await userController.updateUsersName(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(401);
          expect(sendMock).toHaveBeenCalledWith("User ID Required & Required as a number");
       });

       it('should return 401 if the user ID is not a number', async () => {
          req = { params: { id: "abc" }, body: { name: "John Wick" } };
          await userController.updateUsersName(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(401);
          expect(sendMock).toHaveBeenCalledWith("User ID Required & Required as a number");
       });

       it('should return 401 if the name is empty', async () => {
          req = { params: { id: "1" }, body: { name: "" } };
          await userController.updateUsersName(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(401);
          expect(sendMock).toHaveBeenCalledWith("Name is required");
       });

       it('should return 404 if the user not found for given ID', async () => {
          req = { params: { id: "1" }, body: { name: "John Wick" } };
          (userService.getUserById as jest.Mock).mockResolvedValue(null);
          await userController.updateUsersName(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(404);
          expect(sendMock).toHaveBeenCalledWith("User not found");
       });


       it('should return 400 if the user name update failed', async () => {
          const mockUser = { id: 1, name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
          req = { params: { id: "1" }, body: { name: "John Wick" } };
          (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
          (userService.updateUserName as jest.Mock).mockResolvedValue(null);
          await userController.updateUsersName(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(400);
          expect(sendMock).toHaveBeenCalledWith("User Name Update Failed");
       });

       it('should return success, 200 if the user name update successful', async () => {
          const mockUser = { id: 1, name: "John Wick", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
          req = { params: { id: "1" }, body: { name: "John Wick" } };
          (userService.updateUserName as jest.Mock).mockResolvedValue(mockUser);
          await userController.updateUsersName(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(200);
          expect(jsonMock).toHaveBeenCalledWith({ message: "User name updated successfully", data: mockUser });
       });

       it('should return 500 on any error', async () => {
          req = { params: { id: "1" }, body: { name: "John Wick" } };
          (userService.updateUserName as jest.Mock).mockRejectedValue(new Error("Database error"));
          await userController.updateUsersName(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(500);
          expect(sendMock).toHaveBeenCalledWith("Internal server error");
       });

       it('should return 500 on network error', async () => {
          req = { params: { id: "1" }, body: { name: "John Wick" } };
          (userService.updateUserName as jest.Mock).mockRejectedValue(new Error("network timeout"));
          await userController.updateUsersName(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(500);
          expect(sendMock).toHaveBeenCalledWith("Internal server error");
       });
    });

    describe("updateUsersEmail Function", () => {
       it('should return 401 if the user ID not provided', async () => {
          req = { params: { id: "" }, body: { email: "johnwick@gmail.com" } };
          await userController.updateUsersEmail(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(401);
          expect(sendMock).toHaveBeenCalledWith("User ID Required & Required as a number");
       });

       it('should return 401 if the user ID is not a number', async () => {
          req = { params: { id: "abc" }, body: { email: "johnwick@gmail.com" } };
          await userController.updateUsersEmail(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(401);
          expect(sendMock).toHaveBeenCalledWith("User ID Required & Required as a number");
       });

       it('should return 401 if the email is empty', async () => {
          req = { params: { id: "1" }, body: { email: "" } };
          await userController.updateUsersEmail(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(401);
          expect(sendMock).toHaveBeenCalledWith("Email is required");
       });

       it('should return 400 if the email is not valid', async () => {
          req = { params: { id: "1" }, body: { email: "johnwick" } };
          (validateEmail as jest.Mock).mockReturnValue(false);
          await userController.updateUsersEmail(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(400);
          expect(sendMock).toHaveBeenCalledWith("Invalid email format");
       });

       it('should return 404 if the user not found for given ID', async () => {
          req = { params: { id: "1" }, body: { email: "johnwick@gmail.com" } };
          (validateEmail as jest.Mock).mockReturnValue(true);
          (userService.getUserById as jest.Mock).mockResolvedValue(null);
          await userController.updateUsersEmail(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(404);
          expect(sendMock).toHaveBeenCalledWith("User not found");
       });

       it('should return 400 if the user exists for given Email', async () => {
          req = { params: { id: "1" }, body: { email: "johnwick@gmail.com" } };
          const mockUser = { id: 1, name: "John Wick", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
          (validateEmail as jest.Mock).mockReturnValue(true);
          (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
          (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
          await userController.updateUsersEmail(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(400);
          expect(sendMock).toHaveBeenCalledWith("Email already exists");
       });

       it('should return 400 if the user email update failed', async () => {
          req = { params: { id: "1" }, body: { email: "johnwick@gmail.com" } };
          const mockUser = { id: 1, name: "John Wick", email: "johnwick1@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
          (validateEmail as jest.Mock).mockReturnValue(true);
          (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
          (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
          (userService.updateUserName as jest.Mock).mockResolvedValue(null);
          await userController.updateUsersEmail(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(400);
          expect(sendMock).toHaveBeenCalledWith("User Email Update Failed");
       });

       it('should return success, 200 if the user email update successful', async () => {
          const mockUser = { id: 1, name: "John Wick", email: "johnwick1@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
          const updatedMockUser = { id: 1, name: "John Wick", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
          req = { params: { id: "1" }, body: { email: "johnwick@gmail.com" } };
          (validateEmail as jest.Mock).mockReturnValue(true);
          (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
          (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
          (userService.updateUserEmail as jest.Mock).mockResolvedValue(updatedMockUser);
          await userController.updateUsersEmail(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(200);
          expect(jsonMock).toHaveBeenCalledWith({ message: "User Email updated successfully", data: updatedMockUser });
       });

       it('should return 500 on any error', async () => {
          req = { params: { id: "1" }, body: { email: "johnwick@gmail.com" } };
          (userService.updateUserEmail as jest.Mock).mockRejectedValue(new Error("Database error"));
          await userController.updateUsersEmail(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(500);
          expect(sendMock).toHaveBeenCalledWith("Internal server error");
       });

       it('should return 500 on network error', async () => {
          req = { params: { id: "1" }, body: { email: "johnwick@gmail.com" } };
          (userService.updateUserEmail as jest.Mock).mockRejectedValue(new Error("network timeout"));
          await userController.updateUsersEmail(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(500);
          expect(sendMock).toHaveBeenCalledWith("Internal server error");
       });
    });

    describe("updateUsersPassword Function", () => {
       it('should return 401 if the user ID not provided', async () => {
          req = { params: { id: "" }, body: { newPassword: "password456", oldPassword: "password123" } };
          await userController.updateUsersPassword(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(401);
          expect(sendMock).toHaveBeenCalledWith("User ID Required & Required as a number");
       });

       it('should return 401 if the user ID is not a number', async () => {
          req = { params: { id: "abc" }, body: { newPassword: "password456", oldPassword: "password123" } };
          await userController.updateUsersPassword(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(401);
          expect(sendMock).toHaveBeenCalledWith("User ID Required & Required as a number");
       });

       it('should return 401 if the oldPassword is empty', async () => {
          req = { params: { id: "1" }, body: { newPassword: "password456", oldPassword: "" } };
          await userController.updateUsersPassword(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(401);
          expect(sendMock).toHaveBeenCalledWith("New & Old Passwords Required");
       });

       it('should return 401 if the oldPassword is empty', async () => {
          req = { params: { id: "1" }, body: { newPassword: "", oldPassword: "password123" } };
          await userController.updateUsersPassword(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(401);
          expect(sendMock).toHaveBeenCalledWith("New & Old Passwords Required");
       });

       it('should return 404 if the user not found for given ID', async () => {
          req = { params: { id: "1" }, body: { newPassword: "password456", oldPassword: "password123" } };
          (userService.getUserById as jest.Mock).mockResolvedValue(null);
          await userController.updateUsersPassword(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(404);
          expect(sendMock).toHaveBeenCalledWith("User not found");
       });

       it('should return 400 if the old password verification failed', async () => {
          const mockUser = { id: 1, name: "John Wick", email: "johnwick1@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "hashed_password123" };
          req = { params: { id: "1" }, body: { newPassword: "password456", oldPassword: "password123" } };
          (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
          (verifyPassword as jest.Mock).mockReturnValue(false);
          await userController.updateUsersPassword(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(400);
          expect(sendMock).toHaveBeenCalledWith("Old password, entered is incorrect");
       });

       it('should return 400 if the new password hashing failed', async () => {
          const mockUser = { id: 1, name: "John Wick", email: "johnwick1@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "hashed_password123" };
          req = { params: { id: "1" }, body: { newPassword: "password456", oldPassword: "password123" } };
          (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
          (verifyPassword as jest.Mock).mockReturnValue(true);
          (hashPassword as jest.Mock).mockResolvedValue(null);
          await userController.updateUsersPassword(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(400);
          expect(sendMock).toHaveBeenCalledWith("Error hashing new password");
        });

       it('should return 400 if the user password update failed', async () => {
          const mockUser = { id: 1, name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "password123" };
          req = { params: { id: "1" }, body: { newPassword: "password456", oldPassword: "password123" } };
          (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
          (verifyPassword as jest.Mock).mockReturnValue(true);
          (hashPassword as jest.Mock).mockResolvedValue("hashed_password456");
          (userService.updateUserPassword as jest.Mock).mockResolvedValue(null);
          await userController.updateUsersPassword(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(400);
          expect(sendMock).toHaveBeenCalledWith("User Password Update Failed");
       });

       it('should return success, 200 if the user password update successful', async () => {
          const mockUser = { id: 1, name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "hashed_password123" };
          const updatedMockUser = { id: 1, name: "John Wick2", email: "johnwick@gmail.com", age: 57, dob: new Date("1966-09-02"), password: "hashed_password456" };
          req = { params: { id: "1" }, body: { newPassword: "password456", oldPassword: "password123" } };
          (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
          (verifyPassword as jest.Mock).mockReturnValue(true);
          (hashPassword as jest.Mock).mockResolvedValue("hashed_password456");
          (userService.updateUserPassword as jest.Mock).mockResolvedValue(updatedMockUser);
          await userController.updateUsersPassword(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(200);
          expect(jsonMock).toHaveBeenCalledWith({ message: "User Password updated successfully", data: updatedMockUser });
       });

       it('should return 500 on any error', async () => {
          req = { params: { id: "1" }, body: { newPassword: "password456", oldPassword: "password123" } };
          (userService.updateUserPassword as jest.Mock).mockRejectedValue(new Error("Database error"));
          await userController.updateUsersPassword(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(500);
          expect(sendMock).toHaveBeenCalledWith("Internal server error");
       });

       it('should return 500 on network error', async () => {
          req = { params: { id: "1" }, body: { newPassword: "password456", oldPassword: "password123" } };
          (userService.updateUserPassword as jest.Mock).mockRejectedValue(new Error("network timeout"));
          await userController.updateUsersPassword(req as Request, res as Response);
          expect(statusMock).toHaveBeenCalledWith(500);
          expect(sendMock).toHaveBeenCalledWith("Internal server error");
       });
    });
});