import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const CORE_VERSION = "0.12.10";
const MAX_RECORDING_MS = 5000;

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");
const recIndicator = document.getElementById("recIndicator");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumbnail: "thumbnail.jpg",
}

const downloadFile = (fileurl, filename) => {
  const a = document.createElement("a");
  a.href = fileurl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
}

const handleDownload = async () => {
  startBtn.removeEventListener("click", handleDownload);
  startBtn.innerText = "Transcoding...";
  startBtn.disabled = true;

  const ffmpeg = new FFmpeg();
  ffmpeg.on("log", ({ message }) => console.log(message));

  const coreBase = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;
  await ffmpeg.load({
    coreURL: await toBlobURL(`${coreBase}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${coreBase}/ffmpeg-core.wasm`, "application/wasm"),
  });

  await ffmpeg.writeFile(files.input, await fetchFile(videoFile));

  await ffmpeg.exec(["-i", files.input, "-r", "60", "-y", files.output]);
  await ffmpeg.exec(["-i", files.input, "-ss", "00:00:00", "-frames:v", "1", files.thumbnail]);

  const mp4Data = await ffmpeg.readFile(files.output);
  const thumbnailData = await ffmpeg.readFile(files.thumbnail);
  const mp4Blob = new Blob([mp4Data], { type: "video/mp4" });
  const thumbnailBlob = new Blob([thumbnailData], { type: "image/jpg" });
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbnailUrl, "MyThumbnail.jpg");

  await ffmpeg.deleteFile(files.input);
  await ffmpeg.deleteFile(files.output);
  await ffmpeg.deleteFile(files.thumbnail);

  startBtn.disabled = false;
  startBtn.innerText = "Record Again";
  startBtn.addEventListener("click", handleStart);
};

const handleStart = () => {
  startBtn.removeEventListener("click", handleStart);
  startBtn.disabled = true;

  let remaining = MAX_RECORDING_MS / 1000;
  startBtn.innerText = `Recording… ${remaining}s`;
  const countdown = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) {
      startBtn.innerText = `Recording… ${remaining}s`;
    }
  }, 1000);

  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();

    clearInterval(countdown);
    recIndicator.classList.remove("is-recording");
    startBtn.disabled = false;
    startBtn.innerText = "Download Recording";
    startBtn.addEventListener("click", handleDownload);
  };
  recorder.start();
  recIndicator.classList.add("is-recording");

  setTimeout(() => {
    if (recorder.state === "recording") recorder.stop();
  }, MAX_RECORDING_MS);
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 1280, height: 720 },
  });
  video.srcObject = stream;
  video.play();
};

init();
startBtn.addEventListener("click", handleStart);
