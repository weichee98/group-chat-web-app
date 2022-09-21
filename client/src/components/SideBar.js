import React, { Component } from "react";
import PropTypes from "prop-types";

class UsersSideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: this.props.users,
    };
  }

  setNewUsers(users) {
    this.setState({ users: users });
  }

  static get propTypes() {
    return {
      width: PropTypes.string.isRequired,
      maxWidth: PropTypes.string,
      userID: PropTypes.string.isRequired,
      users: PropTypes.instanceOf(Array).isRequired,
    };
  }

  render() {
    return (
      <div
        className="d-flex flex-column flex-shrink-0 bg-secondary text-white p-3"
        style={{
          width: this.props.width,
          maxWidth: this.props.maxWidth,
          height: "100%",
          opacity: "85%",
        }}
      >
        <div
          className="d-flex align-items-center mb-3 mb-md-0 me-md-auto"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <span className="fs-4">Active User List</span>
        </div>
        <hr></hr>
        <ul className="nav nav-pills flex-column mb-auto">
          {this.state.users.map((userID) => {
            const className =
              userID === this.props.userID
                ? "nav-link active"
                : "nav-link text-white";
            return (
              <li className="nav-item" key={userID}>
                <label className={className}>{userID}</label>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default UsersSideBar;
