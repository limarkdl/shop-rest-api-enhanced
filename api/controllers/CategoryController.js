import db from '../models/index.js';

// Category Controller is responsible for transactions, business-logic, validation and communication with the db 

class CategoryController {
  // Create new category
  async createCategory(req, res) {
    // Creating new transaction
    const t = await db.sequelize.transaction();

    try {
      // Validation
      if (!req.body.name) {
        // Rollback in case of an error
        await t.rollback();
        // Validation error | 422
        return res.status(422).send('The category name is required.');
      }

      // Creating category in the db
      const category = await db.Category.create({ name: req.body.name }, { transaction: t });

      // Commiting the transaction
      await t.commit();

      // Success | 200
      return res.status(200).send(category);
    } catch (error) {
      // Rollback in case of an error
      if (t) {
        await t.rollback();
      }

      // Determining the type of error
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Contraints error | 409
        res.status(409).send('A category with this name already exists.');
      } else if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map((e) => e.message);
        // Validation error | 422
        res.status(422).send(messages);
      } else {
        console.error(error);
        // Internal error | 500
        res.status(500).send('An error occurred while creating the category.');
      }
    }
  }

  // Delete category
  async deleteCategory(req, res) {
    // Extracting params
    const categoryId = parseInt(req.query.id, 10);

    // Validation
    if (isNaN(categoryId)) {
      // Validation error | 422
      return res.status(422).send('The category ID must be a valid number.');
    }

    try {
      // Counting all products
      const productCount = await db.Product.count({ where: { categoryId } });

      // Checking if there references
      if (productCount > 0) {
        // Contraints error | 422
        return res.status(422).send('The category cannot be deleted because it is referenced by products.');
      }

      // Getting category by ID from the db
      const category = await db.Category.findByPk(categoryId);
      // Checking if it exists
      if (!category) {
        // No such category | 404
        return res.status(404).send('Category not found.');
      }

      // Commiting transaction
      await category.destroy();
      // Success | 200
      return res.status(200).send('OK');
    } catch (error) {
      console.error(error);
      // Internal error | 500
      return res.status(500).send('An error occurred while deleting the category.');
    }
  }


}

// Exporting class as new instance
export default new CategoryController(); 