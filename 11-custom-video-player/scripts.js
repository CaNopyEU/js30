/* Get Our Elements */
const player = document.querySelector('.player');
const fullscreen = document.getElementById('fullscreen')
const video = player.querySelector('.viewer');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress__filled');
const toggle = player.querySelector('.toggle');
const skipButtons = player.querySelectorAll('[data-skip]');
const ranges = player.querySelectorAll('.player__slider');

const togglePlay = () => video[video.paused ? 'play' : 'pause']()

function updateButton() {
	const icon = this.paused ? '►' : '❚ ❚';
	toggle.textContent = icon
}

function skip() {
	video.currentTime += parseFloat(this.dataset.skip)
}

function handleRangeUpdate() {
	video[this.name] = this.value
}

function handleProgress() {
	const percent = (video.currentTime / video.duration) * 100
	progressBar.style.flexBasis = `${percent}%`
}

function scrub(e) {
	const rect = progress.getBoundingClientRect()
	const scrubTime = ((e.clientX - rect.left) / rect.width) * video.duration
	video.currentTime = scrubTime
}

function toggleFullScreen() {
	if (!document.fullscreenElement) {
		player.requestFullscreen();
	} else {
		document.exitFullscreen?.();
	}
}

document.addEventListener('keydown', (e) => {
	if (e.target.tagName === 'INPUT') return; // ignore if user is adjusting sliders
	switch (e.code) {
		case 'Space': togglePlay(); e.preventDefault(); break;
		case 'KeyF': toggleFullScreen(); break;
		case 'ArrowRight': video.currentTime += 5; break;
		case 'ArrowLeft': video.currentTime -= 5; break;
		case 'ArrowUp': video.volume = Math.min(video.volume + 0.05, 1); break;
		case 'ArrowDown': video.volume = Math.max(video.volume - 0.05, 0); break;
	}
})

video.addEventListener('click', togglePlay)
video.addEventListener('play', updateButton)
video.addEventListener('pause', updateButton)
video.addEventListener('timeupdate', handleProgress)

toggle.addEventListener('click', togglePlay)
skipButtons.forEach(button => button.addEventListener('click', skip))
ranges.forEach(range => {
	range.addEventListener('change', handleRangeUpdate)
	range.addEventListener('mousemove', e => mousedown && handleRangeUpdate.call(range, e))
})
fullscreen.addEventListener('click', toggleFullScreen)

let mousedown = false
progress.addEventListener('click', scrub)
progress.addEventListener('mousemove', (e) => mousedown && scrub(e))
progress.addEventListener('mousedown', () => mousedown = true)
progress.addEventListener('mouseup', () => mousedown = false)
progress.addEventListener('touchstart', e => {
	scrub(e.touches[0])
})
progress.addEventListener('touchmove', e => {
	scrub(e.touches[0])
})