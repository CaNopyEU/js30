const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

// function getVideo() {
// 	navigator.mediaDevices.getUserMedia({ video: true, audio: false })
// 		.then(localMediaStream => {
// 			video.srcObject = localMediaStream
// 			video.play()
// 		})
// 		.catch(err => {
// 			console.error('OH NOOO!!!', err)
// 		})
// }

// function paintToCanvas() {
// 	const width = video.videoWidth
// 	const height = video.videoHeight
// 	canvas.width = width
// 	canvas.height = height

// 	return setInterval(() => {
// 		ctx.drawImage(video, 0, 0, width, height)
// 		let pixels = ctx.getImageData(0, 0, width, height)
// 		pixels = greenScreen(pixels)
// 		ctx.putImageData(pixels, 0, 0)
// 		debugger
// 	}, 16)
// }

// function takePhoto() {
// 	snap.currentTime = 0
// 	snap.play()

// 	const data = canvas.toDataURL('image/jpeg')
// 	const link = document.createElement('a')
// 	link.href = data
// 	link.setAttribute('download', 'handsome')
// 	link.innerHTML = `<img src="${data}" alt="Handsome Man" />`
// 	strip.insertBefore(link, strip.firstChild)
// }

// function redEffect(pixels) {
//   for (let i = 0; i < pixels.data.length; i+=4) {
//     pixels.data[i + 0] = pixels.data[i + 0] + 100; // RED
//     pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
//     pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
//   }
//   return pixels;
// }

// function rgbSplit(pixels) {
//   for (let i = 0; i < pixels.data.length; i+=4) {
//     pixels.data[i - 150] = pixels.data[i + 0]; // RED
//     pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
//     pixels.data[i - 550] = pixels.data[i + 2]; // Blue
//   }
//   return pixels;
// }

// function greenScreen(pixels) {
//   const levels = {};

//   document.querySelectorAll('.rgb input').forEach((input) => {
//     levels[input.name] = input.value;
//   });

//   for (i = 0; i < pixels.data.length; i = i + 4) {
//     red = pixels.data[i + 0];
//     green = pixels.data[i + 1];
//     blue = pixels.data[i + 2];
//     alpha = pixels.data[i + 3];

//     if (red >= levels.rmin
//       && green >= levels.gmin
//       && blue >= levels.bmin
//       && red <= levels.rmax
//       && green <= levels.gmax
//       && blue <= levels.bmax) {
//       // take it out!
//       pixels.data[i + 3] = 0;
//     }
//   }

//   return pixels;
// }

// getVideo()

// video.addEventListener('canplay', paintToCanvas)

//OPTIMIZED!!!!

// cache prahov
const levels = { rmin:0, rmax:255, gmin:0, gmax:255, bmin:0, bmax:255 };
document.querySelectorAll('.rgb input').forEach(input => {
  const apply = () => levels[input.name] = Number(input.value);
  apply();
  input.addEventListener('input', apply, { passive: true });
});

async function getVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
    video.playsInline = true;
    await video.play();
  } catch (err) {
    console.error('camera error', err);
  }
}

function processFrame() {
  const { videoWidth: w, videoHeight: h } = video;
  if (!w || !h) return scheduleNext();

  if (canvas.width !== w) { canvas.width = w; canvas.height = h; }

  ctx.drawImage(video, 0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;

  // green screen
  for (let i = 0, len = data.length; i < len; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    if (
      r >= levels.rmin && r <= levels.rmax &&
      g >= levels.gmin && g <= levels.gmax &&
      b >= levels.bmin && b <= levels.bmax
    ) {
      data[i+3] = 0;
    }
  }

  ctx.putImageData(img, 0, 0);
  scheduleNext();
}

function scheduleNext() {
  if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
    // presne na snímky videa
    video.requestVideoFrameCallback(processFrame);
  } else {
    // fallback na rAF
    requestAnimationFrame(processFrame);
  }
}

function takePhoto() {
  try { snap.currentTime = 0; snap.play(); } catch {}
  const data = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = data;
  link.download = 'snapshot';
  const img = new Image();
  img.src = data;
  img.alt = 'Snapshot';
  link.appendChild(img);
  strip.prepend(link);
}

getVideo().then(() => {
  if (video.readyState >= 2) scheduleNext();
  else video.addEventListener('loadeddata', scheduleNext, { once: true });
});

// voliteľné efekty na neskôr
function redEffect(img) {
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] += 100; d[i+1] -= 50; d[i+2] *= 0.5;
  }
  return img;
}