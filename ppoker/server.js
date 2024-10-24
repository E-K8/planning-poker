import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const users = {}; // store users with their userId as key
let votesRevealed = false;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    // send current session state to the newly connected user
    socket.emit('sessionUpdate', {
      users: Object.values(users),
      votesRevealed,
    });

    //   handle vote submission
    socket.on('vote', (data) => {
      const { userId, vote } = data;

      // update or add the user with their vote
      users[userId] = { id: userId, vote };

      console.log(`Vote received from user: ${userId}: ${vote}`);

      // broadcast the updated user list to all connected clients
      io.emit('voteUpdate', { users: Object.values(users) });
    });

    // handle reveal votes event
    socket.on('revealVotes', () => {
      votesRevealed = true;
      io.emit('sessionUpdate', { users: Object.values(users), votesRevealed });
    });

    // handle starting a new session
    socket.on('newSession', () => {
      // reset all votes
      Object.keys(users).forEach((userId) => {
        users[userId].vote = null;
      });
      votesRevealed = false;

      io.emit('sessionUpdate', { users: Object.values(users), votesRevealed });
    });

    //  Handle disconnect
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
