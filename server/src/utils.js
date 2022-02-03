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
  var bracketOpen = 0;
  var stringOpen = false;
  var bracketStart = -1;
  for (var i = 0; i < data.length; i++) {
    const c = data[i];
    if (c === '"') {
      stringOpen = i > 0 && data[i - 1] === "\\" ? stringOpen : !stringOpen;
      continue;
    }
    if (stringOpen) continue;
    if (c === "{") {
      bracketStart = i;
      bracketOpen += 1;
      continue;
    }
    if (c === "}") {
      bracketOpen -= 1;
      if (bracketOpen === 0) {
        lines.push(data.substring(bracketStart, i + 1));
      }
    }
  }
  return lines;
}

exports.replyErrorMessage = replyErrorMessage;
exports.replySuccessMessage = replySuccessMessage;
exports.parseJSON = parseJSON;
