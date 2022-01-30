import { Component, createRef } from "react";
import PropTypes from "prop-types";
import { MESSAGE_TYPE } from "../utils";
import { UsersSideBar, MessageFactory } from "../components";
import "./ChatRoom.css";

class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: this.props.users,
      history: this.props.history,
      messageString: "",
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.onSendMessage = this.onSendMessage.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.messagesEndRef = createRef();
    this.sideBarRef = createRef();
  }

  static get propTypes() {
    return {
      roomID: PropTypes.string.isRequired,
      userID: PropTypes.string.isRequired,
      users: PropTypes.instanceOf(Array).isRequired,
      history: PropTypes.instanceOf(Array).isRequired,
      client: PropTypes.object,
    };
  }

  componentDidMount() {
    this.props.client.onmessage = (messageStream) => {
      const message = JSON.parse(messageStream.data);
      switch (message.type) {
        case MESSAGE_TYPE.MESSAGE:
          this.addMessage(message);
          break;
        case MESSAGE_TYPE.USER_ENTER:
          this.userEnter(message);
          break;
        case MESSAGE_TYPE.USER_LEAVE:
          this.userLeave(message);
          break;
      }
    };
  }

  addMessage(message) {
    const history = [...this.state.history, message];
    this.setState({
      history: history,
    });
  }

  userEnter(message) {
    const history = [...this.state.history, message];
    const users = [...this.state.users, message.userID];
    this.setState({
      users: users,
      history: history,
    });
    this.sideBarRef.current.setNewUsers(users);
  }

  userLeave(message) {
    const history = [...this.state.history, message];
    const users = this.state.users.filter(
      (userID) => userID !== message.userID
    );
    this.setState({
      users: users,
      history: history,
    });
    this.sideBarRef.current.setNewUsers(users);
  }

  onInputChange(event) {
    this.setState({ messageString: event.target.value });
  }

  onSendMessage(event) {
    event.preventDefault();
    if (!this.state.messageString) {
      return;
    }
    this.props.client.send(
      JSON.stringify({
        type: "message",
        roomID: this.props.roomID,
        userID: this.props.userID,
        messageString: this.state.messageString,
      })
    );
    this.setState({ messageString: "" });
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }

  onKeyPress(event) {
    if (event.keyCode == 13) {
      if (!event.shiftKey && this.state.messageString) {
        this.props.client.send(
          JSON.stringify({
            type: "message",
            roomID: this.props.roomID,
            userID: this.props.userID,
            messageString: this.state.messageString,
          })
        );
        this.setState({ messageString: "" });
        event.preventDefault();
      }
    }
  }

  render() {
    return (
      <div className="chatroom">
        <UsersSideBar
          ref={this.sideBarRef}
          width="30%"
          maxWidth="20rem"
          userID={this.props.userID}
          users={this.state.users}
        ></UsersSideBar>
        <div
          className="d-flex full-width full-height flex-column p-3"
          style={{ opacity: "85%" }}
        >
          <div className="d-flex room-header">
            <div className="alert room-header-component">
              Room ID: <b>{this.props.roomID}</b>
            </div>
            <div className="alert room-header-component">
              User ID: <b>{this.props.userID}</b>
            </div>
          </div>

          <div className="d-flex full-width full-height flex-column p-3 card bg-light">
            {this.state.history.map((message, i) =>
              MessageFactory.getMessageComponent(i, this.props.userID, message)
            )}
            <div ref={this.messagesEndRef}></div>
          </div>

          <form
            className="d-flex"
            onSubmit={this.onSendMessage}
            style={{ paddingTop: "1rem" }}
          >
            <textarea
              className="form-control"
              placeholder="Enter message ..."
              value={this.state.messageString}
              onKeyPress={this.onKeyPress}
              onKeyDown={this.onKeyPress}
              onChange={this.onInputChange}
            ></textarea>
            <button type="submit" className="btn btn-secondary">
              Send
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default ChatRoom;
