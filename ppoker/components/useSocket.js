import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const userSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketIo = io();

    setSocket(socketIo);

    //Cleanup the connection when the component is unmounted
    return () => {
      socketIo.disconnect();
    };
  }, []);

  return socket;
};

export default userSocket;
