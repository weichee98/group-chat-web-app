import { Component } from "react";
import "./Component.css";

class CreateNewRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  static get propTypes() {
    return {
      onSubmit: (createNewRoomObj, roomID, roomPassword) => {},
    };
  }

  onSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(
      this,
      event.target.roomID.value,
      event.target.roomPassword.value
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
              Create New Room
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default CreateNewRoom;
