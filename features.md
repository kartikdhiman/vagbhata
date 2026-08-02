Viewed AGENTS.md:32-50

Here are **four highly practical, low-overhead features** that would significantly improve the user experience for a study/listening application of ancient texts like the *Aṣṭāṅga Saṅgraha*, along with brief notes on how they can be implemented:

---

### 1. Playback Speed Control (0.75x to 2.0x)
* **Why**: Users studying Sanskrit slokas often need to slow down playback (e.g., to `0.75x` or `0.85x`) to hear pronunciation and chanting details clearly, or speed it up (e.g., to `1.25x` or `1.5x`) for quick reviews.
* **Implementation**:
  * Add a dropdown or toggle button in the player footer in [index.html](file:///home/hanuman/Development/vagbhata/index.html).
  * Update `audioPlayer.playbackRate` in [src/main.ts](file:///home/hanuman/Development/vagbhata/src/main.ts) based on user selection.

### 2. Skip Buttons (Back 10s / Forward 15s)
* **Why**: The audio tracks are quite long (often 30+ minutes, as seen by their ~40MB sizes). Dragging the scrubber on mobile to repeat a specific sloka or sentence is clumsy. Dedicated skip buttons make precise navigation much easier.
* **Implementation**:
  * Add "Back 10s" and "Forward 15s" button controls to the `#playerBar` in [index.html](file:///home/hanuman/Development/vagbhata/index.html).
  * Listen for clicks on these buttons in [src/main.ts](file:///home/hanuman/Development/vagbhata/src/main.ts) and modify `audioPlayer.currentTime`.

### 3. Persistent Playback State ("Resume Where You Left Off")
* **Why**: Listeners will rarely complete a long chapter in one sitting. Returning to the page and having to find the exact minute they were on ruins the flow.
* **Implementation**:
  * Add a `timeupdate` listener to the audio player in [src/main.ts](file:///home/hanuman/Development/vagbhata/src/main.ts) to periodically save the active chapter and current `currentTime` to `localStorage`.
  * On page load, retrieve this data and display a small "Resume [Chapter Title] at [MM:SS]" banner, or automatically restore the player state.

### 4. Basic Search / Filter Bar
* **Why**: As more chapters are added to [chapters-config.json](file:///home/hanuman/Development/vagbhata/src/data/chapters-config.json), scrolling to find a specific topic (e.g., searching for "Daily Regimen" or "seasonal") becomes tedious.
* **Implementation**:
  * Add a small, beautifully styled search input below the header in [index.html](file:///home/hanuman/Development/vagbhata/index.html).
  * Filter the rendered cards in `#chaptersContainer` via a keyup/input event in [src/main.ts](file:///home/hanuman/Development/vagbhata/src/main.ts) by checking matching keywords in chapter titles and descriptions.