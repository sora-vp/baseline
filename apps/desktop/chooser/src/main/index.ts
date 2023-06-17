import { join } from "path";
import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import {
  BrowserWindow,
  Menu,
  app,
  ipcMain,
  shell,
  type MenuItemConstructorOptions,
} from "electron";
import Store from "electron-store";
import { SerialPort } from "serialport";
import { usb } from "usb";

import icon from "../../resources/icon.png?asset";
import { handleConnect } from "./keyboard";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let port: SerialPort | undefined;

const store = new Store<{
  serverURL?: string;
}>();

const arduinoConnectionHandler = (
  boards: Awaited<ReturnType<typeof SerialPort.list>>,
  mainWindow: BrowserWindow,
) => {
  const filteredBoards = boards.filter(
    (board) =>
      board.pnpId || board.manufacturer || board.vendorId || board.productId,
  );

  if (filteredBoards.length > 0 && filteredBoards[0])
    handleConnect(filteredBoards[0], port, mainWindow);
};

function createWindow(): void {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();

    return;
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  const template: MenuItemConstructorOptions[] = [
    {
      label: "View",
      submenu: [
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "App",
      submenu: [
        {
          label: "Settings",
          click: () => mainWindow.webContents.send("open-setting"),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  // Intial connection to arduino
  SerialPort.list().then((boards) =>
    arduinoConnectionHandler(boards, mainWindow),
  );

  // Button module reconnect mechanism
  usb.on("attach", () => {
    if (!port) {
      SerialPort.list().then((boards) =>
        arduinoConnectionHandler(boards, mainWindow),
      );
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("get-server-url", () => store.get("serverURL"));
ipcMain.handle("set-server-url", (_, url) => store.set("serverURL", url));

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
