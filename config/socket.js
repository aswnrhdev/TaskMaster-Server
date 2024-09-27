import { Server } from "socket.io";

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "https://taskmaster-dun.vercel.app",
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log("Socket connected: ", socket.id);

        socket.on("user_login", (userId) => {
            console.log("Socket turned on for user:", userId);
            socket.join(userId);
        });

        socket.on('disconnect', () => {
            console.log("Socket disconnected: ", socket.id);
        });
    });

    return io;
};
