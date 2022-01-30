import "./App.css";
import { useState, useEffect, createRef } from "react";
import { Home, ChatRoom } from "./pages";

function App() {
  const [client, setClient] = useState(null);
  const [roomID, setRoomID] = useState(null);
  const [userID, setUserID] = useState(null);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const home = createRef();
  const activeTab = createRef();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const roomID = queryParams.get("roomID");
    if (roomID) {
      if (home.current) {
        home.current.setState({ roomID: roomID });
      }
      if (activeTab.current) {
        activeTab.current.setState({ activeTab: "Enter Room" });
      }
    }
  });

  const onEnterRoom = (client, message) => {
    client.onclose = () => {
      setClient(null);
    };
    setRoomID(message.roomID);
    setUserID(message.userID);
    setUsers(message.users);
    setHistory(message.history);
    setClient(client);
  };

  return (
    <div className="App">
      {!client ? (
        <Home
          ref={home}
          tabsRef={activeTab}
          onEnterRoom={onEnterRoom}
          onCreateRoom={(roomID) => {
            window.location.href = "/?roomID=" + roomID;
          }}
        ></Home>
      ) : (
        <ChatRoom
          client={client}
          roomID={roomID}
          userID={userID}
          users={users}
          history={history}
        ></ChatRoom>
      )}
    </div>
  );
}

export default App;
