import express from "express";
import CategoryController from "../controllers/CategoryController.js";

// Creating new instance of Express router 
const CategoryRouter = new express.Router();

// CREATE CATEGORY
CategoryRouter.post('/create', CategoryController.createCategory);

// DELETE CATEGORY
CategoryRouter.delete('/delete', CategoryController.deleteCategory);


// Exporting this router
export default CategoryRouter;