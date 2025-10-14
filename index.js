import 'dotenv/config';
import express from "express";
import webRoutes from "./routes/web.js";
import connectDB from './app/config/db.js';

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('public/uploads'));

app.use("/", webRoutes);

app.listen(3001, () => {
    console.log("App is listening to port 3001");
});