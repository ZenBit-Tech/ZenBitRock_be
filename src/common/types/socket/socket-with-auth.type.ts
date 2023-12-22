import { Socket } from 'socket.io';

type SocketWithAuth = Socket & { userId: string; userEmail: string };

export { SocketWithAuth };
