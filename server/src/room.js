const cryptoJS = require("crypto-js");
const message = require("./message");
const User = require("./user").User;
const utils = require("./utils");
const logger = require("./logger").logger;
const error = require("./error");
const info = require("./info");
const fs = require("fs");
const path = require("path");

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

  get roomFolder() {
    if (!this.baseFolder) return null;
    return this.baseFolder + "/" + this.roomID;
  }

  get roomPropertyPath() {
    if (!this.baseFolder) return null;
    return this.roomFolder + "/.property";
  }

  get usersFilePath() {
    if (!this.baseFolder) return null;
    return this.roomFolder + "/.users";
  }

  get historyFilePath() {
    if (!this.baseFolder) return null;
    return this.roomFolder + "/.history";
  }

  checkDirectory(filePath) {
    filePath = path.resolve(filePath);
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
  }

  delete() {
    if (!this.baseFolder) return;
    try {
      fs.rmSync(this.roomFolder, { recursive: true, force: true });
    } catch (error) {
      logger.error("delete room [" + this.roomID + "]: " + error.toString());
    }
  }

  savePropertyToFolder() {
    if (!this.baseFolder) return;
    this.checkDirectory(this.roomPropertyPath);
    fs.writeFile(
      this.roomPropertyPath,
      JSON.stringify({
        roomID: this.roomID,
        authHash: this.authHash,
        lastActionTime: this.lastActionTime,
      }),
      (error) => {
        if (error)
          logger.error(
            "room [" +
              this.roomID +
              "] save property to folder: " +
              error.toString()
          );
      }
    );
  }

  saveUserToFolder(user) {
    if (!this.baseFolder) return;
    this.checkDirectory(this.usersFilePath);
    fs.appendFile(this.usersFilePath, user.toJSON() + "\n", (error) => {
      if (error)
        logger.error(
          "room [" + this.roomID + "] save user to folder: " + error.toString()
        );
    });
  }

  saveHistoryToFolder(messageObj) {
    if (!this.baseFolder) return;
    this.checkDirectory(this.historyFilePath);
    fs.appendFile(
      this.historyFilePath,
      message.MessageParser.toJSON(messageObj) + "\n",
      (error) => {
        if (error)
          logger.error(
            "room [" +
              this.roomID +
              "] save history to folder: " +
              error.toString()
          );
      }
    );
  }

  initFolder(baseFolder) {
    this.baseFolder = baseFolder;
    this.savePropertyToFolder();
    for (const userID in this.users) {
      this.saveUserToFolder(this.users[userID]);
    }
    this.history.forEach((messageObj) => {
      this.saveHistoryToFolder(messageObj);
    });
  }

  static loadFromFolder(
    roomFolder,
    timeout = 900000,
    timeoutCallback = (chatRoomObj) => {}
  ) {
    roomFolder = path.resolve(roomFolder);
    const baseFolder = path.dirname(roomFolder);
    const roomID = path.basename(roomFolder);

    try {
      const room = new ChatRoom(roomID, "", timeout, timeoutCallback);
      room.baseFolder = baseFolder;

      const property = JSON.parse(fs.readFileSync(room.roomPropertyPath));
      room.authHash = property.authHash;
      room.lastActionTime = property.lastActionTime;
      room.baseFolder = baseFolder;

      fs.readFile(room.usersFilePath, "utf8", (error, data) => {
        try {
          if (error) {
            logger.error(
              "room [" +
                room.roomID +
                "] load users from folder: " +
                error.toString()
            );
            return;
          }
          utils.parseJSON(data).forEach((line) => {
            const user = User.fromJSON(line);
            room.users[user.userID] = user;
          });
        } catch (newError) {
          logger.error(newError);
        }
      });
      fs.readFile(room.historyFilePath, "utf8", (error, data) => {
        try {
          if (error) {
            logger.error(
              "room [" +
                room.roomID +
                "] load history from folder: " +
                error.toString()
            );
            return;
          }
          room.history = utils
            .parseJSON(data)
            .map((line) => message.MessageParser.fromJSON(line));
        } catch (newError) {
          logger.error(newError);
        }
      });
      return room;
    } catch (error) {
      logger.error(
        "room [" +
          this.roomID +
          "] load property from folder: " +
          error.toString()
      );
      return null;
    }
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
      const errorObj = new error.RejectedIncomingRequestError(
        new error.RejectedIncomingRequestError.InvalidUserID(userID)
      );
      utils.replyErrorMessage(request, errorObj.toString());
      logger.error(errorObj.toString());
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
        const infoObj = new info.UpdateUserConnectionInfo(userID, this.roomID);
        logger.info(infoObj.toString());
      } else {
        const errorObj = new error.UserAuthenticationFailedError(userID);
        utils.replyErrorMessage(request, errorObj.toString());
        logger.error(errorObj.toString());
        return false;
      }
    } else {
      userObj = new User(userID, userPassword, this.roomID);
      this.users[userID] = userObj;
      this.saveUserToFolder(userObj);
      const infoObj = new info.AddedNewUserInfo(userID, this.roomID);
      logger.info(infoObj.toString());
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
    const infoObj = new info.RemovedUserFromRoomInfo(userID, this.roomID);
    logger.info(infoObj.toString());
    this.broadcastMessage(userLeaveMessage);
  }

  addNewMessage(request, userObj, messageObj) {
    const userID = userObj.userID;
    const roomID = userObj.roomID;
    if (roomID !== this.roomID) {
      const errorObj = new error.InvalidMessageError(
        new error.InvalidMessageError.RoomIDDoesNotMatch(roomID, this.roomID)
      );
      utils.replyErrorMessage(request, errorObj.toString());
      logger.error(errorObj.toString());
      return;
    }
    if (!this.hasUser(userID)) {
      const errorObj = new error.InvalidMessageError(
        new error.InvalidMessageError.UnregisteredUserID(userID, roomID)
      );
      utils.replyErrorMessage(request, errorObj.toString());
      logger.error(errorObj.toString());
      return;
    }

    if (!messageObj.messageString) {
      const errorObj = new error.InvalidMessageError(
        new error.InvalidMessageError.InvalidMessageString(
          userID,
          roomID,
          messageObj.messageString
        )
      );
      utils.replyErrorMessage(request, errorObj.toString());
      logger.error(errorObj.toString());
      return;
    }
    const newMessage = new message.NewMessage(
      roomID,
      userID,
      messageObj.messageString
    );
    this.addToHistory(newMessage);
    const infoObj = new info.ReceivedNewMessageInfo(
      userID,
      roomID,
      newMessage.messageID
    );
    logger.info(infoObj.toString());
    this.broadcastMessage(newMessage);
  }

  addToHistory(message) {
    this.history.push(message);
    this.lastActionTime = new Date();
    this.saveHistoryToFolder(message);
    this.savePropertyToFolder();
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
