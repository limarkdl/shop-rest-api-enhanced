import express from "express";
import UserRouter from "./api/routes/UserRoutes.js";
import ProductRouter from "./api/routes/ProductRoutes.js";
import OrderRouter from "./api/routes/OrderRoutes.js";
import CategoryRouter from "./api/routes/CategoryRoutes.js";

import sequelize from "./api/sequelize.config.js";

// Creating instance of Express
const app = express();

// Configuring EJS
app.set('view engine', 'ejs');

// Adding URLEncoding functionality
app.use(express.urlencoded({ extended: true }));

// Adding json functionality
app.use(express.json());


// Index page
app.get("/", (req, res) => {
    res.render('index');
});



// ROUTING
    // User
app.use('/user', UserRouter);
    // Product
app.use('/product', ProductRouter);
    // Order
app.use('/order', OrderRouter);
    // Category
app.use('/category', CategoryRouter);


// Catching all unknown and not-existing routes
app.all('*', (req, res) => {
    res.render('404');
});


// Establishing a connection with the db
try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

// Starting listening 3000 Port
app.listen(3000, () => {
    console.log("Server is running on port 3000");
    }
    
);


/* 
    TO DROP ALL TABLES AND SYNCHRONIZE 
*/  

// await sequelize.sync({ force: true });
// console.log("All models were synchronized successfully.");
