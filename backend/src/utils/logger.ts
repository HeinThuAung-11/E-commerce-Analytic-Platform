type LogLevel = "info" | "warn" | "error";

type LogPayload = Record<string, unknown> & {
  message: string;
};

function log(level: LogLevel, payload: LogPayload): void {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export function logInfo(payload: LogPayload): void {
  log("info", payload);
}

export function logWarn(payload: LogPayload): void {
  log("warn", payload);
}

export function logError(payload: LogPayload): void {
  log("error", payload);
}
