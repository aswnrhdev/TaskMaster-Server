import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import cors from 'cors';
import mongoose from 'mongoose';
import router from "./routes/userRouter.js"
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);


const corsOptions = {
    origin: "https://taskmaster-dun.vercel.app", 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
};

app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

const io = new Server(server, {
    cors: corsOptions
});

const activeConnections = new Map();

io.on('connection', (socket) => {
    console.log("Socket connected: ", socket.id);

    socket.on("user_login", (userId) => {
        console.log("Socket turned on for user:", userId);
        socket.join(userId);
        activeConnections.set(userId, socket);
    });

    socket.on('disconnect', () => {
        console.log("Socket disconnected: ", socket.id);

        for (let [userId, activeSocket] of activeConnections.entries()) {
            if (activeSocket.id === socket.id) {
                activeConnections.delete(userId);
                break;
            }
        }
    });
});

app.use((req, res, next) => {
    req.io = io;
    req.activeConnections = activeConnections;
    next();
});

app.use(router);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { io, app };