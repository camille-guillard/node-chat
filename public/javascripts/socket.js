let namespaces;
let namespacesSockets = [];
let rooms = [];
let init = false;
let activeNsSocket;
let activeRoom;
let messages = [];

const ioClient = io({
  reconnection: false,
});

ioClient.on("connect", () => {
  console.log("connexion ok !"); 
});

ioClient.on('namespaces', (data) => {
  namespaces = data;
  for(let ns of namespaces) {
    const nsSocket = io(`/${ ns._id }`);
    nsSocket.on('rooms', data => {
      rooms.push(...data);
      if(!init) {
        activateNamespace(nsSocket);
        displayNamespaces(namespaces, nsSocket.nsp);
        init = true;
      }
    })
    nsSocket.on('history', data => {
      messages = data;
      displayMessages(messages);
    });
    nsSocket.on('message', data => {
      messages.push(data)
      displayMessages(messages);
    });
    namespacesSockets.push(nsSocket);
  }
});

