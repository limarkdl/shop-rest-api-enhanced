import express from "express";
import OrderController from "../controllers/OrderController.js";

// Creating new instance of Express router
const OrderRouter = new express.Router();

// GET ORDERS
OrderRouter.get('/list', OrderController.getOrders);


// Exporting this router
export default OrderRouter;