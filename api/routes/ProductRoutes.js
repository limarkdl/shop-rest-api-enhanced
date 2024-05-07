import express from "express";
import ProductController from "../controllers/ProductController.js";

// Creating new instance of Express router
const ProductRouter = new express.Router();

// CREATE PRODUCT
ProductRouter.post('/create', ProductController.createProduct);

// LIST ALL PRODUCTS
ProductRouter.get('/list', ProductController.getAllProducts);

// UPDATE PRODUCT
ProductRouter.put('/update', ProductController.updateProduct);

// DELETE PRODUCT
ProductRouter.delete('/delete', ProductController.deleteProduct);

// GET PRODUCT BY ID
ProductRouter.get('/:id', ProductController.getProductByID);


// Exporting this router
export default ProductRouter;