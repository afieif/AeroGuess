import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';


const socket = io('https://maptitude.onrender.com');

const App = () => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [userId, setUserId] = useState(uuidv4());
  const [users, setUsers] = useState([]);
  const [image, setImage] = useState(null);
  const [answer, setAnswer] = useState('');
  const [messages, setMessages] = useState([]);
  const [score, setScore] = useState(0);
  const [winners, setWinners] = useState([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    socket.on('roomCreated', ({ roomId, users }) => {
      setRoom(roomId);
      setUsers(users);
      setIsHost(true);
    });

    socket.on('userJoined', ({ user, users }) => {
      setUsers(users);
      setMessages(prev => [...prev, `${user.name} joined the room`]);
    });

    socket.on('userReady', ({ user, users }) => {
      setUsers(users);
      setMessages(prev => [...prev, `${user.name} is ready`]);
    })
    

    socket.on('roundStarted', ({ lat, lon, image }) => {
      setImage(image);
      setMessages(prev => [...prev, `New round started at ${lat}, ${lon}`]);
    });

    socket.on('correctAnswer', ({ user, score }) => {
      setMessages(prev => [...prev, `${user.name} answered correctly and has a score of ${score}`]);
    });

    socket.on('updateScores', ({ users }) => {
      setUsers(users);
    });

    socket.on('roundEnded', ({ round, users }) => {
      setUsers(users);
      setMessages(prev => [...prev, `Round ${round} ended`]);
    });

    socket.on('gameEnded', ({ users }) => {
      setUsers(users);
      setMessages(prev => [...prev, `Game ended`]);
    });

    socket.on('announceWinners', ({ winners }) => {
      setWinners(winners);
      setMessages(prev => [...prev, `Winners: ${winners.map(w => w.name).join(', ')}`]);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('userJoined');
      socket.off('userReady');
      socket.off('roundStarted');
      socket.off('correctAnswer');
      socket.off('updateScores');
      socket.off('roundEnded');
      socket.off('gameEnded');
      socket.off('announceWinners');
    };
  }, []);

  const createRoom = () => {
    socket.emit('createRoom', { name, id: userId });
  };

  const joinRoom = () => {
    socket.emit('joinRoom', { user: { name, id: userId }, room });
  };

  const setReady = () => {
    socket.emit('setReady', { user: { name, id: userId }, room });
  };

  const startRound = () => {
    if (isHost) {
      socket.emit('startRound', room);
    }
  };

  const submitAnswer = () => {
    socket.emit('checkAnswer', { user: { name, id: userId }, room, answer });
    setAnswer('');
  };

  return (
    <div>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room ID" />
      <button onClick={createRoom}>Create Room</button>
      <button onClick={joinRoom}>Join Room</button>
      <button onClick={setReady}>Ready</button>
      {isHost && <button onClick={startRound}>Start Round</button>}
      <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer" />
      <button onClick={submitAnswer}>Submit Answer</button>
      <div>
        <h3>Users</h3>
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name} - Score: {user.score} - {user.ready ? 'Ready' : 'Not Ready'}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Messages</h3>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
      {winners.length > 0 && (
        <div>
          <h3>Winners</h3>
          <ul>
            {winners.map((winner, index) => (
              <li key={index}>{winner.name} - Score: {winner.score}</li>
            ))}
          </ul>
        </div>
      )}
      {image && <img height={"500px"} width={"500px"} src={`data:image/jpeg;base64,${image}`} alt="Map" />}
    </div>
  );
};

export default App;
