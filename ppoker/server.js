import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    //   Handle the vote event
    socket.on('vote', (data) => {
      console.log(`Vote received: ${data}`);

      // Broadcast the vote to all clients
      io.emit('voteUpdate', data);
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
