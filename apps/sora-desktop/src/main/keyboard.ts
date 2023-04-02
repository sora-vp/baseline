import { SerialPort, ReadlineParser } from "serialport";
import { keyboard, Key } from "@nut-tree/nut-js";
import { BrowserWindow } from "electron";

export async function handleConnect(
  board: Awaited<ReturnType<typeof SerialPort.list>>[number],
  port: SerialPort | undefined,
  window: BrowserWindow
) {
  port = new SerialPort({
    path: board.path,
    baudRate: 9600,
    autoOpen: true,
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

  parser.on("data", async (keybind) => {
    if (window.isFocused()) {
      switch (keybind) {
        case "SORA-KEYBIND-ESC":
          await keyboard.type(Key.Escape);
          break;
        case "SORA-KEYBIND-1":
          await keyboard.type("1");
          break;
        case "SORA-KEYBIND-2":
          await keyboard.type("2");
          break;
        case "SORA-KEYBIND-3":
          await keyboard.type("3");
          break;
        case "SORA-KEYBIND-4":
          await keyboard.type("4");
          break;
        case "SORA-KEYBIND-5":
          await keyboard.type("4");
          break;
        case "SORA-KEYBIND-ENTER":
          await keyboard.type(Key.Enter);
          break;
      }
    }
  });

  port.on("close", () => {
    port = undefined;
  });
}
