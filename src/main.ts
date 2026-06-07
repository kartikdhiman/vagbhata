import './style.css'
import playIcon from './assets/play-button.svg'
import pauseIcon from './assets/pause-button.svg'
import introductionAudio from './assets/introduction.m4a'

// Map the HTML paths to the Vite-bundled asset URLs
const audioAssets: Record<string, string> = {
  '/src/assets/introduction.m4a': introductionAudio
}

const audioPlayer = document.getElementById('mainAudioPlayer') as HTMLAudioElement;
const playerBar = document.getElementById('playerBar');
const titleDisplay = document.getElementById('nowPlayingTitle');

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
      // Compare by matching the ending of the URL pathname to avoid absolute vs relative path mismatches
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
    // Toggle play/pause for the same track
    if (audioPlayer.paused) {
      audioPlayer.play().catch(err => console.error("Playback failed:", err));
    } else {
      audioPlayer.pause();
    }
  } else {
    // Load and play a new track
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

// Bind click event listeners to play buttons
document.querySelectorAll('.play-btn').forEach(button => {
  button.addEventListener('click', () => {
    const audioSrc = button.getAttribute('data-audio-src');
    const trackTitle = button.getAttribute('data-track-title');
    if (audioSrc && trackTitle) {
      toggleAudio(audioSrc, trackTitle);
    }
  });
});

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
