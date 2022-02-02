import { Component } from "react";
import PropTypes from "prop-types";
import { RoomTimeoutNotification } from "./Notification";
import "./Component.css";

class EnterRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  static get propTypes() {
    return {
      roomID: PropTypes.string,
      onSubmit: (
        enterRoomObj,
        roomID,
        roomPassword,
        userID,
        userPassword
      ) => {},
    };
  }

  onSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(
      this,
      event.target.roomID.value,
      event.target.roomPassword.value,
      event.target.userID.value,
      event.target.userPassword.value
    );
  }

  render() {
    return (
      <div className="home-component-container">
        <form onSubmit={this.onSubmit}>
          <div className="input-group form-group">
            <label htmlFor="roomID">Room ID</label>
            <input
              type="text"
              className="form-control"
              id="roomID"
              placeholder="Enter Room ID"
              defaultValue={this.props.roomID}
            ></input>
          </div>

          <div className="input-group form-group">
            <label htmlFor="roomPassword">Room Password</label>
            <input
              type="password"
              className="form-control"
              id="roomPassword"
              placeholder="Enter Room Password"
            ></input>
          </div>

          <div className="input-group form-group">
            <label htmlFor="userID">User ID</label>
            <input
              type="text"
              className="form-control"
              id="userID"
              placeholder="Enter User ID"
            ></input>
          </div>

          <div className="input-group form-group">
            <label htmlFor="userPassword">User Password</label>
            <input
              type="password"
              className="form-control"
              id="userPassword"
              placeholder="Enter User Password"
            ></input>
          </div>

          {this.state.error ? (
            <div className="input-group form-group">
              <label></label>
              <div className="alert-danger form-control" role="alert">
                {this.state.error}
              </div>
            </div>
          ) : null}

          <div className="input-group form-group">
            <label></label>
            <button type="submit" className="btn btn-primary">
              Enter Room
            </button>
          </div>
          <RoomTimeoutNotification />
        </form>
      </div>
    );
  }
}

export default EnterRoom;
