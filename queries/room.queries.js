const { Room } = require('../database/models');

exports.findRoomByNamespaceId = (namespaceId) => {
  return Room.find({ namespace: namespaceId }).sort({ index : 1 }).exec();
}
