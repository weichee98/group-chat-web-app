import { Component } from "react";
import PropTypes from "prop-types";
import { MESSAGE_TYPE } from "../utils";
import { UsersSideBar } from "../components";

class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: this.props.users,
      history: this.props.history,
      messageString: "",
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.onButtonClicked = this.onButtonClicked.bind(this);
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
  }

  onInputChange(event) {
    this.setState({ messageString: event.target.value });
  }

  onButtonClicked() {
    this.props.client.send(
      JSON.stringify({
        type: "message",
        roomID: this.props.roomID,
        userID: this.props.userID,
        messageString: this.state.messageString,
      })
    );
  }

  render() {
    return (
      <div style={{ display: "flex", height: "100%" }}>
        <UsersSideBar
          width="30%"
          maxWidth="20rem"
          userID={this.props.userID}
          users={this.props.users}
        ></UsersSideBar>
        <div>
          <h1>ChatRoom</h1>
          <h3>Room: {this.props.roomID}</h3>
          <h3>User: {this.props.userID}</h3>
          <h2>Chat History</h2>
          {this.state.history.map((message, i) => {
            switch (message.type) {
              case MESSAGE_TYPE.ROOM_CREATED:
                return (
                  <p key={i}>
                    <b>Room {message.roomID} created</b>
                  </p>
                );
              case MESSAGE_TYPE.MESSAGE:
                return (
                  <p key={i}>
                    <b>User {message.userID}</b> - {message.messageString}
                  </p>
                );
              case MESSAGE_TYPE.USER_ENTER:
                return (
                  <p key={i}>
                    <b>User {message.userID} entered room</b>
                  </p>
                );
              case MESSAGE_TYPE.USER_LEAVE:
                return (
                  <p key={i}>
                    <b>User {message.userID} leaved room</b>
                  </p>
                );
              default:
                return <p key={i}>Invalid message</p>;
            }
          })}
          <input onChange={this.onInputChange}></input>
          <button onClick={this.onButtonClicked}>send</button>
        </div>
      </div>
    );
  }
}

export default ChatRoom;
