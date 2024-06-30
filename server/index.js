const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*"
    }
});

const cache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const MAX_ROUNDS = 5;

const gameRooms = {};
const gameRounds = {};

const fetchImage = async (lat, lon) => {

    const url = `https://dev.virtualearth.net/REST/v1/Imagery/Map/AerialWithLabels/${lat},${lon}/8?mapSize=2000,1000&pp=${lat},${lon};47&key=${process.env.BING_API_KEY}`;
    console.log(url, process.env.BING_API_KEY)

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        return base64Image;
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
};

async function isLand(lat, lon) {
    const cacheKey = `${lat},${lon}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult !== undefined) {
        return cachedResult;
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    try {
        const response = await axios.get(url);
        const country = response.data.address?.country_code ? response.data.address.country_code : null;
        cache.set(cacheKey, country);
        return country;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function generateLandCoordinate() {
    while (true) {
        const lat = (Math.random() * 180 - 90).toFixed(6);
        const lon = (Math.random() * 360 - 180).toFixed(6);

        const country = await isLand(lat, lon);
        if (country) {
            return { lat, lon, country };
        }
    }
}

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Create Room
    socket.on('createRoom', (user) => {
        const { name, id, gameMode } = user;
        gameRooms[id] = {
            host: id,
            round: 0,
            answers: [],
            users: [{ id, score: 0, name }],
            gameMode
        };
        console.log("room created by", socket.id, user)
        socket.join(id);
        console.log(gameRooms[id])
        socket.emit('roomCreated', gameRooms[id]);
    });

    // Join Room
    socket.on('joinRoom', (req) => {
        const { user, room } = req;

        if (gameRooms[room]) {
            if (gameRooms[room].users.length >= 2) { // Change > 2 to >= 2 to correctly handle the maximum limit
                socket.emit('roomFull');
                return;
            }

            gameRooms[room].users.push({ id: user.id, score: 0, name: user.name });
            socket.join(room);
            io.to(room).emit('userJoined', { users: gameRooms[room].users });
        } else {
            socket.emit('error', 'Room not found');
        }
    });


    // Set Ready
    socket.on('setReady', (data) => {
        const { user, room } = data;
        if (gameRooms[room]) {
            const userInRoom = gameRooms[room].users.find(u => u.id === user.id);
            if (userInRoom) {
                userInRoom.ready = true;
                io.to(room).emit('userReady', { user, users: gameRooms[room].users });
            }
        }
    });

    // Start Round
    async function startRound(roomId) {
        console.log('round starting')
        if (gameRooms[roomId]) {
            const { lat, lon, country } = await generateLandCoordinate();
            const image = await fetchImage(lat, lon);
            gameRounds[`${roomId}-${gameRooms[roomId].round}`] = {
                lat, lon, country
            };
            io.to(roomId).emit('roundStarted', { image, round: gameRooms[roomId].round });
        } else {
            io.to(roomId).emit('error', 'Room not found');
        }
    }

    socket.on('startRound', (roomId) => {
        startRound(roomId);
    });

    // Check Answer
    socket.on('checkAnswer', (data) => {
        const { user, room, answer } = data;

        if (gameRooms[room]) {
            gameRooms[room].answers.push(answer);
            const roundData = gameRounds[`${room}-${gameRooms[room].round}`];
            console.log(roundData.country, answer.toLowerCase())
            if (roundData.country === answer.toLowerCase()) {
                const userInRoom = gameRooms[room].users.find(u => u.id === user.id);
                if (userInRoom) {
                    userInRoom.score += 1;
                    io.to(room).emit('correctAnswer', user);
                    io.to(room).emit('updateScores', { users: gameRooms[room].users });
                }
            }
            else {
                io.to(room).emit('wrongAnswer', { user, answer: roundData.country });
            }
            if (gameRooms[room].answers.length === gameRooms[room].users.length) {
                gameRooms[room].round += 1;
                gameRooms[room].answers = [];
                if (gameRooms[room].round < MAX_ROUNDS) {
                    io.to(room).emit('roundEnded');
                    setTimeout(() => {
                        startRound(room);
                    }, 0);
                } else {
                    io.to(room).emit('gameEnded');
                    resetGame(room);
                    cleanRounds(room);
                }
            }
        }
    });

    // Determine Winners
    function determineWinners(users) {
        const maxScore = Math.max(...users.map(user => user.score));
        return users.filter(user => user.score === maxScore);
    }

    // Function to reset game data
    function resetGame(roomId) {
        if (gameRooms[roomId]) {
            gameRooms[roomId].answers = [];
            gameRooms[roomId].round = 0;
            gameRooms[roomId].users.forEach(user => {
                user.score = 0;
            });
        }
    }

    function cleanRounds(roomId) {
        Object.keys(gameRounds).forEach(key => {
            if (key.startsWith(roomId)) {
                delete gameRounds[key];
            }
        });
    }

    // Function to clean up room and round data
    function endGame(roomId) {
        delete gameRooms[roomId];
    }

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        const room = Object.keys(gameRooms).find(roomId => gameRooms[roomId].host === socket.id);
        if (room) {
            io.to(room).emit('gameEnded', { users: gameRooms[room].users });
            const winners = determineWinners(gameRooms[room].users);
            io.to(room).emit('announceWinners', { winners });
            cleanRounds(room);
            endGame(room);
        }
    });
});

// Dummy HTTP Route for Uptime Monitoring
app.head('/', (req, res) => {
    res.status(200).send();
});

// Start listening on the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});