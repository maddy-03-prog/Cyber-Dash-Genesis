// Keyboard and Touch Input Manager

class InputManager {
  constructor() {
    this.keys = {};
    this.touchStart = { x: 0, y: 0 };
    this.activeActions = {
      left: false,
      right: false,
      jump: false,
      slide: false,
      dash: false,
      pause: false,
      attack: false,
      grapple: false
    };

    this.activeActionsP2 = {
      left: false,
      right: false,
      jump: false,
      slide: false,
      dash: false,
      attack: false,
      grapple: false
    };

    this.bindKeyboard();
    this.bindMouseControls();
    this.bindTouchControls();
  }

  clearActions() {
    for (let k in this.activeActions) this.activeActions[k] = false;
    for (let k in this.activeActionsP2) this.activeActionsP2[k] = false;
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      
      // Prevent default browser scrolling on arrow keys, space, and shift
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'shift', 'enter'].includes(e.key.toLowerCase()) || e.key === ' ') {
        e.preventDefault();
      }

      this.keys[e.key] = true;
      this.keys[e.code] = true;

      const isMP = (window.game && window.game.isMultiplayer);

      if (isMP) {
        // Player 1 (WASD)
        if (key === 'a') this.activeActions.left = true;
        if (key === 'd') this.activeActions.right = true;
        if (e.key === ' ' || e.code === 'Space') this.activeActions.jump = true;
        if (key === 's') this.activeActions.slide = true;
        if (e.key === 'Shift') this.activeActions.dash = true;
        if (key === 'j' || key === 'f') this.activeActions.attack = true;
        if (key === 'g') this.activeActions.grapple = true;

        // Player 2 (Arrows)
        if (e.key === 'ArrowLeft') this.activeActionsP2.left = true;
        if (e.key === 'ArrowRight') this.activeActionsP2.right = true;
        if (e.key === 'ArrowUp') this.activeActionsP2.jump = true;
        if (e.key === 'ArrowDown') this.activeActionsP2.slide = true;
        if (e.key === 'Enter') this.activeActionsP2.dash = true;
        if (key === 'k') this.activeActionsP2.attack = true;
        if (key === 'l') this.activeActionsP2.grapple = true;
      } else {
        // Single-player (combined WASD + Arrows)
        if (key === 'a' || e.key === 'ArrowLeft') this.activeActions.left = true;
        if (key === 'd' || e.key === 'ArrowRight') this.activeActions.right = true;
        if (e.key === ' ' || e.code === 'Space' || e.key === 'ArrowUp') this.activeActions.jump = true;
        if (key === 's' || e.key === 'ArrowDown') this.activeActions.slide = true;
        if (key === 'Shift' || e.key === 'Enter') this.activeActions.dash = true;
        if (key === 'j' || key === 'f') this.activeActions.attack = true;
        if (key === 'g') this.activeActions.grapple = true;
      }

      if (e.key === 'Escape') this.activeActions.pause = true;
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      
      this.keys[e.key] = false;
      this.keys[e.code] = false;

      const isMP = (window.game && window.game.isMultiplayer);

      if (isMP) {
        // Player 1
        if (key === 'a') this.activeActions.left = false;
        if (key === 'd') this.activeActions.right = false;
        if (e.key === ' ' || e.code === 'Space') this.activeActions.jump = false;
        if (key === 's') this.activeActions.slide = false;
        if (e.key === 'Shift') this.activeActions.dash = false;
        if (key === 'j' || key === 'f') this.activeActions.attack = false;
        if (key === 'g') this.activeActions.grapple = false;

        // Player 2
        if (e.key === 'ArrowLeft') this.activeActionsP2.left = false;
        if (e.key === 'ArrowRight') this.activeActionsP2.right = false;
        if (e.key === 'ArrowUp') this.activeActionsP2.jump = false;
        if (e.key === 'ArrowDown') this.activeActionsP2.slide = false;
        if (e.key === 'Enter') this.activeActionsP2.dash = false;
        if (key === 'k') this.activeActionsP2.attack = false;
        if (key === 'l') this.activeActionsP2.grapple = false;
      } else {
        // Single-player
        if (key === 'a' || e.key === 'ArrowLeft') this.activeActions.left = false;
        if (key === 'd' || e.key === 'ArrowRight') this.activeActions.right = false;
        if (e.key === ' ' || e.code === 'Space' || e.key === 'ArrowUp') this.activeActions.jump = false;
        if (key === 's' || e.key === 'ArrowDown') this.activeActions.slide = false;
        if (e.key === 'Shift' || e.key === 'Enter') this.activeActions.dash = false;
        if (key === 'j' || key === 'f') this.activeActions.attack = false;
        if (key === 'g') this.activeActions.grapple = false;
      }

      if (e.key === 'Escape') this.activeActions.pause = false;
    });
  }

  bindMouseControls() {
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0 && window.game && window.game.state === 'playing') {
        this.activeActions.attack = true;
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.activeActions.attack = false;
      }
    });
  }

  bindTouchControls() {
    const touchButtons = [
      { id: 'btn-left', action: 'left' },
      { id: 'btn-right', action: 'right' },
      { id: 'btn-jump', action: 'jump' },
      { id: 'btn-dash', action: 'dash' }
    ];

    touchButtons.forEach(({ id, action }) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const triggerStart = (e) => {
        if (e.cancelable) e.preventDefault();
        this.activeActions[action] = true;
        btn.classList.add('active');
        if (action === 'jump') this.keys[' '] = true;
        if (action === 'dash') this.keys['Shift'] = true;
      };

      const triggerEnd = (e) => {
        if (e.cancelable) e.preventDefault();
        this.activeActions[action] = false;
        btn.classList.remove('active');
        if (action === 'jump') this.keys[' '] = false;
        if (action === 'dash') this.keys['Shift'] = false;
      };

      btn.addEventListener('mousedown', triggerStart);
      btn.addEventListener('mouseup', triggerEnd);
      btn.addEventListener('mouseleave', triggerEnd);

      btn.addEventListener('pointerdown', triggerStart);
      btn.addEventListener('pointerup', triggerEnd);
      btn.addEventListener('pointercancel', triggerEnd);

      btn.addEventListener('touchstart', triggerStart, { passive: false });
      btn.addEventListener('touchend', triggerEnd, { passive: false });
      btn.addEventListener('touchcancel', triggerEnd, { passive: false });
    });
  }

  clearActions() {
    this.activeActions.pause = false;
  }
}

window.input = new InputManager();
