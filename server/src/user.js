const cryptoJS = require("crypto-js");
const logger = require("./logger").logger;
const message = require("./message");

class User {
  constructor(userID, userPassword, roomID) {
    this.userID = userID;
    this.authHash = cryptoJS.HmacMD5(userID, userPassword).toString();
    this.roomID = roomID;
    this.connection = null;
  }

  static fromJSON(jsonString) {
    try {
      const jsonObj = JSON.parse(jsonString);
      const user = new User(jsonObj.userID, "", jsonObj.roomID);
      user.authHash = jsonObj.authHash;
      return user;
    } catch (error) {
      logger.error("user from JSON: " + error.toString());
      return null;
    }
  }

  toJSON() {
    return JSON.stringify({
      userID: this.userID,
      authHash: this.authHash,
      roomID: this.roomID,
    });
  }

  get isConnected() {
    return this.connection !== null;
  }

  authenticate(userID, userPassword) {
    const givenHash = cryptoJS.HmacMD5(userID, userPassword).toString();
    return givenHash === this.authHash;
  }

  connect(
    request,
    chatRoomObj,
    onMessage = (request, userObj, message) => {},
    onDisconnect = (userObj) => {}
  ) {
    const connection = request.accept(null, request.origin);
    connection.on("message", (message) => {
      try {
        onMessage(request, this, JSON.parse(message.utf8Data));
      } catch (error) {
        logger.error("user connection on message: " + error.toString());
      }
    });
    connection.on("close", () => {
      try {
        this.connection = null;
        onDisconnect(this);
      } catch (error) {
        logger.error("user connection on close: " + error.toString());
      }
    });
    this.connection = connection;
    const newUserMessage = new message.ConnectedMessage(
      this.roomID,
      this.userID,
      chatRoomObj.getUsers(),
      chatRoomObj.history
    );
    this.sendMessage(newUserMessage);
  }

  disconnect() {
    if (this.connection !== null) this.connection.close();
  }

  sendMessage(message) {
    if (this.connection === null) {
      return false;
    }
    if (!this.connection.connected) {
      return false;
    }
    this.connection.send(JSON.stringify(message));
    return true;
  }
}

exports.User = User;
