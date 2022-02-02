const log4js = require("log4js");

log4js.configure({
  appenders: {
    console: { type: "stdout" },
    logfile: { type: "file", filename: "server.log" },
    error: { type: "logLevelFilter", appender: "logfile", level: "error" },
  },
  categories: {
    default: { appenders: ["console", "error"], level: "debug" },
  },
});

const logger = log4js.getLogger("default");
exports.logger = logger;
