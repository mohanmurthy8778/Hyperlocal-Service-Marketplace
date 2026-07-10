import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useApp } from '../context/AppContext';

let globalSocket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { currentUser } = useApp();
  const [socket, setSocket] = useState<Socket | null>(globalSocket);

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(window.location.origin);
      setSocket(globalSocket);
    }

    const onConnect = () => {
      setIsConnected(true);
      if (currentUser) {
        globalSocket?.emit('register', {
          userId: currentUser.id,
          role: currentUser.role,
          userData: currentUser
        });
      }
    };

    const onDisconnect = () => setIsConnected(false);

    if (globalSocket.connected) {
      onConnect();
    }

    globalSocket.on('connect', onConnect);
    globalSocket.on('disconnect', onDisconnect);

    return () => {
      globalSocket?.off('connect', onConnect);
      globalSocket?.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (globalSocket && isConnected && currentUser) {
      globalSocket.emit('register', {
        userId: currentUser.id,
        role: currentUser.role,
        userData: currentUser
      });
    }
  }, [currentUser, isConnected]);

  return { socket: globalSocket, isConnected };
};
