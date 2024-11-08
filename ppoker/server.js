import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// const users = {}; // store users with their userId as key
// let votesRevealed = false;

// manaage multiple sessions with Map
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
        session.users.forEach((user) => {
          user.vote = null;
          user.hasVoted = false;
        });
        session.votesRevealed = false;

        io.to(sessionId).emit('sessionUpdate', session);
      }
    });

    // // send current session state to the newly connected user
    // socket.emit('sessionUpdate', {
    //   users: Object.values(users),
    //   votesRevealed,
    // });

    // //   handle vote submission
    // socket.on('vote', (data) => {
    //   const { name, userId, vote } = data;

    //   // update or add the user with their vote
    //   users[userId] = { name, id: userId, vote, hasVoted: true };

    //   // log userId and vote to check correctness
    //   console.log(`Vote received from ${name || userId}: ${vote}`);

    //   // broadcast the updated user list to all connected clients
    //   io.emit('voteUpdate', { users: Object.values(users) });
    // });

    // // handle reveal votes event
    // socket.on('revealVotes', () => {
    //   votesRevealed = true;

    //   // broadcast the updated state to all connected clients
    //   io.emit('sessionUpdate', { users: Object.values(users), votesRevealed });
    // });

    // // handle starting a new session
    // socket.on('newSession', () => {
    //   // reset  votes and "hasVoted" status
    //   Object.keys(users).forEach((userId) => {
    //     users[userId].vote = null;
    //     users[userId].hasVoted = false;
    //   });
    //   votesRevealed = false;

    //   io.emit('sessionUpdate', { users: Object.values(users), votesRevealed });
    // });

    //  handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected');

      // TODO for future, consider removing user from session
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
