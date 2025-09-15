
 function setupSocketIO(io) {
    io.on('connection', (socket) => {
        console.log('A user connected', socket.id);

        socket.on('joinRoom', (userId) => {
            socket.join(userId);
            console.log(`User joined room: ${userId}`);
        });

        socket.on('leaveRoom', (room) => {
            socket.leave(room);
            console.log(`User left room: ${room}`);
        });

        socket.on('message', (message) => {
            io.to(message.room).emit('message', message);
        });


        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
}

module.exports = { setupSocketIO };