import sequelize from "../sequelize.config.js"; // Убедитесь, что путь корректен
import { DataTypes } from "sequelize";

export const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 50],
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0,
        }
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 0,
        }
    },
    categoryID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Categories',
            key: 'id'
        },
    },
    
}, {
    
});

// Making sure that they are synchronized
console.log(Product === sequelize.models.Product);


// Exporting this model
export default Product;