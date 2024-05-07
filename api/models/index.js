import sequelize from "../sequelize.config.js";

// Imorting all schemas
import User from "./User.js";
import Product from "./Product.js";
import Order from "./Order.js";
import Category from "./Category.js";
import Cart from "./Cart.js";
import OrderProducts from "./OrderProducts.js";

// Defining relationships and contraints

User.hasOne(Cart, {
    foreignKey: 'userID',
    onDelete: 'CASCADE'
});

Category.hasMany(Product, {
    foreignKey: 'categoryID'
});

Product.belongsTo(Category, {
    foreignKey: 'categoryID'
});

Cart.hasMany(Product, {
    foreignKey: 'productID',
});


// Combining all schemas and Sequelize entity
const db = {
    sequelize,
    User, 
    Cart,
    Category,
    Order,
    Product,
    OrderProducts
}

// Reexporting all schemas and Sequelize in one object
export default db;