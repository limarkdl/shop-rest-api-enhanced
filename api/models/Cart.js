import sequelize from "../sequelize.config.js"; 
import { DataTypes } from "sequelize";

export const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    userID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        },
    },
    productID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Products',
            key: 'id'
        },
    },
}, {
    
});

// Making sure that they are synchronized
console.log(Cart === sequelize.models.Cart);


// Exporting this model
export default Cart;
