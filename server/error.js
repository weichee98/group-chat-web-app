class ActionError extends Error {
  constructor(errorReason) {
    super();
    this.errorReason = errorReason;
  }

  get actionName() {
    throw new Error("not implemented");
  }

  toString() {
    return this.actionName + ": " + this.errorReason.toString();
  }

  static get ErrorReason() {
    return class ErrorReason {
      toString() {
        throw new Error("not implemented");
      }
    };
  }
}

class RoomAuthenticationFailedError extends Error {
  constructor(roomID) {
    super();
    this.roomID = roomID;
  }

  toString() {
    return (
      "room [" +
      this.roomID +
      "] authentication failed due to incorrect room ID or room password."
    );
  }
}

class UserAuthenticationFailedError extends Error {
  constructor(userID) {
    super();
    this.userID = userID;
  }

  toString() {
    return (
      "user [" +
      this.userID +
      "] authentication failed due to incorrect user ID or user password."
    );
  }
}

class RejectedIncomingRequestError extends ActionError {
  get actionName() {
    return "rejected incoming request";
  }

  static get InvalidRoomID() {
    return class InvalidRoomId extends RejectedIncomingRequestError.ErrorReason {
      constructor(roomID) {
        super();
        this.roomID = roomID;
      }

      toString() {
        return "invalid room ID [" + this.roomID + "]";
      }
    };
  }

  static get InvalidUserID() {
    return class InvalidUserId extends RejectedIncomingRequestError.ErrorReason {
      constructor(userID) {
        super();
        this.userID = userID;
      }

      toString() {
        return "invalid user ID [" + this.userID + "]";
      }
    };
  }

  static get InvalidURL() {
    return class InvalidURL extends RejectedIncomingRequestError.ErrorReason {
      constructor(url) {
        super();
        this.url = url;
      }

      toString() {
        return "invalid url [" + this.url + "]";
      }
    };
  }

  static get RoomDoesNotExist() {
    return class RoomDoesNotExist extends RejectedIncomingRequestError.ErrorReason {
      constructor(roomID) {
        super();
        this.roomID = roomID;
      }

      toString() {
        return "room ID [" + this.roomID + "] does not exist";
      }
    };
  }
}

class FailedToCreateRoomError extends ActionError {
  get actionName() {
    return "failed to create room";
  }

  static get RoomAlreadyExist() {
    return class RoomAlreadyExist extends FailedToCreateRoomError.ErrorReason {
      constructor(roomID) {
        super();
        this.roomID = roomID;
      }

      toString() {
        return "room ID [" + this.roomID + "] already exists";
      }
    };
  }
}

class InvalidMessageError extends ActionError {
  get actionName() {
    return "invalid message received";
  }

  static get RoomIDDoesNotMatch() {
    return class RoomIDDoesNotMatch extends InvalidMessageError.ErrorReason {
      constructor(messageRoomID, roomID) {
        super();
        this.messageRoomID = messageRoomID;
        this.roomID = roomID;
      }

      toString() {
        return (
          "incoming message has room ID [" +
          this.messageRoomID +
          "] which does not match connected room ID [" +
          this.roomID +
          "]"
        );
      }
    };
  }

  static get UnregisteredUserID() {
    return class UnregisteredUserID extends InvalidMessageError.ErrorReason {
      constructor(userID, roomID) {
        super();
        this.userID = userID;
        this.roomID = roomID;
      }

      toString() {
        return (
          "incoming message has user ID [" +
          this.userID +
          "] which does not exist in room [" +
          this.roomID +
          "]"
        );
      }
    };
  }

  static get InvalidMessageString() {
    return class InvalidMessageString extends InvalidMessageError.ErrorReason {
      constructor(userID, roomID, messageString) {
        super();
        this.userID = userID;
        this.roomID = roomID;
        this.messageString = messageString;
      }

      toString() {
        return (
          "incoming message received by room [" +
          this.roomID +
          "] from user [" +
          this.userID +
          "] has an invalid message string [" +
          this.messageString +
          "]"
        );
      }
    };
  }
}

exports.RoomAuthenticationFailedError = RoomAuthenticationFailedError;
exports.UserAuthenticationFailedError = UserAuthenticationFailedError;
exports.RejectedIncomingRequestError = RejectedIncomingRequestError;
exports.FailedToCreateRoomError = FailedToCreateRoomError;
exports.InvalidMessageError = InvalidMessageError;
