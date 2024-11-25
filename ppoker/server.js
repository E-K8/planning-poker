import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// manage multiple sessions with Map
const sessions = new Map();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    // handle joining or creating a session
    socket.on('createSession', ({ sessionId, userName }, callback) => {
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
          sessionId,
          users: [],
          votesRevealed: false,
        });
      }

      const session = sessions.get(sessionId);
      const userId = socket.id; // user socket.id as the unique user idenfifier

      // add the user to the session
      session.users.push({
        id: userId,
        name: userName,
        vote: null,
        hasVoted: false,
      });

      // join the user to the session room
      socket.join(sessionId);

      console.log('Session created or joined:', session);

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

        // broadcase the updated session to all clients in the session
        io.to(sessionId).emit('sessionUpdate', session);
      }
    });

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

      // TODO for future, consider removing user from session
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
    // console.log(`> Server running on port ${PORT}`);
  });
});
