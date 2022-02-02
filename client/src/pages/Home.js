import { Component } from "react";
import { Tabs, CreateNewRoom, EnterRoom } from "../components";
import PropTypes from "prop-types";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { MESSAGE_TYPE } from "../utils";
import "./Home.css";

const webSocketPort = 8000;
const webSocketURL = "ws://" + location.hostname + ":" + webSocketPort;

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomID: null,
    };
    this.onCreateRoom = this.onCreateRoom.bind(this);
    this.onEnterRoom = this.onEnterRoom.bind(this);
  }

  static get propTypes() {
    return {
      tabsRef: PropTypes.object.isRequired,
      onCreateRoom: (roomID) => {},
      onEnterRoom: (client, message) => {},
    };
  }

  onCreateRoom(createNewRoomObj, roomID, roomPassword) {
    const url = webSocketURL + "/createRoom";
    var query = "";
    if (roomID) {
      query = query + (query ? "&" : "?") + "roomID=" + roomID;
    }
    if (roomPassword) {
      query = query + (query ? "&" : "?") + "roomPassword=" + roomPassword;
    }

    const createRoomClient = new W3CWebSocket(url + query);

    createRoomClient.onmessage = (messageStream) => {
      const message = JSON.parse(messageStream.data);
      if (message.type == MESSAGE_TYPE.ERROR) {
        createNewRoomObj.setState({ error: message.errorMessage });
      } else {
        this.props.onCreateRoom(roomID);
      }
    };

    createRoomClient.onerror = () => {
      createNewRoomObj.setState({ error: "Failed to connect to server" });
    };
  }

  onEnterRoom(enterRoomObj, roomID, roomPassword, userID, userPassword) {
    const url = webSocketURL + "/chatRoom";
    var query = "";
    if (roomID) {
      query = query + (query ? "&" : "?") + "roomID=" + roomID;
    }
    if (roomPassword) {
      query = query + (query ? "&" : "?") + "roomPassword=" + roomPassword;
    }
    if (userID) {
      query = query + (query ? "&" : "?") + "userID=" + userID;
    }
    if (userPassword) {
      query = query + (query ? "&" : "?") + "userPassword=" + userPassword;
    }

    const client = new W3CWebSocket(url + query);

    client.onmessage = (messageStream) => {
      const message = JSON.parse(messageStream.data);
      if (message.type == MESSAGE_TYPE.ERROR) {
        enterRoomObj.setState({ error: message.errorMessage });
      } else if (message.type == MESSAGE_TYPE.CONNECTED) {
        this.props.onEnterRoom(client, message);
      } else {
        enterRoomObj.setState({ error: "Failed to connect to server" });
      }
    };

    client.onerror = () => {
      enterRoomObj.setState({ error: "Failed to connect to server" });
    };
  }

  get tabStyle() {
    return {
      width: "100%",
      maxWidth: "45rem",
      backgroundColor: "rgba(240, 250, 255, 0.8)",
      fontWeight: 600,
      fontSize: "large",
    };
  }

  render() {
    return (
      <div className="home">
        <div className="home-container">
          <h1>Group Chat App</h1>
          <Tabs ref={this.props.tabsRef} style={this.tabStyle}>
            <CreateNewRoom
              label="Create New Room"
              onSubmit={this.onCreateRoom}
            ></CreateNewRoom>
            <EnterRoom
              roomID={this.state.roomID}
              label="Enter Room"
              onSubmit={this.onEnterRoom}
            ></EnterRoom>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default Home;
