import './style.css'
import playIcon from './assets/play-button.svg'
import pauseIcon from './assets/pause-button.svg'
import clockIcon from './assets/clock.svg'
import chapters from './data/chapters.json'

// Dynamically import all audio files in the assets directory to support hashing in production
const audioGlob = import.meta.glob('./assets/*.m4a', { eager: true, import: 'default' }) as Record<string, string>;

// Map the generated HTML paths to the dynamic Vite-bundled URLs
const audioAssets: Record<string, string> = {};
for (const [key, value] of Object.entries(audioGlob)) {
  const normalizedKey = key.replace('./assets/', '/src/assets/');
  audioAssets[normalizedKey] = value;
}

const audioPlayer = document.getElementById('mainAudioPlayer') as HTMLAudioElement;
const playerBar = document.getElementById('playerBar');
const titleDisplay = document.getElementById('nowPlayingTitle');

// Render chapter sections dynamically
const container = document.getElementById('chaptersContainer');
if (container) {
  container.innerHTML = chapters.map(ch => `
    <section>
      <hgroup>
        <h2 class="title">${ch.title}</h2>
        <p class="description">${ch.description}</p>
        <span class="duration">
          <img class="clock-icon" src="${clockIcon}" alt="" />
          ${ch.duration}
        </span>
      </hgroup>
      <button class="play-btn" data-audio-src="${ch.audioSrc}" data-track-title="${ch.title}">
        <img src="${playIcon}" alt="Play" />
      </button>
    </section>
  `).join('');
}

// Function to update the icon of a specific button
function setButtonState(button: HTMLButtonElement, isPlaying: boolean) {
  const img = button.querySelector('img');
  if (img) {
    img.src = isPlaying ? pauseIcon : playIcon;
    img.alt = isPlaying ? "Pause" : "Play";
  }
}

// Reset all buttons to the Play icon
function resetAllButtons() {
  document.querySelectorAll('.play-btn').forEach(btn => {
    setButtonState(btn as HTMLButtonElement, false);
  });
}

// Find the button associated with a given audio source
function findButtonBySrc(src: string): HTMLButtonElement | null {
  const buttons = document.querySelectorAll('.play-btn');
  for (const btn of buttons) {
    const dataSrc = btn.getAttribute('data-audio-src');
    if (dataSrc) {
      const resolved = audioAssets[dataSrc] || dataSrc;
      try {
        const url1 = new URL(resolved, window.location.origin);
        const url2 = new URL(src, window.location.origin);
        if (url1.pathname === url2.pathname) {
          return btn as HTMLButtonElement;
        }
      } catch (e) {
        if (resolved === src) {
          return btn as HTMLButtonElement;
        }
      }
    }
  }
  return null;
}

// Handle playing/pausing a track
function toggleAudio(audioSrc: string, trackTitle: string) {
  if (!audioPlayer) return;

  const resolvedSrc = audioAssets[audioSrc] || audioSrc;
  const currentSrc = audioPlayer.getAttribute('src');

  if (currentSrc === resolvedSrc) {
    if (audioPlayer.paused) {
      audioPlayer.play().catch(err => console.error("Playback failed:", err));
    } else {
      audioPlayer.pause();
    }
  } else {
    resetAllButtons();
    if (titleDisplay) {
      titleDisplay.innerText = "Now Playing: " + trackTitle;
    }
    audioPlayer.src = resolvedSrc;
    if (playerBar) {
      playerBar.style.display = 'flex';
    }
    audioPlayer.play().catch(err => console.error("Playback failed:", err));
  }
}

// Bind click event listeners to play buttons via delegation
if (container) {
  container.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest('.play-btn') as HTMLButtonElement | null;
    if (button) {
      const audioSrc = button.getAttribute('data-audio-src');
      const trackTitle = button.getAttribute('data-track-title');
      if (audioSrc && trackTitle) {
        toggleAudio(audioSrc, trackTitle);
      }
    }
  });
}

// Setup audio element event listeners to keep page UI in sync
if (audioPlayer) {
  audioPlayer.addEventListener('play', () => {
    resetAllButtons();
    const activeBtn = findButtonBySrc(audioPlayer.src);
    if (activeBtn) {
      setButtonState(activeBtn, true);
    }
  });

  audioPlayer.addEventListener('pause', () => {
    const activeBtn = findButtonBySrc(audioPlayer.src);
    if (activeBtn) {
      setButtonState(activeBtn, false);
    }
  });

  audioPlayer.addEventListener('ended', () => resetAllButtons());
}
