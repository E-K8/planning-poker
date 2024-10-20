import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const useSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    const socketIo = io(); // Initialize socket.io connection

    setSocket(socketIo);

    // Cleanup the connection when the component is unmounted
    return () => {
      socketIo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socket;
};

export default useSocket;
