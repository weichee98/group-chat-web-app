class MESSAGE_TYPE {
  static get CONNECTED() {
    return "connected";
  }
  static get ROOM_CREATED() {
    return "created";
  }
  static get USER_ENTER() {
    return "enter";
  }
  static get USER_LEAVE() {
    return "leave";
  }
  static get MESSAGE() {
    return "message";
  }
  static get ERROR() {
    return "error";
  }
  static get SUCCESS() {
    return "success";
  }
}

export default MESSAGE_TYPE;
