var video = document.createElement('video');
video.src = "{videoName}";
video.style.width = '100vw';
video.style.height = '100vh';
video.loop = true;
video.autoplay = true;
video.muted = true;
video.style.position = 'absolute';
video.style.top = 0;
video.style.left = 0;
video.style.zIndex = 100;
video.style.opacity = {opacity};
video.style.pointerEvents = 'none';
video.style.objectFit = "fill";
document.body.appendChild(video);