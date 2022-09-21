import { Component } from "react";
import PropTypes from "prop-types";
import { MESSAGE_TYPE } from "../utils";
import "./Component.css";

export class MessageFactory {
  static getMessageComponent(key, userID, message) {
    switch (message.type) {
      case MESSAGE_TYPE.ROOM_CREATED:
        return (
          <RoomCreatedMessage
            key={key}
            userID={userID}
            message={message}
          ></RoomCreatedMessage>
        );
      case MESSAGE_TYPE.USER_ENTER:
        return (
          <UserEnteredMessage
            key={key}
            userID={userID}
            message={message}
          ></UserEnteredMessage>
        );
      case MESSAGE_TYPE.USER_LEAVE:
        return (
          <UserLeaveMessage
            key={key}
            userID={userID}
            message={message}
          ></UserLeaveMessage>
        );
      case MESSAGE_TYPE.MESSAGE:
        return <Message key={key} userID={userID} message={message}></Message>;
      default:
        return null;
    }
  }
}

class MessageInterface extends Component {
  constructor(props) {
    super(props);
  }

  static get propTypes() {
    return {
      userID: PropTypes.string.isRequired,
      message: PropTypes.object.isRequired,
    };
  }

  get timestamp() {
    const timestamp = new Date(this.props.message.timestamp);
    return (
      timestamp.toLocaleDateString() + " " + timestamp.toLocaleTimeString()
    );
  }

  get messageBox() {
    throw new Error("Not implemented");
  }

  render() {
    return (
      <div className="d-flex flex-column full-width message">
        {this.messageBox}
        <div className="d-flex justify-content-end full-width">
          <small className="timestamp">{this.timestamp}</small>
        </div>
      </div>
    );
  }
}

export class RoomCreatedMessage extends MessageInterface {
  constructor(props) {
    super(props);
  }

  get messageBox() {
    return (
      <div className="alert alert-success" role="alert">
        <p className="text-center">
          Room <b>{this.props.message.roomID}</b> Created
        </p>
      </div>
    );
  }
}

export class UserEnteredMessage extends MessageInterface {
  constructor(props) {
    super(props);
  }

  get messageBox() {
    return (
      <div className="alert alert-primary" role="alert">
        <p className="text-center">
          User <b>{this.props.message.userID}</b> Entered Room
        </p>
      </div>
    );
  }
}

export class UserLeaveMessage extends MessageInterface {
  constructor(props) {
    super(props);
  }

  get messageBox() {
    return (
      <div className="alert alert-warning" role="alert">
        <p className="text-center">
          User <b>{this.props.message.userID}</b> Leaved Room
        </p>
      </div>
    );
  }
}

export class Message extends MessageInterface {
  constructor(props) {
    super(props);
  }

  get messageBox() {
    const cardClasses =
      "card " +
      (this.props.userID === this.props.message.userID
        ? "bg-success text-white"
        : "bg-light");
    const alignClasses =
      "d-flex full-width " +
      (this.props.userID === this.props.message.userID
        ? "justify-content-start"
        : "justify-content-end");
    return (
      <div className={alignClasses}>
        <div className={cardClasses} style={{ maxWidth: "80%" }}>
          <div className="card-header" style={{ textAlign: "left" }}>
            <b>{this.props.message.userID}</b>
          </div>
          <div className="card-body">
            <p className="card-text" style={{ textAlign: "justify" }}>
              {this.props.message.messageString}
            </p>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const alignTimestamp =
      "d-flex full-width " +
      (this.props.userID === this.props.message.userID
        ? "justify-content-start"
        : "justify-content-end");
    return (
      <div className="d-flex flex-column full-width message">
        {this.messageBox}
        <div className={alignTimestamp}>
          <small className="timestamp">{this.timestamp}</small>
        </div>
      </div>
    );
  }
}
