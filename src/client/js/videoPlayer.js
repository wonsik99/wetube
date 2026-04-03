const video = document.querySelector("video");
const play = document.getElementById("play");
const mute = document.getElementById("mute");
const time = document.getElementById("time");
const volume = document.getElementById("volume");

const handlePlay = () => {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
};

const handleMute = () => {
    if (video.muted) {
        video.muted = false;
    } else {
        video.muted = true;
    }
};

play.addEventListener("click", handlePlay);
mute.addEventListener("click", handleMute);