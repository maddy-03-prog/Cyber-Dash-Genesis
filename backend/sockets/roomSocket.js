// Socket.IO Multiplayer Peer Room Synchronization Module

module.exports = (io) => {
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log(`[SOCKET CONNECTED] Client ID: ${socket.id}`);

    // Create Room
    socket.on('create_room', (data, callback) => {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      rooms.set(roomCode, { host: socket.id, players: [socket.id], p1Ready: false, p2Ready: false });
      socket.join(roomCode);
      if (callback) callback({ success: true, roomCode });
      console.log(`[SOCKET ROOM CREATED] Code: ${roomCode}`);
    });

    // Join Room
    socket.on('join_room', (roomCode, callback) => {
      const room = rooms.get(roomCode);
      if (!room) {
        if (callback) callback({ success: false, message: 'Room code invalid' });
        return;
      }
      if (room.players.length >= 2) {
        if (callback) callback({ success: false, message: 'Room is full' });
        return;
      }

      room.players.push(socket.id);
      socket.join(roomCode);
      io.to(roomCode).emit('player_joined', { playerNum: 2, socketId: socket.id });
      if (callback) callback({ success: true, roomCode });
      console.log(`[SOCKET ROOM JOINED] Code: ${roomCode}`);
    });

    // Player Ready Signal
    socket.on('toggle_ready', ({ roomCode, playerNum, isReady }) => {
      const room = rooms.get(roomCode);
      if (room) {
        if (playerNum === 1) room.p1Ready = isReady;
        if (playerNum === 2) room.p2Ready = isReady;
        io.to(roomCode).emit('ready_status_change', { p1Ready: room.p1Ready, p2Ready: room.p2Ready });

        if (room.p1Ready && room.p2Ready) {
          io.to(roomCode).emit('start_countdown');
        }
      }
    });

    // Sync Player Position / Action State
    socket.on('player_sync_state', ({ roomCode, stateData }) => {
      socket.to(roomCode).emit('opponent_state_update', stateData);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[SOCKET DISCONNECTED] Client ID: ${socket.id}`);
      rooms.forEach((room, code) => {
        if (room.players.includes(socket.id)) {
          io.to(code).emit('player_disconnected', { socketId: socket.id });
          rooms.delete(code);
        }
      });
    });
  });
};
