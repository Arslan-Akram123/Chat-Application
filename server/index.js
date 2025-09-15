require('dotenv').config();

// external imports
const express = require('express');
const cors = require('cors');
const  socketIo = require('socket.io');
const http = require('http');
const cookieParser = require('cookie-parser');

// internal imports
const {setupSocketIO} = require('./utils/socket');
const auth= require('./middlewares/auth');
const connectDB = require('./config/db');
const userRoutes = require('./routes/user');
const chatListRoutes = require('./routes/chatlist');
const groupRoutes = require('./routes/group');
// app initialization
const app = express();
const server = http.createServer(app);

// database connection
connectDB();


// Middlewares
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true
// }));
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: false}));


// Routes
app.use('/auth', userRoutes);
app.get('/',(req, res) => {
    res.send('API is running...');
});
app.use('/chat',auth, chatListRoutes);
app.use('/group',auth, groupRoutes);

// socket setup and configuration

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});
setupSocketIO(io);

// server listening
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
