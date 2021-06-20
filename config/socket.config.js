const socketio = require('socket.io');
const { server } = require('../app');
const { ensureAuthenticatedOnSocketHandshake } = require('./security.config');
const { getNamespaces } = require('../queries/namespace.queries');
const { findRoomByNamespaceId }  = require('../queries/room.queries');
const { findMessagesByRoomId, createMessage }  = require('../queries/message.queries');

let ios;
let namespaces;

const initNamespaces = async () => {
  try {
    namespaces = await getNamespaces();
    for(let namespace of namespaces) {
      const ns = ios.of(`/${ namespace._id }`);
      ns.on('connect', async (nsSocket) => {
        try {
          const rooms = await findRoomByNamespaceId(namespace._id);
          nsSocket.emit('rooms', rooms);
        } catch(e) {
          throw e;
        }

        nsSocket.on('joinRoom', async roomId => {
          try {
            nsSocket.join(`/${ roomId }`);
            const messages = await findMessagesByRoomId(roomId);
            nsSocket.emit('history', messages);
          } catch(e) {
            throw e;
          }
        });

        nsSocket.on('leaveRoom', roomId => {
          nsSocket.leave(`/${ roomId }`);
        });

        nsSocket.on('message', async ({ text, roomId}) => {
          try {
            const { _id, username } = nsSocket.request.user;
            const message = await createMessage({
              data: text,
              room: roomId,
              author: _id,
              authorName: username
            });
            ns.to(`/${ roomId }`).emit('message', message)
          } catch(e) {
            throw e;
          }
        });

      });
    }
  } catch(e) {
     throw e;
  }
}

const initSocketServer = () => {
  ios = socketio(server, {
    allowRequest: ensureAuthenticatedOnSocketHandshake
  });

  ios.on('connect', (socket) => {
    console.log.apply("connexion ios ok!");
    socket.emit('namespaces', namespaces);
  });

  initNamespaces();
}

initSocketServer();
