// controlsBuilder.ts

export interface RangeControlConfig {
  type: "range";
  id: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  unit?: string;
}

export interface ColorControlConfig {
  type: "color";
  id: string;
  label: string;
  value?: string;
}

export interface SelectControlConfig {
  type: "select";
  id: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
}

export interface CheckboxControlConfig {
  type: "checkbox";
  id: string;
  label: string;
  checked?: boolean;
}

export interface NumberControlConfig {
  type: "number";
  id: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  unit?: string;
}

export interface ButtonControlConfig {
  type: "button";
  id: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
}

export type ControlConfig =
  | RangeControlConfig
  | ColorControlConfig
  | SelectControlConfig
  | CheckboxControlConfig
  | NumberControlConfig
  | ButtonControlConfig;

export interface ControlGridConfig {
  columns?: 1 | 2 | 3 | 4;
  gap?: "s" | "m" | "l";
  controls: ControlConfig[];
}

function generateRangeControl(config: RangeControlConfig): string {
  const {
    id,
    label,
    min = 0,
    max = 100,
    step = 1,
    value = 50,
    unit = "",
  } = config;
  return `
    <div class="range-control">
      <div class="range-header">
        <label for="${id}" class="range-label">${label}</label>
        <span class="range-value" data-control="${id}">${value}${unit}</span>
      </div>
      <input 
        type="range" 
        id="${id}"
        class="range-input"
        data-control-id="${id}"
        data-unit="${unit}"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${value}"
      />
    </div>
  `;
}

function generateColorControl(config: ColorControlConfig): string {
  const { id, label, value = "#4682b4" } = config;
  return `
    <div class="color-control">
      <label for="${id}" class="color-label">${label}</label>
      <div class="color-input-wrapper">
        <input 
          type="color" 
          id="${id}"
          class="color-input"
          data-control-id="${id}"
          value="${value}"
        />
        <span class="color-value" data-control="${id}">${value}</span>
      </div>
    </div>
  `;
}

function generateSelectControl(config: SelectControlConfig): string {
  const { id, label, options, value = options[0]?.value } = config;
  const optionsHtml = options
    .map(
      (opt) =>
        `<option value="${opt.value}" ${
          opt.value === value ? "selected" : ""
        }>${opt.label}</option>`
    )
    .join("");

  return `
    <div class="select-control">
      <label for="${id}" class="select-label">${label}</label>
      <select id="${id}" class="select-input" data-control-id="${id}">
        ${optionsHtml}
      </select>
    </div>
  `;
}

function generateCheckboxControl(config: CheckboxControlConfig): string {
  const { id, label, checked = false } = config;
  return `
    <div class="checkbox-control">
      <input 
        type="checkbox" 
        id="${id}"
        class="checkbox-input"
        data-control-id="${id}"
        ${checked ? "checked" : ""}
      />
      <label for="${id}" class="checkbox-label">${label}</label>
    </div>
  `;
}

function generateNumberControl(config: NumberControlConfig): string {
  const { id, label, min, max, step = 1, value = 0, unit = "" } = config;
  return `
    <div class="number-control">
      <label for="${id}" class="number-label">${label}</label>
      <div class="number-input-wrapper">
        <input 
          type="number" 
          id="${id}"
          class="number-input"
          data-control-id="${id}"
          data-unit="${unit}"
          ${min !== undefined ? `min="${min}"` : ""}
          ${max !== undefined ? `max="${max}"` : ""}
          step="${step}"
          value="${value}"
        />
        ${unit ? `<span class="number-unit">${unit}</span>` : ""}
      </div>
    </div>
  `;
}

function generateButtonControl(config: ButtonControlConfig): string {
  const { id, label, variant = "primary", fullWidth = false } = config;
  return `
    <button 
      id="${id}" 
      class="button-control button-${variant} ${fullWidth ? "button-full" : ""}"
      data-control-id="${id}"
    >
      ${label}
    </button>
  `;
}

function generateControl(config: ControlConfig): string {
  switch (config.type) {
    case "range":
      return generateRangeControl(config);
    case "color":
      return generateColorControl(config);
    case "select":
      return generateSelectControl(config);
    case "checkbox":
      return generateCheckboxControl(config);
    case "number":
      return generateNumberControl(config);
    case "button":
      return generateButtonControl(config);
    default:
      return "";
  }
}

export function buildControls(config: ControlGridConfig): string {
  const { columns = 2, gap = "m", controls } = config;

  const controlsHtml = controls.map(generateControl).join("");

  return `
    <div class="control-grid" data-columns="${columns}" data-gap="${gap}">
      ${controlsHtml}
    </div>
    <style>
      .control-grid {
        display: grid;
        gap: var(--gap-size);
        width: 100%;
      }

      .control-grid[data-columns="1"] {
        grid-template-columns: 1fr;
      }

      .control-grid[data-columns="2"] {
        grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
      }

      .control-grid[data-columns="3"] {
        grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));
      }

      .control-grid[data-columns="4"] {
        grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr));
      }

      .control-grid[data-gap="s"] {
        --gap-size: var(--space-xs);
      }

      .control-grid[data-gap="m"] {
        --gap-size: var(--space-s);
      }

      .control-grid[data-gap="l"] {
        --gap-size: var(--space-m);
      }

      @media (max-width: 640px) {
        .control-grid[data-columns="2"],
        .control-grid[data-columns="3"],
        .control-grid[data-columns="4"] {
          grid-template-columns: 1fr;
        }
      }

      /* Range Control */
      .range-control {
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs);
      }

      .range-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-2xs);
      }

      .range-label {
        font-size: var(--step--1);
        font-weight: var(--font-weight-medium);
        color: var(--gray-12);
      }

      .range-value {
        font-size: var(--step--1);
        font-weight: var(--font-weight-medium);
        color: var(--pink-10);
        font-variant-numeric: tabular-nums;
        min-width: 3ch;
        text-align: right;
      }

      .range-input {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        border-radius: var(--radius-full);
        background: var(--gray-6);
        outline: none;
        transition: background 0.2s ease;
      }

      .range-input:hover {
        background: var(--gray-7);
      }

      .range-input::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: var(--radius-full);
        background: var(--pink-9);
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid var(--gray-1);
        box-shadow: var(--shadow-s);
      }

      .range-input::-webkit-slider-thumb:hover {
        background: var(--pink-10);
        transform: scale(1.1);
      }

      .range-input::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: var(--radius-full);
        background: var(--pink-9);
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid var(--gray-1);
        box-shadow: var(--shadow-s);
      }

      .range-input::-moz-range-thumb:hover {
        background: var(--pink-10);
        transform: scale(1.1);
      }

      /* Color Control */
      .color-control {
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs);
      }

      .color-label {
        font-size: var(--step--1);
        font-weight: var(--font-weight-medium);
        color: var(--gray-12);
      }

      .color-input-wrapper {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .color-input {
        width: 60px;
        height: 40px;
        border: 2px solid var(--gray-7);
        border-radius: var(--radius-s);
        cursor: pointer;
        transition: all 0.2s ease;
        background: transparent;
      }

      .color-input:hover {
        border-color: var(--pink-9);
        transform: scale(1.02);
      }

      .color-value {
        font-size: var(--step--1);
        font-weight: var(--font-weight-medium);
        color: var(--pink-10);
        font-family: var(--font-mono);
        text-transform: uppercase;
      }

      /* Select Control */
      .select-control {
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs);
      }

      .select-label {
        font-size: var(--step--1);
        font-weight: var(--font-weight-medium);
        color: var(--gray-12);
      }

      .select-input {
        padding: var(--space-2xs) var(--space-xs);
        font-size: var(--step--1);
        color: var(--gray-12);
        background: var(--gray-2);
        border: 2px solid var(--gray-7);
        border-radius: var(--radius-s);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .select-input:hover {
        border-color: var(--pink-9);
        background: var(--gray-3);
      }

      /* Checkbox Control */
      .checkbox-control {
        display: flex;
        align-items: center;
        gap: var(--space-2xs);
      }

      .checkbox-input {
        width: 20px;
        height: 20px;
        cursor: pointer;
        appearance: none;
        border: 2px solid var(--gray-7);
        border-radius: var(--radius-xs);
        background: var(--gray-2);
        transition: all 0.2s ease;
        position: relative;
      }

      .checkbox-input:hover {
        border-color: var(--pink-9);
      }

      .checkbox-input:checked {
        background: var(--pink-9);
        border-color: var(--pink-9);
      }

      .checkbox-input:checked::after {
        content: '';
        position: absolute;
        left: 5px;
        top: 2px;
        width: 6px;
        height: 10px;
        border: solid var(--gray-1);
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      .checkbox-label {
        font-size: var(--step--1);
        font-weight: var(--font-weight-medium);
        color: var(--gray-12);
        cursor: pointer;
      }

      /* Number Control */
      .number-control {
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs);
      }

      .number-label {
        font-size: var(--step--1);
        font-weight: var(--font-weight-medium);
        color: var(--gray-12);
      }

      .number-input-wrapper {
        display: flex;
        align-items: center;
        gap: var(--space-2xs);
      }

      .number-input {
        flex: 1;
        padding: var(--space-2xs) var(--space-xs);
        font-size: var(--step--1);
        color: var(--gray-12);
        background: var(--gray-2);
        border: 2px solid var(--gray-7);
        border-radius: var(--radius-s);
        transition: all 0.2s ease;
      }

      .number-input:hover {
        border-color: var(--pink-9);
        background: var(--gray-3);
      }

      .number-unit {
        font-size: var(--step--1);
        color: var(--gray-11);
        font-weight: var(--font-weight-medium);
      }

      /* Button Control */
      .button-control {
        padding: var(--space-2xs) var(--space-s);
        font-size: var(--step--1);
        font-weight: var(--font-weight-medium);
        border-radius: var(--radius-s);
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;
      }

      .button-full {
        width: 100%;
      }

      .button-primary {
        background: var(--pink-9);
        color: var(--gray-1);
        border-color: var(--pink-9);
      }

      .button-primary:hover {
        background: var(--pink-10);
        border-color: var(--pink-10);
        transform: translateY(-1px);
        box-shadow: var(--shadow-s);
      }

      .button-secondary {
        background: var(--gray-3);
        color: var(--gray-12);
        border-color: var(--gray-7);
      }

      .button-secondary:hover {
        background: var(--gray-4);
        border-color: var(--pink-9);
        transform: translateY(-1px);
        box-shadow: var(--shadow-s);
      }

      .button-ghost {
        background: transparent;
        color: var(--pink-10);
        border-color: transparent;
      }

      .button-ghost:hover {
        background: var(--pink-3);
        border-color: var(--pink-7);
      }
    </style>
  `;
}

// Helper to generate the script for control event listeners
export function buildControlScript(handlers: Record<string, string>): string {
  const handlerCode = Object.entries(handlers)
    .map(([id, code]) => {
      return `
      // Handler for ${id}
      ${code}
    `;
    })
    .join("\n");

  return `
    <script>
      const pg = document.currentScript.closest('.d3-playground');
      const controlsContainer = document.currentScript.closest('.controls-wrapper');
      
      ${handlerCode}
    </script>
  `;
}

export function buildAutoControlScript(controls: ControlConfig[]): string {
  const listeners = controls
    .map((control) => {
      const controlId = control.id;

      switch (control.type) {
        case "range":
          return `
          // ${control.label} (${control.id})
          {
            const input = panel.querySelector('[data-control-id="${controlId}"]');
            const valueDisplay = panel.querySelector('[data-control="${controlId}"]');
            if (input && valueDisplay) {
              input.addEventListener('input', (e) => {
                const newValue = e.target.value;
                const unit = e.target.getAttribute('data-unit') || '';
                valueDisplay.textContent = newValue + unit;
                pg.sendToIframe('${controlId}', parseFloat(newValue));
              });
            }
          }
        `;

        case "color":
          return `
          // ${control.label} (${control.id})
          {
            const input = panel.querySelector('[data-control-id="${controlId}"]');
            const valueDisplay = panel.querySelector('[data-control="${controlId}"]');
            if (input && valueDisplay) {
              input.addEventListener('input', (e) => {
                const newValue = e.target.value;
                valueDisplay.textContent = newValue;
                pg.sendToIframe('${controlId}', newValue);
              });
            }
          }
        `;

        case "select":
          return `
          // ${control.label} (${control.id})
          {
            const input = panel.querySelector('[data-control-id="${controlId}"]');
            if (input) {
              input.addEventListener('change', (e) => {
                pg.sendToIframe('${controlId}', e.target.value);
              });
            }
          }
        `;

        case "number":
          return `
          // ${control.label} (${control.id})
          {
            const input = panel.querySelector('[data-control-id="${controlId}"]');
            if (input) {
              input.addEventListener('input', (e) => {
                pg.sendToIframe('${controlId}', parseFloat(e.target.value));
              });
            }
          }
        `;

        case "checkbox":
          return `
          // ${control.label} (${control.id})
          {
            const input = panel.querySelector('[data-control-id="${controlId}"]');
            if (input) {
              input.addEventListener('change', (e) => {
                pg.sendToIframe('${controlId}', e.target.checked);
              });
            }
          }
        `;

        case "button":
          return `// Button "${control.label}" needs custom handler`;

        default:
          return "";
      }
    })
    .join("\n");

  return `
    <script>
      (function() {
        const panel = document.currentScript.closest('.playground-controls');
        if (!panel) return;
        
        const playgroundId = panel.getAttribute('data-playground-id');
        if (!playgroundId) return;
        
        const pg = document.querySelector('.d3-playground[data-playground-id="' + playgroundId + '"]');
        if (!pg) return;
        
        function initControls() {
          ${listeners}
        }
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initControls);
        } else {
          initControls();
        }
      })();
    </script>
  `;
}

export function buildControlsWithAutoScript(config: {
  columns?: 1 | 2 | 3 | 4;
  gap?: "s" | "m" | "l";
  controls: ControlConfig[];
  customHandlers?: Record<string, string>;
}): string {
  const { columns = 2, gap = "m", controls, customHandlers = {} } = config;

  const html = buildControls({ columns, gap, controls });
  const autoScript = buildAutoControlScript(controls);

  if (Object.keys(customHandlers).length === 0) {
    return html + autoScript;
  }

  const customCode = Object.entries(customHandlers)
    .map(([id, code]) => {
      return `
      // Custom handler for ${id}
      {
        ${code}
      }
    `;
    })
    .join("\n");

  const customScript = `
    <script>
      (function() {
        const panel = document.currentScript.closest('.playground-controls');
        if (!panel) return;
        
        const playgroundId = panel.getAttribute('data-playground-id');
        if (!playgroundId) return;
        
        function initCustomHandlers() {
          ${customCode}
        }
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initCustomHandlers);
        } else {
          initCustomHandlers();
        }
      })();
    </script>
  `;

  return html + autoScript + customScript;
}
