import { Key, keyboard } from "@nut-tree/nut-js";
import { BrowserWindow, Notification } from "electron";
import { ReadlineParser, SerialPort } from "serialport";

export async function handleConnect(
  board: Awaited<ReturnType<typeof SerialPort.list>>[number],
  port: SerialPort | undefined,
  window: BrowserWindow,
) {
  port = new SerialPort({
    path: board.path,
    baudRate: 9600,
    autoOpen: false,
  });

  port.open((error) => {
    if (error) {
      new Notification({
        title: "❌ Gagal Terhubung!",
        body: "Gagal membuka koneksi ke modul tombol pemilihan. Mohon periksa kembali sambungan kabel USB dengan komputer ini!",
      }).show();

      return;
    }

    new Notification({
      title: "✅ Berhasil Terhubung!",
      body: "Berhasil terhubung dengan tombol pemilihan!",
    }).show();
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

  parser.on("data", async (keybind) => {
    if (window.isFocused()) {
      switch (keybind) {
        case "SORA-KEYBIND-RELOAD":
          window.webContents.reload();
          break;
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
          await keyboard.type("5");
          break;
        case "SORA-KEYBIND-ENTER":
          await keyboard.type(Key.Enter);
          break;
      }
    }
  });

  port.on("close", () => {
    new Notification({
      title: "❌ Koneksi Tombol Terputus!",
      body: "Koneksi dengan tombol pemilihan terputus. Mohon periksa kembali sambungan kabel USB dengan komputer ini!",
    }).show();

    port = undefined;
  });
}
