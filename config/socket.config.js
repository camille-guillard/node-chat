const socketio = require('socket.io');
const { server } = require('../app');
const { ensureAuthenticatedOnSocketHandshake } = require('./security.config');
const { getNamespaces } = require('../queries/namespace.queries');
const { findRoomByNamespaceId }  = require('../queries/room.queries');

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
