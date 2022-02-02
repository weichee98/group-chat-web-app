class Info {
  toString() {
    throw new Error("not implemented");
  }
}

class ListeningToPortInfo extends Info {
  constructor(port) {
    super();
    this.port = port;
  }

  toString() {
    return "listening on port [" + this.port + "]";
  }
}

class DeletedRoomInfo extends Info {
  constructor(roomID) {
    super();
    this.roomID = roomID;
  }

  toString() {
    return "deleted room [" + this.roomID + "]";
  }
}

class CreatedNewRoomInfo extends Info {
  constructor(roomID) {
    super();
    this.roomID = roomID;
  }

  toString() {
    return "created new room [" + this.roomID + "]";
  }
}

class UpdateUserConnectionInfo extends Info {
  constructor(userID, roomID) {
    super();
    this.userID = userID;
    this.roomID = roomID;
  }

  toString() {
    return (
      "updated connection for user [" +
      this.userID +
      "] in room [" +
      this.roomID +
      "]"
    );
  }
}

class AddedNewUserInfo extends Info {
  constructor(userID, roomID) {
    super();
    this.userID = userID;
    this.roomID = roomID;
  }

  toString() {
    return "added new user [" + this.userID + "] to room [" + this.roomID + "]";
  }
}

class RemovedUserFromRoomInfo extends Info {
  constructor(userID, roomID) {
    super();
    this.userID = userID;
    this.roomID = roomID;
  }

  toString() {
    return "removed user [" + this.userID + "] from room [" + this.roomID + "]";
  }
}

class ReceivedNewMessageInfo extends Info {
  constructor(userID, roomID, messageID) {
    super();
    this.userID = userID;
    this.roomID = roomID;
    this.messageID = messageID;
  }

  toString() {
    return (
      "received new message [" +
      this.messageID +
      "] from user [" +
      this.userID +
      "] in room [" +
      this.roomID +
      "]"
    );
  }
}

exports.ListeningToPortInfo = ListeningToPortInfo;
exports.DeletedRoomInfo = DeletedRoomInfo;
exports.CreatedNewRoomInfo = CreatedNewRoomInfo;
exports.UpdateUserConnectionInfo = UpdateUserConnectionInfo;
exports.AddedNewUserInfo = AddedNewUserInfo;
exports.RemovedUserFromRoomInfo = RemovedUserFromRoomInfo;
exports.ReceivedNewMessageInfo = ReceivedNewMessageInfo;
