import express from 'express';
import apiRoutes from './routes/apiRoutes';
import { AppDataSource } from "./database/dataSource"
import "reflect-metadata";

import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

app.use('/api', apiRoutes); // API routes


const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        app.listen(port, () => {
            console.log(`Server running at port ${port}...`);
        });

    } catch (err) {
        console.error("Error during Data Source initialization", err);
    }
};

startServer();