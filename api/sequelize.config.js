import { Sequelize } from "sequelize";

// Config for Sequelize
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "api/database/database.sqlite",
});

// Exporting configured Sequelize entity
export default sequelize;