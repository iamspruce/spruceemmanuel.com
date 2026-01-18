interface PlaygroundState {
  playground: Element;
  outputFrame: HTMLIFrameElement | null;
  playgroundId: string;
  editable: boolean;
  debounceTimer: number | null;
  isIframeReady: boolean;
}

const playgroundStates = new Map<string, PlaygroundState>();

export function initPlayground(playground: Element) {
  const playgroundId = playground.getAttribute("data-playground-id");
  if (!playgroundId) {
    console.error("Playground missing data-playground-id");
    return;
  }

  const outputFrame = playground.querySelector(
    ".output-frame"
  ) as HTMLIFrameElement;
  const editable = playground.getAttribute("data-editable") === "true";

  // Store playground state
  const state: PlaygroundState = {
    playground,
    outputFrame,
    playgroundId,
    editable,
    debounceTimer: null,
    isIframeReady: false,
  };
  playgroundStates.set(playgroundId, state);

  // Initialize syntax highlighting
  if (typeof (window as any).Prism !== "undefined") {
    (window as any).Prism.highlightAllUnder(playground);
  }

  // Setup tab switching
  setupTabs(playground);

  // Setup reset functionality
  setupReset(state);

  // Setup fullscreen
  setupFullscreen(playground);

  // Setup code editing if enabled
  if (editable) {
    setupCodeEditing(state);
  }

  // Track iframe ready state
  trackIframeReady(state);

  // Expose sendToIframe method on the playground element
  (playground as any).sendToIframe = (controlId: string, value: any) => {
    sendToIframe(state, controlId, value);
  };
}

function setupTabs(playground: Element) {
  const tabBtns = playground.querySelectorAll(".tab-btn");
  const codePanels = playground.querySelectorAll(".code-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      tabBtns.forEach((b) => b.classList.remove("active"));
      codePanels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const panel = playground.querySelector(`[data-panel="${tab}"]`);
      if (panel) panel.classList.add("active");
    });
  });
}

function setupReset(state: PlaygroundState) {
  const resetBtns = state.playground.querySelectorAll(
    ".reset-btn, .reset-btn-large"
  );

  resetBtns.forEach((resetBtn) => {
    resetBtn?.addEventListener("click", () => {
      if (state.outputFrame?.contentWindow) {
        state.outputFrame.contentWindow.location.reload();
        state.isIframeReady = false;

        // Re-track iframe ready after reload
        trackIframeReady(state);
      }
      state.playground.dispatchEvent(new CustomEvent("playgroundReset"));
    });
  });
}

function setupFullscreen(playground: Element) {
  const fullscreenBtn = playground.querySelector(".fullscreen-btn");

  fullscreenBtn?.addEventListener("click", () => {
    const outputSection = playground.querySelector(".output-section");
    if (outputSection) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        outputSection.requestFullscreen().catch((err) => {
          console.error("Error attempting to enable fullscreen:", err);
        });
      }
    }
  });
}

function setupCodeEditing(state: PlaygroundState) {
  const codeBlocks = state.playground.querySelectorAll(
    "code[contenteditable='true']"
  );

  codeBlocks.forEach((code) => {
    code.addEventListener("input", () => {
      if (state.debounceTimer) {
        clearTimeout(state.debounceTimer);
      }
      state.debounceTimer = window.setTimeout(() => {
        updateOutput(state);
      }, 500);
    });

    // Prevent losing focus on certain key combinations
    code.addEventListener("keydown", (e: Event) => {
      const event = e as KeyboardEvent;
      if (event.key === "Tab") {
        event.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode("  "));
          range.collapse(false);
        }
      }
    });
  });
}

function trackIframeReady(state: PlaygroundState) {
  if (!state.outputFrame) return;

  const handleLoad = () => {
    // For sandboxed iframes, we can't access the document
    // Just wait a bit and assume ready
    setTimeout(() => {
      state.isIframeReady = true;
    }, 200);
  };

  state.outputFrame.addEventListener("load", handleLoad);

  // Call once in case already loaded
  handleLoad();
}

function sendToIframe(state: PlaygroundState, controlId: string, value: any) {
  if (!state.outputFrame?.contentWindow) {
    console.warn("Iframe not ready for playground:", state.playgroundId);
    return;
  }

  // For sandboxed iframes, just send immediately
  // The iframe will queue messages until it's ready
  try {
    state.outputFrame.contentWindow.postMessage(
      {
        type: "d3-control-change",
        controlId,
        value,
        playgroundId: state.playgroundId,
      },
      "*"
    );
  } catch (error) {
    console.error("Error sending message to iframe:", error);
  }
}

// CSS variables for iframe (with both light and dark theme support)
const iframeStyleVars = `
:root {
  --pink-a4: #e2008b23;
  --pink-1: #fffcfe;
  --pink-11: #c2298a;
  --gray-1: #fcfcfc;
  --gray-2: #f9f9f9;
  --gray-3: #f0f0f0;
  --gray-4: #e8e8e8;
  --gray-6: #d9d9d9;
  --gray-7: #cecece;
  --gray-9: #8d8d8d;
  --gray-11: #646464;
  --gray-12: #202020;
}

@media (prefers-color-scheme: dark) {
  :root {
    --gray-1: #111111;
    --gray-2: #191919;
    --gray-3: #222222;
    --gray-4: #2a2a2a;
    --gray-6: #3a3a3a;
    --gray-7: #484848;
    --gray-9: #6e6e6e;
    --gray-11: #b4b4b4;
    --gray-12: #eeeeee;
    --pink-1: #191117;
    --pink-11: #ff8dcc;
  }
}
`;

function getGridStyles(gridSize: number, showGrid: boolean): string {
  if (!showGrid) return "";
  return `<style>
    body {
      background-image:
        linear-gradient(var(--mauve-3) 1px, transparent 1px),
        linear-gradient(90deg, var(--mauve-3) 1px, transparent 1px);
      background-size: ${gridSize}px ${gridSize}px;
      background-position: -1px -1px;
    }
    .grid-labels { 
      position: absolute; 
      top: 0; 
      left: 0; 
      right: 0; 
      bottom: 0; 
      pointer-events: none; 
      z-index: 9998; 
      font-family: monospace; 
      font-size: 8px; 
      color: var(--mauve-12); 
      font-weight: 600; 
      opacity: 0.7; 
    }
    .grid-label-x, .grid-label-y { position: absolute; }
  </style>`;
}

function getGridScript(gridSize: number, showGrid: boolean): string {
  if (!showGrid) return "";
  return `<script>
    (function() {
      const gridSize = ${gridSize};
      const labels = document.createElement('div');
      labels.className = 'grid-labels';
      document.body.appendChild(labels);
      const maxWidth = Math.max(document.body.scrollWidth, window.innerWidth, 2000);
      const maxHeight = Math.max(document.body.scrollHeight, window.innerHeight, 1000);
      for (let x = gridSize; x < maxWidth; x += gridSize) { 
        const label = document.createElement('div'); 
        label.className = 'grid-label-x'; 
        label.style.left = x + 'px'; 
        label.style.top = '2px'; 
        label.style.transform = 'translateX(-50%)'; 
        label.textContent = x; 
        labels.appendChild(label); 
      }
      for (let y = gridSize; y < maxHeight; y += gridSize) { 
        const label = document.createElement('div'); 
        label.className = 'grid-label-y'; 
        label.style.left = '2px'; 
        label.style.top = y + 'px'; 
        label.style.transform = 'translateY(-50%)'; 
        label.textContent = y; 
        labels.appendChild(label); 
      }
    })();
  <\/script>`;
}

function updateOutput(state: PlaygroundState) {
  if (!state.outputFrame) return;

  const htmlCode =
    state.playground.querySelector('[data-panel="html"] code')?.textContent ||
    "";
  const cssCode =
    state.playground.querySelector('[data-panel="css"] code')?.textContent ||
    "";
  const jsCode =
    state.playground.querySelector('[data-panel="js"] code')?.textContent || "";

  const jsControls = state.playground.getAttribute("data-js-controls") || "";
  const fullJsCode = jsCode + "\n\n" + jsControls;

  const showGrid = state.playground.getAttribute("data-show-grid") === "true";
  const gridSize = parseInt(
    state.playground.getAttribute("data-grid-size") || "50",
    10
  );
  const gridStyles = getGridStyles(gridSize, showGrid);
  const gridScript = getGridScript(gridSize, showGrid);

  const newDoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        ${iframeStyleVars}
        
        /* Better scrollbar styling */
        * {
          scrollbar-width: thin;
          scrollbar-color: var(--mauve-7) var(--mauve-2);
        }
        
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: var(--mauve-2);
        }
        
        *::-webkit-scrollbar-thumb {
          background: var(--mauve-7);
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: var(--mauve-8);
        }
        
        body {
          margin: 0;
          padding: 0;
          overflow: auto;
        }
        
        ${cssCode}
      </style>
      ${gridStyles}
      <script src="https://d3js.org/d3.v7.min.js"><\/script>
    </head>
    <body style="background-color: var(--mauve-1); color: var(--mauve-12);">
      ${htmlCode}
      <script>
        window.addEventListener('message', (event) => {
          if (event.data.type === 'd3-control-change') {
            const customEvent = new CustomEvent('playgroundControlChange', { 
              detail: { 
                controlId: event.data.controlId, 
                value: event.data.value,
                playgroundId: event.data.playgroundId
              } 
            });
            window.dispatchEvent(customEvent);
          }
        });
        ${fullJsCode}
      <\/script>
      ${gridScript}
    </body>
    </html>
  `;

  state.isIframeReady = false;
  state.outputFrame.setAttribute("srcdoc", newDoc);
  trackIframeReady(state);
}
// Cleanup function for when playgrounds are removed
export function cleanupPlayground(playgroundId: string) {
  const state = playgroundStates.get(playgroundId);
  if (state?.debounceTimer) {
    clearTimeout(state.debounceTimer);
  }
  playgroundStates.delete(playgroundId);
}
