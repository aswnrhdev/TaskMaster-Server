import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import router from "./routes/userRouter.js";
import connectDB from "./config/dbConnection.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import cookieParser from "cookie-parser";
import http from 'http'
import { initializeSocket } from "./config/socket.js";

dotenv.config()

const app = express();
const server = http.createServer(app)

connectDB()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(cors({
    origin: 'https://taskmaster-dun.vercel.app',
    credentials: true,
}));

const port = process.env.PORT || 5000;

const io = initializeSocket(server)
app.set('io', io)

app.use(router)

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})