import { ipcRenderer, contextBridge, OpenDialogReturnValue } from "electron";

declare global {
  interface Window {
    Main: typeof api;
  }
}

type Channel = "transcodeDone" | "transcodePending";

const api = {
  openFileDialog() {
    ipcRenderer.send("openFileDialog");
  },
  on(channel: Channel, callback: (data: any) => void) {
    ipcRenderer.on(channel, (_, data) => callback(data));
  },
};

contextBridge.exposeInMainWorld("Main", api);
