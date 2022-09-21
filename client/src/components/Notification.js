export function RoomTimeoutNotification() {
  return (
    <div
      className="alert alert-warning"
      role="alert"
      style={{ fontSize: "1rem", marginTop: "0.5rem" }}
    >
      Room will be deleted after 15 minutes of inactivity.
      <br></br>
      All chat histories will be deleted and cannot be recovered.
    </div>
  );
}
