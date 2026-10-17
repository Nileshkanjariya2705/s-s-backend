import App from '@/app';
export const roomUnreadCounts = {};
export const usersUnreadCount = {};
require('events').EventEmitter.defaultMaxListeners = Infinity;

export const AppSocket = () => {
  const io = App.io;
  io.setMaxListeners(0);
  io.sockets.setMaxListeners(0);
  io.on('connection', (socket) => {
    socket.on('join_room', (roomName) => {
      socket.join(roomName);
      io.sockets.adapter.rooms.get(roomName);
    });

    socket.on('login', (userId) => {
      socket.join(userId);
    });

    socket.on('create-notification', (data) => {});

    socket.on('leave_room', (room) => {
      socket.leave(room);
      io.to(room).emit('user_left', socket.id);
    });

    socket.on('disconnect', () => {
    });
  });
  return io;
};
