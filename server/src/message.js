const cryptoJS = require("crypto-js");

class MESSAGE_TYPE {
  static get CONNECTED() {
    return "connected";
  }
  static get ROOM_CREATED() {
    return "created";
  }
  static get USER_ENTER() {
    return "enter";
  }
  static get USER_LEAVE() {
    return "leave";
  }
  static get MESSAGE() {
    return "message";
  }
  static get ERROR() {
    return "error";
  }
  static get SUCCESS() {
    return "success";
  }
}

class MessageInterface {
  constructor(type, roomID) {
    this.timestamp = new Date();
    this.type = type;
    this.roomID = roomID;
  }

  get messageID() {
    var hmac = cryptoJS.algo.HMAC.create(
      cryptoJS.algo.MD5,
      this.timestamp.toString()
    );
    hmac.update(this.type.toString());
    hmac.update(this.roomID.toString());
    var hash = hmac.finalize();
    return hash.toString();
  }
}

class RoomCreatedMessage extends MessageInterface {
  constructor(roomID) {
    super(MESSAGE_TYPE.ROOM_CREATED, roomID);
  }
}

class UserEnterMessage extends MessageInterface {
  constructor(roomID, userID) {
    super(MESSAGE_TYPE.USER_ENTER, roomID);
    this.userID = userID;
  }
}

class UserLeaveMessage extends MessageInterface {
  constructor(roomID, userID) {
    super(MESSAGE_TYPE.USER_LEAVE, roomID);
    this.userID = userID;
  }
}

class ConnectedMessage extends MessageInterface {
  constructor(roomID, userID, users, history) {
    super(MESSAGE_TYPE.CONNECTED);
    this.userID = userID;
    this.roomID = roomID;
    this.users = users;
    this.history = history;
  }
}

class NewMessage extends MessageInterface {
  constructor(roomID, userID, messageString) {
    super(MESSAGE_TYPE.MESSAGE, roomID);
    this.userID = userID;
    this.messageString = messageString;
  }
}

class ErrorMessage extends MessageInterface {
  constructor(errorMessage) {
    super(MESSAGE_TYPE.ERROR, null);
    this.errorMessage = errorMessage;
  }
}

class SuccessMessage extends MessageInterface {
  constructor(SuccessMessage = "") {
    super(MESSAGE_TYPE.SUCCESS, null);
    this.SuccessMessage = SuccessMessage;
  }
}

exports.RoomCreatedMessage = RoomCreatedMessage;
exports.UserEnterMessage = UserEnterMessage;
exports.UserLeaveMessage = UserLeaveMessage;
exports.ConnectedMessage = ConnectedMessage;
exports.NewMessage = NewMessage;
exports.ErrorMessage = ErrorMessage;
exports.SuccessMessage = SuccessMessage;
