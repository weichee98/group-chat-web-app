const webSocketServerPort = 8000;
const chatRoomTimout = 900000;
const baseFolder = ".cache";
const webSocketServer = require("websocket").server;
const http = require("http");
const ChatRoom = require("./room").ChatRoom;
const utils = require("./utils");
const logger = require("./logger").logger;
const error = require("./error");
const info = require("./info");
const fs = require("fs");
const path = require("path");

class Server {
  constructor(serverPort) {
    this.requestWebSocketServer = this.requestWebSocketServer.bind(this);
    this.deleteChatRoomOnTimeout = this.deleteChatRoomOnTimeout.bind(this);

    this.chatRooms = {};
    this.serverPort = serverPort;
    this.httpServer = http.createServer();
    this.bindServerPort();
    this.initWebSocketServer();
    this.loadFromFolder(baseFolder);
  }

  deleteChatRoomOnTimeout(chatRoomObj) {
    chatRoomObj.delete();
    delete this.chatRooms[chatRoomObj.roomID];
    const infoObj = new info.DeletedRoomInfo(chatRoomObj.roomID);
    logger.info(infoObj.toString());
  }

  bindServerPort() {
    this.httpServer.listen(this.serverPort);
    const infoObj = new info.ListeningToPortInfo(this.serverPort);
    logger.info(infoObj.toString());
  }

  checkRoomIDValidity(roomID, request) {
    if (!roomID) {
      const errorObj = new error.RejectedIncomingRequestError(
        new error.RejectedIncomingRequestError.InvalidRoomID(roomID)
      );
      utils.replyErrorMessage(request, errorObj.toString());
      logger.error(errorObj.toString());
      return false;
    }
    return true;
  }

  createNewRoom(roomID, roomPassword, request) {
    if (!this.checkRoomIDValidity(roomID, request)) {
      return false;
    }

    if (this.hasRoom(roomID)) {
      const errorObj = new error.FailedToCreateRoomError(
        new error.FailedToCreateRoomError.RoomAlreadyExist(roomID)
      );
      utils.replyErrorMessage(request, errorObj.toString());
      logger.error(errorObj.toString());
      return false;
    }

    const newRoom = new ChatRoom(
      roomID,
      roomPassword,
      chatRoomTimout,
      this.deleteChatRoomOnTimeout
    );
    this.chatRooms[roomID] = newRoom;
    newRoom.initFolder(baseFolder);
    const infoObj = new info.CreatedNewRoomInfo(roomID);
    utils.replySuccessMessage(request, infoObj.toString());
    logger.info(infoObj.toString());
    return true;
  }

  hasRoom(roomID) {
    return roomID in this.chatRooms;
  }

  addUserToRoom(roomID, roomPassword, userID, userPassword, request) {
    if (!this.checkRoomIDValidity(roomID, request)) {
      return false;
    }

    if (!this.hasRoom(roomID)) {
      const errorObj = new error.RejectedIncomingRequestError(
        new error.RejectedIncomingRequestError.RoomDoesNotExist(roomID)
      );
      utils.replyErrorMessage(request, errorObj.toString());
      logger.error(errorObj.toString());
      return;
    }

    const chatRoomObj = this.chatRooms[roomID];
    if (!chatRoomObj.authenticate(roomID, roomPassword)) {
      const errorObj = new error.RoomAuthenticationFailedError(roomID);
      utils.replyErrorMessage(request, errorObj.toString());
      logger.error(errorObj.toString());
      return;
    }

    chatRoomObj.userEntered(userID, userPassword, request);
  }

  requestWebSocketServer(request) {
    try {
      const pathname = request.resourceURL.pathname;
      const query = request.resourceURL.query;

      const roomID = query.roomID;
      const roomPassword = query.roomPassword ? query.roomPassword : "";
      const userID = query.userID;
      const userPassword = query.userPassword ? query.userPassword : "";

      const errorObj = new error.RejectedIncomingRequestError(
        new error.RejectedIncomingRequestError.InvalidURL(request.resource)
      );

      switch (pathname) {
        case "/createRoom":
          this.createNewRoom(roomID, roomPassword, request);
          break;
        case "/chatRoom":
          this.addUserToRoom(
            roomID,
            roomPassword,
            userID,
            userPassword,
            request
          );
          break;
        default:
          request.reject(errorObj.toString());
          logger.error(errorObj.toString());
          break;
      }
    } catch (err) {
      request.reject(err.toString());
      logger.error("web socket server on request: " + err.toString());
    }
  }

  initWebSocketServer() {
    this.webSocketServer = new webSocketServer({ httpServer: this.httpServer });
    this.webSocketServer.on("request", this.requestWebSocketServer);
  }

  loadFromFolder(baseFolder) {
    fs.readdir(baseFolder, null, (error, allSubDir) => {
      if (error) {
        logger.error(error.toString());
        return;
      }
      allSubDir.forEach((subdir) => {
        const roomFolder = path.resolve(baseFolder + "/" + subdir);
        const room = ChatRoom.loadFromFolder(
          roomFolder,
          chatRoomTimout,
          this.deleteChatRoomOnTimeout
        );
        if (room) this.chatRooms[room.roomID] = room;
      });
    });
  }
}

new Server(webSocketServerPort);
