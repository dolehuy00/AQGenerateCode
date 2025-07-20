// grid_generator.js
// === Grid Generator Tab (nâng cao) ===
const numRowsInput = document.getElementById("numRowsInput");
const rowsConfigArea = document.getElementById("rowsConfigArea");
const generateGridBtn = document.getElementById("generateGridBtn");
const gridCodeTextarea = document.getElementById("gridCodeTextarea");
const copyGridCodeBtn = document.getElementById("copyGridCodeBtn");

const CONTROL_LIST = [
  { value: 'MyTextInput', label: 'Text', icon: 'bi-fonts' },
  { value: 'MyNumberInput', label: 'Number', icon: 'bi-123' },
  { value: 'MyDateInput', label: 'Date', icon: 'bi-calendar' },
  { value: 'MyTextArea', label: 'TextArea', icon: 'bi-card-text' },
  { value: 'MySelect', label: 'Select', icon: 'bi-list' },
  { value: 'MyFileInput', label: 'File', icon: 'bi-paperclip' },
  { value: 'MyCheckbox', label: 'Checkbox', icon: 'bi-check-square' },
];
let gridColControls = {};

function renderRowsConfig() {
  const numRows = parseInt(numRowsInput.value) || 1;
  let html = "";
  for (let i = 0; i < numRows; i++) {
    html += `<div class=\"grid-row-config\">
      <div class=\"row g-2 align-items-center mb-1 flex-nowrap\">
        <div class=\"col-auto d-flex align-items-center\" style=\"min-width:140px;\">
          <span class=\"fw-semibold me-2\">Dòng ${i + 1}</span>
          <input type=\"number\" min=\"1\" max=\"6\" class=\"form-control form-control-sm colNumInput\" data-row=\"${i}\" value=\"3\" style=\"width:60px;\" />
          <div class=\"form-check ms-3\">
            <input class=\"form-check-input evenRowCheckbox\" type=\"checkbox\" data-row=\"${i}\" id=\"evenRowCheckbox${i}\">
            <label class=\"form-check-label small text-primary\" for=\"evenRowCheckbox${i}\"><i class=\"bi bi-grid-1x2\"></i> Canh đều</label>
          </div>
        </div>
        <div class=\"col d-flex align-items-center flex-wrap\" id=\"row${i}ColsArea\"></div>
      </div>
    </div>`;
  }
  rowsConfigArea.innerHTML = html;
  for (let i = 0; i < numRows; i++) {
    renderColsInputs(i, 3);
  }
  rowsConfigArea.querySelectorAll(".colNumInput").forEach((input) => {
    input.addEventListener("input", function () {
      const row = parseInt(this.dataset.row);
      const n = parseInt(this.value) || 1;
      renderColsInputs(row, n);
      renderGridPreview();
    });
  });
  rowsConfigArea.querySelectorAll(".evenRowCheckbox").forEach((cb) => {
    cb.addEventListener("change", function () {
      const row = parseInt(this.dataset.row);
      const n = parseInt(document.querySelector(`.colNumInput[data-row='${row}']`).value) || 1;
      renderColsInputs(row, n);
      renderGridPreview();
    });
  });
  renderGridPreview();
}

function renderColsInputs(rowIdx, numCols) {
  const area = document.getElementById(`row${rowIdx}ColsArea`);
  if (!area) return;
  const evenCb = document.getElementById(`evenRowCheckbox${rowIdx}`);
  const isEven = evenCb && evenCb.checked;
  let html = '';
  let evenVal = Math.floor(12 / numCols);
  for (let j = 0; j < numCols; j++) {
    const key = `${rowIdx}_${j}`;
    if (!gridColControls[key]) gridColControls[key] = [];
    html += `<div class=\"input-group input-group-sm mb-1 me-2\" style=\"max-width:170px;display:inline-flex;flex-direction:column;align-items:flex-start;\">
      <div style=\"display:flex;align-items:center;width:100%;\">
        <span class=\"input-group-text\">span</span>
        <input type=\"number\" min=\"1\" max=\"12\" class=\"form-control colSpanInput\" data-row=\"${rowIdx}\" data-col=\"${j}\" value=\"${isEven ? evenVal : 4}\" ${isEven ? 'disabled' : ''} style=\"width:50px;\" />
      </div>
      <div class=\"w-100 mt-1\">
        <select class=\"form-select form-select-sm controlSelect\" data-row=\"${rowIdx}\" data-col=\"${j}\">
          <option value=\"\">+ Control</option>
          ${CONTROL_LIST.map(c => `<option value=\"${c.value}\">${c.label}</option>`).join('')}
        </select>
        <div class=\"selected-controls mt-1 d-flex flex-wrap gap-1\">
          ${gridColControls[key].map(ctrl => {
            const c = CONTROL_LIST.find(x => x.value === ctrl);
            return `<span class=\"badge bg-primary d-flex align-items-center gap-1\">`
              + `<i class=\"bi ${c?.icon}\"></i>${c?.label}`
              + `<button type=\"button\" class=\"btn-close btn-close-white btn-sm ms-1 removeControlBtn\" data-row=\"${rowIdx}\" data-col=\"${j}\" data-ctrl=\"${ctrl}\" style=\"font-size:0.7em;\"></button>`
              + `</span>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  }
  area.innerHTML = html;
  area.querySelectorAll('.colSpanInput').forEach((input) => {
    input.addEventListener('input', renderGridPreview);
    input.addEventListener('change', renderGridPreview);
  });
  area.querySelectorAll('.controlSelect').forEach(sel => {
    sel.addEventListener('change', function() {
      const row = this.dataset.row, col = this.dataset.col;
      const key = `${row}_${col}`;
      const val = this.value;
      if (val) {
        gridColControls[key].push(val);
        renderColsInputs(row, area.querySelectorAll('.colSpanInput').length);
        renderGridPreview();
      }
      this.value = '';
    });
  });
  area.querySelectorAll('.removeControlBtn').forEach(btn => {
    btn.addEventListener('click', function() {
      const row = this.dataset.row, col = this.dataset.col, ctrl = this.dataset.ctrl;
      const key = `${row}_${col}`;
      gridColControls[key] = gridColControls[key].filter(x => x !== ctrl);
      renderColsInputs(row, area.querySelectorAll('.colSpanInput').length);
      renderGridPreview();
    });
  });
}

function getGridConfig() {
  const numRows = parseInt(numRowsInput.value) || 1;
  const config = [];
  for (let i = 0; i < numRows; i++) {
    const rowDiv = document.getElementById(`row${i}ColsArea`);
    if (!rowDiv) continue;
    const evenCb = document.getElementById(`evenRowCheckbox${i}`);
    const isEven = evenCb && evenCb.checked;
    const colInputs = rowDiv.querySelectorAll(".colSpanInput");
    let spans;
    if (isEven) {
      const n = colInputs.length;
      const evenVal = Math.floor(12 / n);
      spans = Array(n).fill(evenVal);
    } else {
      spans = Array.from(colInputs).map((inp) => parseInt(inp.value) || 1);
    }
    config.push(spans);
  }
  return config;
}

function renderGridPreview() {
  const config = getGridConfig();
  const gridPreview = document.getElementById("gridPreview");
  let html = "";
  for (let i = 0; i < config.length; i++) {
    html += '<div class="d-flex mb-2" style="min-height:36px; gap:4px;">';
    for (let j = 0; j < config[i].length; j++) {
      const widthPercent = (config[i][j] / 12) * 100;
      const key = `${i}_${j}`;
      html += `<div style="flex:0 0 ${widthPercent}%;max-width:${widthPercent}%;border:1px solid #b6d4fe;background:#e7f1ff;display:flex;align-items:center;justify-content:center;font-weight:500;min-height:36px;flex-direction:column;">
        <div class='d-flex flex-wrap gap-1 justify-content-center'>${(gridColControls[key]||[]).map(ctrl => {
          const c = CONTROL_LIST.find(x => x.value === ctrl);
          return `<i class='bi ${c?.icon}' title='${c?.label}' style='font-size:1.2em;'></i>`;
        }).join('')}</div>
        <div style='font-size:0.85em;color:#555;'>span={${config[i][j]}}</div>
      </div>`;
    }
    html += "</div>";
  }
  gridPreview.innerHTML = html;
}

function generateGridCode() {
  const config = getGridConfig();
  let code = "<Grid>\n";
  for (let i = 0; i < config.length; i++) {
    for (let j = 0; j < config[i].length; j++) {
      const key = `${i}_${j}`;
      code += `    <Grid.Col span={${config[i][j]}}>` + "\n";
      (gridColControls[key]||[]).forEach(ctrl => {
        code += `        <${ctrl} label=\"\"`;
        if(ctrl==="MySelect") code += ' data={[]}'
        code += ' {...form.getInputProps(\"\")';
        if(ctrl==="MyCheckbox") code += ', {type:\"checkbox\"}';
        code += "} />\n";
      });
      code += `    </Grid.Col>\n`;
    }
  }
  code += "</Grid>";
  gridCodeTextarea.value = code;
}

numRowsInput && numRowsInput.addEventListener("input", renderRowsConfig);
document.addEventListener("DOMContentLoaded", renderRowsConfig);
rowsConfigArea && rowsConfigArea.addEventListener("input", renderGridPreview);
rowsConfigArea && rowsConfigArea.addEventListener("change", renderGridPreview);
generateGridBtn && generateGridBtn.addEventListener("click", generateGridCode);
renderRowsConfig();
renderGridPreview();
gridCodeTextarea.value = "";
copyGridCodeBtn &&
  copyGridCodeBtn.addEventListener("click", () => {
    gridCodeTextarea.select();
    document.execCommand("copy");
  }); 