import express from "express";
import * as userController from "../controller/userController";

const router = express.Router();

// Route to fetch all user data ...
router.get("/", userController.fetchAllUserData);

// Route to fetch user by ID ...
router.get("/:id", userController.fetchUserById);

// Route to add a new user ...
router.post("/", userController.addNewUser);

// Route to update a user ...
router.put("/:id", userController.updateUserDetails);

// Route to delete a user ...
router.delete("/:id", userController.deleteUserDetails);

// Route to update a user name ...
router.patch("/:id/name", userController.updateUsersName);

// Route to update a user email ...
router.patch("/:id/email", userController.updateUsersEmail);

// Route to update a user password ...
router.patch("/:id/password", userController.updateUsersPassword);

export default router;