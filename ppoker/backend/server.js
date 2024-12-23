import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';

// create an express app
const app = express();

const allowedOrigins = [
  'http://localhost:3001',
  'https://ek8-planning-poker.vercel.app',
];

app.get('/', (req, res) => {
  res.send(`
    <h1>Planning Poker Backend is running! 🎉</h1>
    <a href="/status">VIEW STATUS</a>
    `);
});

app.get('/status', (req, res) => {
  res.json({
    status: 'Backend is running',
    timestamp: new Date(),
  });
});

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

// manage multiple sessions with Map
const sessions = new Map();

// create an HTTP server and attach Socket.io
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // handle joining or creating a session
  socket.on('createSession', ({ sessionId, userName, role }, callback) => {
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        sessionId,
        users: [],
        votesRevealed: false,
      });
    }

    const session = sessions.get(sessionId);
    const userId = socket.id; // use socket.id as the unique user idenfifier

    // add the user to the session with their role
    const newUser = {
      id: userId,
      name: userName,
      vote: null,
      hasVoted: false,
      role,
    };

    console.log('Adding user to session:', newUser);

    session.users.push(newUser);

    console.log(`User joined session: ${userName}, Role: ${role}`);

    // join the user to the session room
    socket.join(sessionId);

    console.log('Session created or joined:', session);
    console.log('Session after adding user:', session);

    // send the session state back to the client
    callback({ userId, session });

    // broadcast the updated session to all users in the room
    io.to(sessionId).emit('sessionUpdate', session);
  });

  // handle vote submission
  socket.on('vote', ({ sessionId, userId, vote }) => {
    const session = sessions.get(sessionId);
    if (session) {
      const user = session.users.find((user) => user.id === userId);
      if (user) {
        user.vote = vote;
        user.hasVoted = true;
        console.log(`User ${userId.name} voted: ${user.vote}`);
      }

      // broadcast the updated user list to all users in the room
      io.to(sessionId).emit('voteUpdate', { users: session.users });
    }
  });

  // handle reveal votes event
  socket.on('revealVotes', (sessionId) => {
    const session = sessions.get(sessionId);
    if (session) {
      session.votesRevealed = true;
      io.to(sessionId).emit('sessionUpdate', session);
      io.to(sessionId).emit('clearRevealError');
    }
  });

  socket.on('resetVotes', (sessionId) => {
    const session = sessions.get(sessionId);

    if (session) {
      // reset each user's vote and voting status
      session.users.forEach((user) => {
        user.vote = null;
        user.hasVoted = false;
      });
      session.votesRevealed = false;

      // broadcast the updated session to all clients in the session
      io.to(sessionId).emit('sessionUpdate', session);
    }
  });

  // handle ending the session
  socket.on('endSession', (sessionId) => {
    const session = sessions.get(sessionId);

    if (session) {
      // remove the session data from the server
      sessions.delete(sessionId);

      // notify all users in the session to reset their state
      io.to(sessionId).emit('sessionEnded');

      // disconnect users from the session room to stop further updates
      io.in(sessionId).socketsLeave(sessionId);
    }
  });

  //  handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, (err) => {
  if (err) throw err;
  // console.log(`> Ready on http://localhost:${PORT}`);
  console.log(`> Backend server running on port ${PORT}`);
});
