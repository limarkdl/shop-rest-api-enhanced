import sequelize from "../sequelize.config.js"; 
import { DataTypes } from "sequelize";

export const OrderProducts = sequelize.define('OrderProducts', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    orderID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Orders',
            key: 'id'
        },
    },
    productID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Products',
            key: 'id'
        },
    },
}, {
    
});

// Making sure that they are synchronized
console.log(OrderProducts === sequelize.models.OrderProducts);


// Exporting this model
export default OrderProducts;
