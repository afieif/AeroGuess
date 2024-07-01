const {
    fetchImage,
    generateLandCoordinate,
    isLand
} = require('../controllers/gameController');

const determineWinners = (users) => {
    const maxScore = Math.max(...users.map(user => user.score));
    return users.filter(user => user.score === maxScore);
};

const resetGame = (gameRooms, roomId) => {
    if (gameRooms[roomId]) {
        gameRooms[roomId].answers = [];
        gameRooms[roomId].round = 0;
        gameRooms[roomId].users.forEach(user => {
            user.score = 0;
        });
    }
};

const cleanRounds = (gameRounds, roomId) => {
    Object.keys(gameRounds).forEach(key => {
        if (key.startsWith(roomId)) {
            delete gameRounds[key];
        }
    });
};

const endGame = (gameRooms, roomId) => {
    delete gameRooms[roomId];
};

const MAX_ROUNDS = 5;
const gameRooms = {};
const gameRounds = {};

module.exports.initSocket = (io) => {
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
            socket.join(id);
            socket.emit('roomCreated', gameRooms[id]);
        });

        // Join Room
        socket.on('joinRoom', (req) => {
            const { user, room } = req;

            if (gameRooms[room]) {
                if (gameRooms[room].users.length >= 2) {
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
                if (roundData.country === answer.toLowerCase()) {
                    const userInRoom = gameRooms[room].users.find(u => u.id === user.id);
                    if (userInRoom) {
                        userInRoom.score += 1;
                        io.to(room).emit('correctAnswer', user);
                        io.to(room).emit('updateScores', { users: gameRooms[room].users });
                    }
                } else {
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
                        resetGame(gameRooms, room);
                        cleanRounds(gameRounds, room);
                    }
                }
            }
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            const room = Object.keys(gameRooms).find(roomId => gameRooms[roomId].host === socket.id);
            if (room) {
                io.to(room).emit('gameEnded', { users: gameRooms[room].users });
                const winners = determineWinners(gameRooms[room].users);
                io.to(room).emit('announceWinners', { winners });
                cleanRounds(gameRounds, room);
                endGame(gameRooms, room);
            }
        });
    });
};
