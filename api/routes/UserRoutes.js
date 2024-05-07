import express from "express";
import UserController from "../controllers/UserController.js";

// Creating new instance of Express router
const UserRouter = new express.Router();

// CREATE USER
UserRouter.post('/create', UserController.createUser);

// DELETE USER
UserRouter.delete('/delete', UserController.deleteUser);

// LIST ALL USERS
UserRouter.get('/list', UserController.getAllUsers);

// GET USER'S CART
UserRouter.get('/getCart', UserController.getUserCart);

// ADD TO USER'S CART
UserRouter.post('/addToCart', UserController.addToUserCart);

// DELETE FROM USER'S CART
UserRouter.delete('/removeFromCart', UserController.removeFromUserCart);

// PURCHASE USER'S CART
UserRouter.post('/purchase', UserController.purchase);

// GET USER BY ID
UserRouter.get('/:id', UserController.getUserByID);


// Export this router
export default UserRouter;