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

function parseJSON(data) {
  const lines = [];
  var open = 0;
  var start = -1;
  for (var i = 0; i < data.length; i++) {
    const c = data[i];
    if (c === "{") {
      start = open === 0 ? i : start;
      open += 1;
      continue;
    }
    if (c === "}") {
      open -= 1;
      if (open === 0) {
        lines.push(data.substring(start, i + 1));
      }
    }
  }
  return lines;
}

exports.replyErrorMessage = replyErrorMessage;
exports.replySuccessMessage = replySuccessMessage;
exports.parseJSON = parseJSON;
