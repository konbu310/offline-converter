import path from "path";
import fs from "fs/promises";
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { Transcoder } from "./transcode";

const isDev = process.env.NODE_ENV !== "production";

const width = 960;
const height = 800;

let mainWindow: BrowserWindow | null = null;
let transcoder: Transcoder;

function createWindow() {
  mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const port = process.env.PORT || 3000;

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${port}`);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }
}

function initIpc() {
  ipcMain.on("openFileDialog", async (ev) => {
    if (!mainWindow) {
      throw new Error("Main window not found.");
    }

    const res = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      title: "変換するファイルを選択",
    });

    if (!res) return;

    transcoder.setProgress((ratio) => {
      console.log(ratio);
      ev.sender.send("transcodePending", ratio);
    });

    const filePath = res.filePaths[0];
    const file = await fs.readFile(filePath);
    const fileName = path.parse(filePath).name;
    const buf = await transcoder.run(fileName, file);
    ev.sender.send("transcodeDone", {
      name: fileName + ".mp4",
      data: buf,
    });
  });
}

app.whenReady().then(async () => {
  transcoder = await Transcoder.init();
  createWindow();
  initIpc();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
