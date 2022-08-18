import React, { FC, useEffect } from "react";
import { createRoot } from "react-dom/client";

const api = window.Main;

const App: FC = () => {
  useEffect(() => {
    api.on("transcodeDone", (res: { name: string; data: Uint8Array }) => {
      const a = document.createElement("a");
      a.download = res.name;
      a.href = URL.createObjectURL(new Blob([res.data], { type: "video/mp4" }));
      a.click();
    });
  }, []);

  useEffect(() => {
    api.on("transcodePending", (log) => {
      console.log(log);
    });
  }, []);

  return (
    <div>
      <h1>Hello, World!</h1>
      <button onClick={() => api.openFileDialog()}>open file</button>
    </div>
  );
};

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root")!;
  const root = createRoot(container);
  root.render(<App />);
});
