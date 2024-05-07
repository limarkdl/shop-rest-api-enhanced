import sequelize from "../sequelize.config.js";
import { DataTypes } from "sequelize";

export const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [2, 50],
        }
    },
}, {
    
});

// Making sure that they are synchronized
console.log(Category === sequelize.models.Category);


// Exporting this model
export default Category;
