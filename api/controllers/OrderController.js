import db from '../models/index.js';

// Order Controller is responsible for transactions, business-logic, validation and communication with the db 

class OrderController {
  // Get orders
    async getOrders(req, res) {
        try {
            // Getting all orders from the db
            const orders = await db.Order.findAll();
            console.log(orders);
            // Success | 200
            res.status(200).send(orders);
          } catch (error) {
            console.error(error);
            // Internal error | 422
            res.status(422).send('An error occurred while retrieving the users.');
          }
    }

}

// Exporting class as new instance
export default new OrderController();