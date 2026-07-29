// Game Bootstrap, Interactions, and Developer Console Toggles

document.addEventListener('DOMContentLoaded', () => {
  // Simulate preloader compile
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.style.opacity = '0';
    setTimeout(() => {
      preloader.classList.add('hidden');
      if (window.audio) window.audio.startLobbyMusic();
    }, 500);
  }, 1800); // 1.8 seconds loading screen

  const safeExec = (fn) => {
    return (...args) => {
      try {
        fn(...args);
      } catch (err) {
        console.error(err);
        const panel = document.getElementById('debug-error-console');
        const msg = document.getElementById('debug-error-msg');
        if (panel && msg) {
          panel.style.display = 'block';
          msg.innerHTML = `<strong>Error:</strong> ${err.message}<br><strong>Stack:</strong> <span style="font-size:10px; color:#ff88aa; display:block; margin-top:5px; white-space:pre-wrap; max-height:180px; overflow-y:auto;">${err.stack}</span>`;
        }
      }
    };
  };

  // ---- Boot Sequence: Profile setup check & HUD initialization ----
  const checkProfileAndBoot = () => {
    // Update profile HUD whenever main menu is visible
    if (window.ui && window.ui.updateProfileHUD) {
      window.ui.updateProfileHUD();
    }

    // Load saved profile into Settings editor fields
    const profile = window.storage.state.profile;
    const editNameInput = document.getElementById('edit-player-name');
    if (editNameInput && profile.name) editNameInput.value = profile.name;

    // Sync difficulty select dropdown with saved setting
    const diffDropdown = document.getElementById('select-difficulty');
    if (diffDropdown) diffDropdown.value = window.storage.state.settings.difficulty || 'medium';

    // Sync difficulty card selected state  
    const savedDiff = window.storage.state.settings.difficulty || 'medium';
    document.querySelectorAll('.difficulty-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.difficulty === savedDiff);
    });

    // First-time launch: show profile setup overlay
    if (!profile.setupCompleted) {
      window.ui.switchScreen('profile-setup-overlay');
    } else {
      window.ui.switchScreen('main-menu');
    }
  };

  // Bind Main UI Actions
  document.getElementById('btn-start').addEventListener('click', safeExec(() => {
    // Route through difficulty selection screen instead of directly starting
    window.ui.switchScreen('difficulty-select-menu');
    window.audio.playAchievement();
  }));

  // Pause screen binds
  document.getElementById('hud-pause-btn').addEventListener('click', safeExec(() => {
    window.game.pauseGame();
  }));
  document.getElementById('btn-resume').addEventListener('click', safeExec(() => {
    window.game.resumeGame();
  }));
  document.getElementById('btn-pause-settings').addEventListener('click', safeExec(() => {
    window.ui.switchScreen('settings-menu');
  }));
  document.getElementById('btn-pause-restart').addEventListener('click', safeExec(() => {
    window.game.startNewGame();
  }));
  document.getElementById('btn-pause-main').addEventListener('click', safeExec(() => {
    window.game.state = 'menu';
    window.ui.switchScreen('main-menu');
    window.audio.stopMusic();
  }));

  // Game over binds
  document.getElementById('btn-go-retry').addEventListener('click', safeExec(() => {
    window.game.startNewGame();
  }));
  document.getElementById('btn-go-replay').addEventListener('click', safeExec(() => {
    window.game.startReplay();
  }));
  document.getElementById('btn-go-photo').addEventListener('click', safeExec(() => {
    window.game.startPhotoMode();
  }));
  document.getElementById('btn-go-main').addEventListener('click', safeExec(() => {
    window.game.state = 'menu';
    window.ui.switchScreen('main-menu');
  }));

  // Replay Screen closer
  document.getElementById('btn-replay-close').addEventListener('click', safeExec(() => {
    window.game.exitReplay();
  }));

  // Share Score: Copy decryption key code to clipboard
  document.getElementById('btn-go-share').addEventListener('click', () => {
    const text = `CYBER DASH BREACH REPORT: I penetrated the mainframe track for ${Math.floor(window.game.distance)} meters with a score of ${Math.floor(window.game.score)}! Decode here and hack the grid.`;
    navigator.clipboard.writeText(text).then(() => {
      window.ui.showEventBanner('TRANSMISSION COPIED', 'RUN REPORT COPIED TO TERMINAL CLIPBOARD');
      window.audio.playAchievement();
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  });

  // Bind Photo Mode Sliders and Actions
  const filterSelect = document.getElementById('photo-filter');
  filterSelect.addEventListener('change', (e) => {
    window.game.photoFilter = e.target.value;
  });

  const zoomSlider = document.getElementById('photo-zoom');
  const zoomVal = document.getElementById('val-photo-zoom');
  zoomSlider.addEventListener('input', (e) => {
    const zoomValFloat = parseFloat(e.target.value) / 100;
    window.game.photoZoom = zoomValFloat;
    zoomVal.innerText = `${zoomValFloat.toFixed(1)}x`;
  });

  const panSlider = document.getElementById('photo-pan-y');
  const panVal = document.getElementById('val-photo-pan');
  panSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    window.game.photoPanY = val;
    panVal.innerText = `${val}px`;
  });

  // Capture Photo image download trigger
  document.getElementById('btn-photo-capture').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'cyber_dash_capture.png';
    link.href = window.game.canvas.toDataURL('image/png');
    link.click();
    
    window.ui.showEventBanner('IMAGE CAPTURE SAVED', 'SCREENSHOT DIRECTED TO DOWNLOADS DIRECTORY');
    window.audio.playAchievement();
  });

  // Toggle diagnostics panel (backtick/tilde or F3 key trigger) & global ESC handler
  window.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === 'F3') {
      e.preventDefault(); // Prevent browser search popup on F3
      const devPanel = document.getElementById('dev-panel');
      if (devPanel) {
        devPanel.classList.toggle('hidden');
        window.audio.playCoin();
      }
    } else if (e.key === 'Escape') {
      if (window.game) {
        if (window.game.state === 'playing') {
          window.game.pauseGame();
        } else if (window.game.state === 'paused') {
          window.game.resumeGame();
        } else if (window.ui && window.ui.activeScreen !== 'main-menu') {
          window.ui.switchScreen('main-menu');
        }
      }
    }
  });

  // Add FPS metric tick inside frame updater
  const originalRun = window.game.run;
  window.game.run = function(timestamp) {
    if (window.devmode) {
      window.devmode.updateFPS(timestamp);
      window.devmode.updateDebugPanel(window.game);
    }
    originalRun.call(this, timestamp);
  };

  // Start the Game Loop then boot the profile check
  requestAnimationFrame((timestamp) => {
    window.game.run(timestamp);
  });

  // Run boot sequence after a tiny delay so all managers are ready
  setTimeout(checkProfileAndBoot, 200);
});
