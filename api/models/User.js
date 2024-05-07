import sequelize from "../sequelize.config.js"; 
import { DataTypes } from "sequelize";

export const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^[a-zA-Z0-9_]+$/, 
            notEmpty: true,
          }
    },
    accountBalance: {
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false,
        validate: {
            isDecimal: true, 
            min: 0,
        }
    }
}, {
});

// Making sure that they are synchronized
console.log(User === sequelize.models.User);


// Exporting this model
export default User;
