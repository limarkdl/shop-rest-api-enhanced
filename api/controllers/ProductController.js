import db from '../models/index.js';

import { Op } from 'sequelize';

// Product Controller is responsible for transactions, business-logic, validation and communication with the db 


class ProductController {
  // Create product
  async createProduct(req, res) {
    // Creating new transaction
    const t = await db.sequelize.transaction();
    try {
      // Extracting params
      let {
        name,
        description = 'No product description',
        price,
        stock,
        categoryID,
      } = req.body;

      // Validation checks
      if (!name || typeof name !== 'string' || name.length > 50) {
        // Throwing error in case of validation error
        throw new Error(
          'Product name is required, must be a string, and limited to 50 characters.'
        );
      }

      // Validation checks
      if (isNaN(parseFloat(price)) || price < 0) {
        // Throwing new error in case of validation error
        throw new Error('The price must be a positive number.');
      }

      // Validation checks
      if (isNaN(parseInt(stock, 10)) || stock < 0) {
        // Throwing error in case of validation error
        throw new Error('The stock must be a positive integer.');
      }

      // Validation checks
      if (isNaN(parseInt(categoryID, 10))) {
        // Throwing error in case of validation error
        throw new Error('The categoryID must be a valid number.');
      }

      // Getting category by ID from the db
      const categoryExists = await db.Category.findByPk(categoryID, {
        transaction: t,
      });
      // Checking if category exists
      if (!categoryExists) {
        // Throwing new error if it doesn't exist
        throw new Error('The specified category does not exist.');
      }

      // Create product in the db
      const product = await db.Product.create(
        {
          name,
          description,
          price,
          stock,
          categoryID,
        },
        { transaction: t }
      );

      // Committing the transaction
      await t.commit();
      // Success | 200
      res.status(200).json(product);
    } catch (error) {
      // Rollback in case of an error
      await t.rollback();

      // Default status is Internal error (500)
      let status = 500;
      // Default message
      let message = 'An error occurred while creating the product.';

      // Determing type of the error
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Contraints error | 409
        status = 409;
        message = 'A product with this name already exists.';
      } else if (error.name === 'SequelizeValidationError') {
        // Validation error | 422
        status = 422;
        message = error.errors.map((e) => e.message).join('; ');
      } else if (error.message) {
        // Any other from the code above| 422
        status = 422;
        message = error.message;
      }

      console.error(error);
      // Sending error code and message
      res.status(status).send(message);
    }
  }

  // Get product by ID
  async getProductByID(req, res) {
    try {
      // Validation checks
      if (isNaN(req.params.id)) {
        // Validation error | 422
        res.status(422).send('The product ID must be a valid number.');
        return;
      }

      // Getting product from the db
      const product = await db.Product.findByPk(req.params.id, {
        include: {
          model: db.Category,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        attributes: { exclude: ['createdAt', 'updatedAt', 'productID'] },
      });

      // Checking if product exists
      if (!product) {
        // No such product | 404
        res.status(404).send('Product not found.');
      } else {
        // Success | 200
        res.status(200).send(product);
      }
    } catch (error) {
      console.error(error);
      // Internal error | 500
      res.status(500).send('An error occurred while retrieving the product.');
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    // Creating new transaction
    const t = await db.sequelize.transaction();
    try {
      // Validation checks
      if (!req.query.id || isNaN(req.query.id)) {
        // Rollback in case of an error
        await t.rollback();
        // Validation error | 422
        return res
          .status(422)
          .send('The product ID is required and must be a number.');
      }

      // Geting product from the db
      const product = await db.Product.findByPk(req.query.id, {
        transaction: t,
      });

      // Checking if product exists
      if (!product) {
        // Rollback in case of an error
        await t.rollback();
        // No such product | 404
        return res.status(404).send('Product not found.');
      }

      // Checking how many orders have this product
      const orderCount = await db.OrderProducts.count({
        where: { productID: req.query.id },
      });
      // Chkecing if any order has this product
      if (orderCount > 0) {
        // Rollback in case of error
        await t.rollback();
        // Constraint error | 422
        return res
          .status(422)
          .send(
            'The product cannot be deleted because it is referenced by orders.'
          );
      }

      // Deleting product from the db
      await product.destroy({ transaction: t });

      // Commiting the transaction
      await t.commit();
      // Success | 200
      return res.status(200).send('OK');
    } catch (error) {
      // Rollback in the case of an error
      await t.rollback();
      console.error(error);
      // Internal error | 500
      return res
        .status(500)
        .send('An error occurred while deleting the product.');
    }
  }

  // Get a list of all products
  async getAllProducts(req, res) {

    try {
        // Empty object to store params
        let where = {};

        // Checking if there is a category ID param
        if (req.query.categoryID) {
            // Validation checks
            if (isNaN(parseInt(req.query.categoryID, 10))) {
              // Validation error | 422
              return res.status(422).send('The categoryID must be a valid number.');
            }
            // Adding category ID to the list of params
            where.categoryID = req.query.categoryID;
        }
    
        // Checking if there is a price param
        if (req.query.price) {
            // Exctracting price from the query
            const price = req.query.price.split('_');
            // Validation checks
            if (price.length !== 2) {
              // Validation error | 422  
              return res
                    .status(422)
                    .send('The price filter must be in the format: <compare_operator>_<value>');
            }
        
            // Desctructurization 
            const [operator, value] = price;
            // Validation checks
            if (isNaN(parseFloat(value))) {
              // Validation error | 422  
              return res.status(422).send('The price filter value must be a number.');
            }
        
            // Listing all the possible operators assigning them to the Sequelizer embedded functionality
            const operatorsMap = {
                gte: Op.gte,
                gt: Op.gt,
                eq: Op.eq,
                lt: Op.lt,
                lte: Op.lte
            };
        
            // Checking if operator is valid and exists in our list
            if (!operatorsMap[operator]) {
              // Validation error | 422
                return res
                    .status(422)
                    .send('The price filter operator must be one of: gte, gt, eq, lt, lte');
            }
        
            // Adding price param to the list of params for search
            where.price = { [operatorsMap[operator]]: value };
        }
    
        // Getting all products with specified filters
        const products = await db.Product.findAll({
            where,
            include: {
            model: db.Category,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            },
            attributes: { exclude: ['createdAt', 'updatedAt', 'productID'] },
        });
        // Success | 200
        res.status(200).send(products);
    } catch (error) {
        console.error(error);
        // Internal error | 500
        res.status(500).send('An error occurred while retrieving the products.');
    }


  }

  // Update product
  async updateProduct(req, res) {
    // Starting new transaction
    const t = await db.sequelize.transaction();
    try {
      // Validation checks
      if (!req.body.id || isNaN(req.body.id)) {
        // Rollback in case of an error
        await t.rollback();
        // Validation error | 422
        return res.status(422).send('The product ID is required and must be a number.');
      }

      // Getting product from the db
      const product = await db.Product.findByPk(req.body.id, { transaction: t });
      // Checking if the product exists
      if (!product) {
        // Rollback in case of an error
        await t.rollback();
        // No such product | 404
        return res.status(404).send('Product not found.');
      }

      // Checking if category ID is in the request
      if(req.body.categoryID){
        // Getting category from the db
        const categoryExists = await db.Category.findByPk(req.body.categoryID, {
          transaction: t,
        });
        // Checking if the category exists
        if (!categoryExists) {
          // Rollback in case of an error
          await t.rollback();
          // No such category | 422
          return res.status(422).send('The specified category does not exist.');
        }
      }

      // Updating product
      const updatedProduct = await product.update(req.body, { transaction: t });

      // Commiting the transaction
      await t.commit();
      // Success | 200
      return res.status(200).send(updatedProduct);
    } catch (error) {
      // Rollback in case of an error
      await t.rollback();

      // Default error status is Internal error (500)
      let status = 500;
      // Default message
      let message = 'An error occurred while updating the product.';

      // Determing type of the error
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Constaint error | 409
        status = 409;
        message = 'A product with this name already exists.';
      } else if (error.name === 'SequelizeValidationError') {
        // Validation error | 422
        status = 422;
        message = error.errors.map((e) => e.message).join('; ');
      } else if (error.message) {
        // Any other errors | 422
        status = 422;
        message = error.message;
      }

      console.error(error);
      // Returning error status and message 
      res.status(status).send(message);
    }
  }
}

// Exporting class as new instance
export default new ProductController();
