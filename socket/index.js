const io = require('socket.io')(8900, {
    cors: {
        // "origin": "http://localhost:3000"
        "origin": "http://192.168.1.84:3000"
    }
});

let users = [];

const addUser = (userId, socketId) => {
    !users.some(user => user.userId === userId) && users.push({ userId, socketId })
};

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
};

const getUser = (userId) => {
    return users.find(user => user.userId === userId);
};

io.on('connection', (socket) => {
    // when connected
    console.log('a user connected.');
    // take userId and socketId from user
    socket.on("addUser", userId => {
        addUser(userId, socket.id);
        console.log(users);
        io.emit('getUsers', users);
    });

    // send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        if (user && user.socketId) {
            io.to(user.socketId).emit("getMessage", {
                senderId,
                text
            });
        } else {
            console.error(`User not found or missing socketId for receiverId: ${receiverId}`);
        }
    });

    // when disconnected 
    socket.on("disconnect", () => {
        console.log("a user disconnected!")
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});
