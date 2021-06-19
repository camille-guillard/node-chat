let namespaces;
let namespacesSockets = [];
let rooms = [];
let init = false;
let activeNsSocket;

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
    namespacesSockets.push(nsSocket);
  }
});

function displayNamespaces(namespaces, activeNsp) {
  const namespacesContainer = document.querySelector('.list-namespaces');
  const items = namespaces.map(namespace => createNamespaceItem(namespace, activeNsp === `/${ namespace._id }`));
  namespacesContainer.innerHTML = '';
  namespacesContainer.prepend(...items);
}

function createNamespaceItem(namespace, isActive) {
  const li = document.createElement('li');
  li.classList.add('item-namespace');
  if(isActive) {
    li.classList.add('active');
  }
  li.innerHTML = `<img src="${ namespace.imgUrl }">`;
  return li;
}

function activateNamespace(nsSocket) {
  activeNsSocket = nsSocket;
  firstRoom = rooms.find(room => `/${ room.namespace }` === activeNsSocket.nsp && room.index === 0);
  displayRooms(rooms.filter(room => `/${ room.namespace }` === activeNsSocket.nsp), firstRoom._id);
}



function createRoomItem(room, isActive) {
  const li = document.createElement('li');
  li.classList.add('item-room');
  if(isActive) {
    li.classList.add('active');
  }
  li.innerHTML = `# ${ room.title }`;
  return li;
}

function displayRooms(rooms, activeRoomId) {
  const roomsContainer = document.querySelector('.list-rooms');
  const items = rooms.map(room => createRoomItem(room, activeRoomId === room._id));
  roomsContainer.innerHTML = '';
  roomsContainer.prepend(...items);
}
