type LogLevel = "info" | "error" | "debug";

function log(message: string, data: object = {}, level: LogLevel = "info") {
  console[level](
    JSON.stringify(
      {
        message,
        ...data,
      },
      null,
      2
    )
  );
}

export function info(message: string, data: object = {}) {
  log(message, data, "info");
}

export function error(message: string, data: object = {}) {
  log(message, data, "error");
}

export function debug(message: string, data: object = {}) {
  log(message, data, "debug");
}
