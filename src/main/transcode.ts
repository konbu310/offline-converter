import {
  createFFmpeg,
  fetchFile,
  FFmpeg,
  ProgressCallback,
} from "@ffmpeg/ffmpeg";
import path from "path";

export class Transcoder {
  private ffmpeg: FFmpeg;

  public static async init(): Promise<Transcoder> {
    const transcoder = new Transcoder();
    await transcoder.ffmpeg.load();
    return transcoder;
  }

  constructor() {
    this.ffmpeg = createFFmpeg({ log: false });
  }

  public async run(fileName: string, data: Buffer): Promise<Uint8Array> {
    const originalName = path.parse(fileName).name;
    const outFile = originalName + ".mp4";
    this.ffmpeg.FS("writeFile", fileName, await fetchFile(data));
    await this.ffmpeg.run("-i", fileName, outFile);
    const u8 = this.ffmpeg.FS("readFile", outFile);
    return u8;
  }

  public setProgress(cb: ProgressCallback) {
    this.ffmpeg.setProgress(cb);
  }
}
