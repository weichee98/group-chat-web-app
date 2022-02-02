const webSocketServerPort = 8000;
const chatRoomTimout = 900000;
const webSocketServer = require("websocket").server;
const http = require("http");
const ChatRoom = require("./room").ChatRoom;
const utils = require("./utils");
const logger = require("./logger").logger;

class Server {
  constructor(serverPort) {
    this.requestWebSocketServer = this.requestWebSocketServer.bind(this);
    this.deleteChatRoomOnTimeout = this.deleteChatRoomOnTimeout.bind(this);

    this.chatRooms = {};
    this.serverPort = serverPort;
    this.httpServer = http.createServer();
    this.bindServerPort();
    this.initWebSocketServer();
  }

  deleteChatRoomOnTimeout(chatRoomObj) {
    delete this.chatRooms[chatRoomObj.roomID];
    logger.info("deleted room " + chatRoomObj.roomID);
  }

  bindServerPort() {
    this.httpServer.listen(this.serverPort);
    const message = "listening on port " + this.serverPort;
    logger.info(message);
    logger.info("=".repeat(message.length));
  }

  checkRoomIDValidity(roomID, request) {
    if (!roomID) {
      utils.replyErrorMessage(
        request,
        "Invalid Room ID is given, Room ID cannot be empty."
      );
      logger.error("rejected incoming request as invalid room ID is given");
      return false;
    }
    return true;
  }

  createNewRoom(roomID, roomPassword, request) {
    if (!this.checkRoomIDValidity(roomID, request)) {
      return false;
    }

    if (this.hasRoom(roomID)) {
      utils.replyErrorMessage(
        request,
        "Room ID " + roomID + " already exists."
      );
      logger.error("failed to create room " + roomID + " as it already exist");
      return false;
    }

    const newRoom = new ChatRoom(
      roomID,
      roomPassword,
      chatRoomTimout,
      this.deleteChatRoomOnTimeout
    );
    this.chatRooms[roomID] = newRoom;
    utils.replySuccessMessage(
      request,
      "Room ID " + roomID + " successfully created"
    );
    logger.info("created new room " + roomID);
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
      utils.replyErrorMessage(
        request,
        "Invalid Room ID, Room ID does not exist."
      );
      logger.error(
        "failed to add user " +
          userID +
          " to room " +
          roomID +
          " that does not exist"
      );
      return;
    }

    const chatRoomObj = this.chatRooms[roomID];
    if (!chatRoomObj.authenticate(roomID, roomPassword)) {
      utils.replyErrorMessage(
        request,
        "Room authentication failed due to incorrect Room ID or Room Password."
      );
      logger.error(
        "authentication failed for access to room " +
          roomID +
          " by user " +
          userID
      );
      return;
    }

    chatRoomObj.userEntered(userID, userPassword, request);
  }

  requestWebSocketServer(request) {
    const pathname = request.resourceURL.pathname;
    const query = request.resourceURL.query;

    const roomID = query.roomID;
    const roomPassword = query.roomPassword ? query.roomPassword : "";
    const userID = query.userID;
    const userPassword = query.userPassword ? query.userPassword : "";

    switch (pathname) {
      case "/createRoom":
        this.createNewRoom(roomID, roomPassword, request);
        break;
      case "/chatRoom":
        this.addUserToRoom(roomID, roomPassword, userID, userPassword, request);
        break;
      default:
        request.reject("Invalid URL given");
        logger.error(
          "rejected incoming request due to invalid url " + request.resource
        );
        break;
    }
  }

  initWebSocketServer() {
    this.webSocketServer = new webSocketServer({ httpServer: this.httpServer });
    this.webSocketServer.on("request", this.requestWebSocketServer);
  }
}

new Server(webSocketServerPort);
