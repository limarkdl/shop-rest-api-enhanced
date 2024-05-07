import db from '../models/index.js';

// User Controller is responsible for transactions, business-logic, validation and communication with the db 


class UserController {
  // Creating user
  async createUser(req, res) {
    // Starting a transaction
    const t = await db.sequelize.transaction();
    try {
      // Extracting params
      const { username, accountBalance } = req.body;
      console.log('CREATE USER WITH USERNAME: ' + username);
      // Validation
      if (!username || typeof username !== 'string' || username.length < 2 || username.length > 50 || !username.trim()) {
        return res.status(422).send(('Username is required and must be a valid string.'));
      }
      // Checking if user's balance sufficient
      if (isNaN(parseFloat(accountBalance)) || accountBalance < 0) {
        return res.status(422).send(('The account balance must be a positive number.'));
      }

      // Creating user
      const user = await db.User.create(
        { username, accountBalance },
        { transaction: t }
      );

      // Creating cart
      await db.Cart.create({ userID: user.id }, { transaction: t });

      // Committing transaction
      await t.commit();
      
      // Success | 200
      res.status(200).send(user);
    } catch (error) {
      // Rollback in case of an error
      await t.rollback();

      // Determining the type of error
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Constraint error
        res.status(422).send('A user with this username already exists.');
      } else if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map((e) => e.message);
        // Validation error | 422
        res.status(422).send(messages);
      } else {
        console.error(error);
        // Internal error | 500
        res.status(500).send('An error occurred while creating the user.');
      }
    }
  }

  // Fetch user's details by ID
  async getUserByID(req, res) {
    try {
      // Getting user's info from db
      const user = await db.User.findByPk(req.params.id);
      console.log('GET USER\'s INFO FOR User: ' + req.params.id);

      // Checking if it exists
      if (!user) {
        // No such user | 404
        res.status(404).send('User not found.');
      } else {
        // Success | 200
        res.status(200).send(user);
      }
    } catch (error) {
      // Internal error | 500
      res.status(500).send('An error occurred while retrieving the user.');
    }
  }

  // Deleting user by ID
  async deleteUser(req, res) {
    // Starting a transaction
    const t = await db.sequelize.transaction();
    try {
      // Validation checks
      if (!req.body.id || isNaN(req.body.id)) {
        // Rollback in case of an error
        await t.rollback();
        // Validation error | 422
        return res
          .status(422)
          .send('The user ID is required and must be a number.');
      }
      console.log('DELETE USER FOR User: ' + req.body.id);

      // Getting user from the db by ID
      const user = await db.User.findByPk(req.body.id, { transaction: t });

      // Cheking if user exists
      if (!user) {
        // Rollback in case of an error
        await t.rollback();
        // No such user | 404
        return res.status(404).send('User not found.');
      }

      // Deleting user from the db
      await user.destroy({ transaction: t });

      // Commiting the transaction
      await t.commit();
      // Success | 200
      return res.status(200).send('OK');
    } catch (error) {
      // Rollback in case of an error
      if (t) {
        await t.rollback();
      }
      // Internal error | 422
      return res.status(422).send('An error occurred while deleting the user.');
    }
  }

  // Getting all users
  async getAllUsers(req, res) {
    try {
      // Getting all users from the db
      const users = await db.User.findAll();
      // Success | 200
      res.status(200).send(users);
    } catch (error) {
      // Internal error | 422
      res.status(422).send('An error occurred while retrieving the users.');
    }
  }

  // Getting user's cart
  async getUserCart(req, res) {
    try {
      // Explicit parsing ID to int
      const userId = parseInt(req.query.userID);

      // Validation
      if (isNaN(userId)) {
        // Validation error | 422
        return res.status(422).send('The user ID must be a valid number.');
      }

      // Getting cart's items
      const cartItems = await db.Cart.findAll({
        where: { userID: userId },
        include: [{ model: db.Product }],
      });

      // Checking if it's empty
      if (cartItems.length === 0) {
        return res.status(404).send('Cart not found or is empty.');
      }

      // Mapping all products from the cart
      const productIDs = cartItems
        .filter((item) => item.productID !== null)
        .map((item) => item.productID);

      // Creating result obj
      const result = {
        cartID: cartItems[0].id,
        userID: userId,
        productIDs: productIDs,
      };

      // Success | 200
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      // Internal error | 500
      res.status(500).send('An error occurred while retrieving the cart.');
    }
  }

  // Adding product to user's cart
  async addToUserCart(req, res) {
    // Starting a transaction
    const t = await db.sequelize.transaction();
    try {
      // Extracting params
      const { userID, productID } = req.body;
      console.log('ADD TO USER CART FOR User: ' + userID);

      // Validation of user's ID
      if (!userID || isNaN(userID)) {
        // Rollback in case of validation error
        await t.rollback();
        // Validation error for user ID| 422
        return res
          .status(422)
          .send('The user ID is required and must be a number.');
      }

      // Validation of product's ID
      if (!productID || isNaN(productID)) {
        // Rollback in case of validation error
        await t.rollback();
        // Validation error for product ID | 422
        return res
          .status(422)
          .send('The product ID is required and must be a number.');
      }

      // Getting user from the db
      const user = await db.User.findByPk(userID, { transaction: t });
      // Checking if user exists
      if (!user) {
        // Rollback if it doesn't exist
        await t.rollback();
        // No such user | 404
        return res.status(404).send('User not found.');
      }

      // Getting product from the db
      const product = await db.Product.findByPk(productID, { transaction: t });
      // Checking if product exists
      if (!product) {
        // Rollback if it doesn't exist
        await t.rollback();
        // No such product | 404
        return res.status(404).send('Product not found.');
      }

      // Getting cart with this product to check if it already exists
      const cart = await db.Cart.findOne({
        where: { userID, productID },
        transaction: t,
      });

      // Checking if cart with the same product exists
      if (cart) {
        // Rollback if it doesn't exist
        await t.rollback();
        // Product is already in the cart | 422
        return res
          .status(422)
          .send('The product is already in the user’s cart.');
      }

      // Creating new record for user's cart
      await db.Cart.create({ userID, productID }, { transaction: t });

      // Commiting the transaction
      await t.commit();
      // Success | 200
      res.status(200).send('OK');
    } catch (error) {
      // Rollback in case of an error
      if (t) {
        await t.rollback();
      }
      console.error(error);
      // Internal error | 500
      res
        .status(500)
        .send('An error occurred while adding the product to the user’s cart.');
    }
  }

  // Removing product from user's cart
  async removeFromUserCart(req, res) {
    // Creating a transaction
    const t = await db.sequelize.transaction();
    try {
      // Extracting params
      const { userID, productID } = req.body;
      console.log('REMOVE FROM USER CART FOR User: ' + userID);
      // Validation of user ID
      if (!userID || isNaN(userID)) {
        // Rollback in case of an error
        await t.rollback();
        // Validation error | 422
        return res
          .status(422)
          .send('The user ID is required and must be a number.');
      }

      // Validation of product ID
      if (!productID || isNaN(productID)) {
        // Rollback in case of an error
        await t.rollback();
        // Validation error | 422
        return res
          .status(422)
          .send('The product ID is required and must be a number.');
      }

      // Getting user from the db
      const user = await db.User.findByPk(userID, { transaction: t });
      // Checking if user exists
      if (!user) {
        // Rollback in case of an error
        await t.rollback();
        // No such user | 404
        return res.status(404).send('User not found.');
      }

      // Getting product from the db
      const product = await db.Product.findByPk(productID, { transaction: t });
      // Checking if product exists
      if (!product) {
        // Rollback in case of an error
        await t.rollback();
        // No such product | 422
        return res.status(422).send('Product not found.');
      }

      // Getting cart from the db
      const cart = await db.Cart.findOne({
        where: { userID, productID },
        transaction: t,
      });
      // Checking if cart exists
      if (!cart) {
        // Rollback in case of an error
        await t.rollback();
        // No such cart | 404
        return res.status(404).send('The product is not in the user’s cart.');
      }

      // Remove cart record
      await cart.destroy({ transaction: t });
      // Commiting the transaction
      await t.commit();
      // Success | 200
      res.status(200).send('OK');
    } catch (error) {
      // Rollback transaction in case of an error
      if (t) {
        await t.rollback();
      }
      console.error(error);
      // Internal error | 500
      res
        .status(500)
        .send(
          'An error occurred while removing the product from the user’s cart.'
        );
    }
  }

  // Purchasing user's cart
  async purchase(req, res) {
    // Creating a transaction
    const t = await db.sequelize.transaction();
    try {
      // Extracting params
      const { userID } = req.body;
      console.log('PURCHASE USER CART FOR User: ' + userID);

      // Validation
      if (!userID || isNaN(userID)) {
        // Rollback in case of an error
        await t.rollback();
        // Validation error
        return res.status(422).send('The user ID is required and must be a number.');
      }

      // Getting user from the db
      const user = await db.User.findByPk(userID, { transaction: t });
      // Checking if user exists
      if (!user) {
        // Rollback in case of an error
        await t.rollback();
        // No such user | 404
        return res.status(404).send('User not found.');
      }

      // Getting all cart records
      const cartItems = await db.Cart.findAll({
        where: { userID: userID },
        include: [{ model: db.Product }],
        transaction: t,
      });

      // Checking if there are some products
      if (cartItems.length === 0) {
        // Rollback in case of an error
        await t.rollback();
        // No cart records | 404
        return res.status(404).send('Cart not found or is empty.');
      }

      // Declaring total costs and set it to zero
      let totalCost = 0;


      // Mapping products' IDs from cart records
      const productIDs = cartItems
        .map(cartItem => cartItem.dataValues.productID) // Extract the productID from each cart item
        .filter(productID => productID !== null);
      console.log(productIDs)
      
      // Getting all products from the db
      const products = await db.Product.findAll({
        where: { id: productIDs },
        transaction: t
      });
      // Checking if user's account balance is enough
      if (user.accountBalance < totalCost) {
        // Rollback in case of an error
        await t.rollback();
        // User cannot afford it haha | 422
        return res.status(422).send('The user does not have enough funds to purchase the items.');
      }

      // Updating the user's account balance
      await user.update({ accountBalance: user.accountBalance - totalCost }, { transaction: t });

      // Creating a new order for the user
      const order = await db.Order.create({ userID: userID }, { transaction: t });

      // For each item creating record and updating stock
      for (const item of cartItems) {
        await db.OrderProducts.create({ orderID: order.id, productID: item.productID }, { transaction: t });
        await db.Product.update({ stock: db.sequelize.literal('stock - 1') }, { where: { id: item.productID }, transaction: t });

        // Remove item from the cart record
        await item.destroy({ transaction: t });
      }
      // Commiting the transaction
      await t.commit();
      // Success | 200
      return res.status(200).send('Purchase successful.');
    } catch (error) {
      console.error(error);
      // Rollback in case of an error
      await t.rollback();
      // Internal error | 500
      return res.status(500).send('An error occurred while purchasing the items.');
    }
  }

}

// Exporting class as new instance
export default new UserController();
