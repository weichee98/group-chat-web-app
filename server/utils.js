const message = require("./message");

function replyErrorMessage(request, errorMessageString) {
  const connection = request.accept(null, request.origin);
  const errorMessage = new message.ErrorMessage(errorMessageString);
  connection.send(JSON.stringify(errorMessage));
  connection.close();
}

function replySuccessMessage(request, successMessageString) {
  const connection = request.accept(null, request.origin);
  const successMessage = new message.SuccessMessage(successMessageString);
  connection.send(JSON.stringify(successMessage));
  connection.close();
}

exports.replyErrorMessage = replyErrorMessage;
exports.replySuccessMessage = replySuccessMessage;
