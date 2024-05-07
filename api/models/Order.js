import sequelize from "../sequelize.config.js"; 
import { DataTypes } from "sequelize";

export const Order = sequelize.define('Order', {
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
}, {
    
});

// Making sure that they are synchronized
console.log(Order === sequelize.models.Order);


// Exporting this model
export default Order;
