const cryptoJS = require("crypto-js");
const message = require("./message");
const User = require("./user").User;
const utils = require("./utils");
const logger = require("./logger").logger;

class ChatRoom {
  constructor(
    roomID,
    roomPassword,
    timeout = 900000,
    timeoutCallback = (chatRoomObj) => {}
  ) {
    this.addNewMessage = this.addNewMessage.bind(this);
    this.userLeaved = this.userLeaved.bind(this);
    this.updateTimeout = this.updateTimeout.bind(this);

    this.roomID = roomID;
    this.authHash = cryptoJS.HmacMD5(roomID, roomPassword).toString();
    this.users = {};
    this.history = [new message.RoomCreatedMessage(roomID)];
    this.timeout = timeout;
    this.timeoutCallback = timeoutCallback;
    this.lastActionTime = new Date();
    setTimeout(this.updateTimeout, this.timeout);
  }

  updateTimeout() {
    if (!this.isActive) this.timeoutCallback(this);
    else {
      const newTimeout = this.timeout - (new Date() - this.lastActionTime);
      if (newTimeout < 0) setTimeout(this.updateTimeout, this.timeout);
      else setTimeout(this.updateTimeout, newTimeout);
    }
  }

  get isActive() {
    for (const userID in this.users) {
      const userObj = this.users[userID];
      if (userObj.isConnected) return true;
    }
    return new Date() - this.lastActionTime < this.timeout;
  }

  authenticate(roomID, roomPassword) {
    const givenHash = cryptoJS.HmacMD5(roomID, roomPassword).toString();
    return givenHash === this.authHash;
  }

  checkUserIDValidity(userID, request) {
    if (!userID) {
      utils.replyErrorMessage(
        request,
        "Invalid User ID is given, User ID cannot be empty."
      );
      logger.error("rejected incoming request as invalid user ID is given");
      return false;
    }
    return true;
  }

  userEntered(userID, userPassword, request) {
    if (!this.checkUserIDValidity(userID, request)) {
      return false;
    }

    let userObj = null;
    if (this.hasUser(userID)) {
      userObj = this.users[userID];
      if (userObj.authenticate(userID, userPassword)) {
        userObj.disconnect();
        logger.info(
          "update connection for user " + userID + " in room " + this.roomID
        );
      } else {
        utils.replyErrorMessage(
          request,
          "User authentication failed due to incorrect User ID or User Password."
        );
        logger.error(
          "authentication failed for user " + userID + " in room " + this.roomID
        );
        return false;
      }
    } else {
      userObj = new User(userID, userPassword, this.roomID);
      this.users[userID] = userObj;
      logger.info("added new user " + userID + " to room " + this.roomID);
    }

    const userEnterMessage = new message.UserEnterMessage(this.roomID, userID);
    this.addToHistory(userEnterMessage);
    this.broadcastMessage(userEnterMessage, [userID]);
    userObj.connect(request, this, this.addNewMessage, this.userLeaved);
    return true;
  }

  userLeaved(userObj) {
    const userID = userObj.userID;
    const userLeaveMessage = new message.UserLeaveMessage(this.roomID, userID);
    this.addToHistory(userLeaveMessage);
    logger.info("removed user " + userID + " from chatroom " + this.roomID);
    this.broadcastMessage(userLeaveMessage);
  }

  addNewMessage(userObj, messageObj) {
    const userID = userObj.userID;
    const roomID = userObj.roomID;
    if (roomID !== this.roomID) {
      logger.error(
        "invalid message received by room " + this.roomID + ": " + message
      );
    }
    if (!this.hasUser(userID)) {
      logger.error(
        "message received from unregistered user " +
          userID +
          " by room " +
          this.roomID +
          ": " +
          message
      );
    }

    const newMessage = new message.NewMessage(
      roomID,
      userID,
      messageObj.messageString
    );
    this.addToHistory(newMessage);
    logger.info(
      "new message from user " +
        userID +
        " in room " +
        roomID +
        ": " +
        newMessage.messageID
    );
    this.broadcastMessage(newMessage);
  }

  addToHistory(message) {
    this.history.push(message);
    this.lastActionTime = new Date();
  }

  broadcastMessage(messageObj, exclude = []) {
    for (const userID in this.users) {
      if (exclude.includes(userID)) continue;
      const userObj = this.users[userID];
      userObj.sendMessage(messageObj);
    }
  }

  hasUser(userID) {
    return userID in this.users;
  }

  getUsers() {
    return Object.keys(this.users).filter((key) => this.users[key].isConnected);
  }
}

exports.ChatRoom = ChatRoom;
