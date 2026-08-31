/* ==========================================================================
   Activity No. 1: Number System Converter and Arithmetic Calculator
   JavaScript Application Core Logic & Base Conversion Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Base Constants & Subscripts ---
  const BASE_NAMES = {
    2: 'Binary',
    8: 'Octal',
    10: 'Decimal',
    16: 'Hexadecimal'
  };

  const BASE_SUBSCRIPTS = {
    2: '₂',
    8: '₈',
    10: '₁₀',
    16: '₁₆'
  };

  const HEX_DIGITS = '0123456789ABCDEF';

  // --- State Variables ---
  let inputRowsCount = 0;
  let selectedOperation = '+';

  // --- Preset Data Definitions ---
  const PRESETS = {
    combo1: {
      op: '+',
      inputs: [
        { value: '1010', base: 2 },
        { value: '17', base: 8 },
        { value: '25', base: 10 }
      ]
    },
    combo2: {
      op: '*',
      inputs: [
        { value: '1100', base: 2 },
        { value: '5', base: 10 },
        { value: '2A', base: 16 }
      ]
    },
    combo3: {
      op: '-',
      inputs: [
        { value: '100', base: 8 },
        { value: '14', base: 10 },
        { value: '1F', base: 16 }
      ]
    },
    combo4: {
      op: '/',
      inputs: [
        { value: '1000000', base: 2 },
        { value: '20', base: 8 },
        { value: '2', base: 16 }
      ]
    },
    fractional: {
      op: '+',
      inputs: [
        { value: '1010.1', base: 2 },
        { value: '12.4', base: 8 },
        { value: '3A.8', base: 16 }
      ]
    },
    quad: {
      op: '+',
      inputs: [
        { value: '1111', base: 2 },
        { value: '77', base: 8 },
        { value: '100', base: 10 },
        { value: 'FF', base: 16 }
      ]
    }
  };

  // --- DOM Elements ---
  const inputsContainer = document.getElementById('inputs-container');
  const btnAddInput = document.getElementById('btn-add-input');
  const btnResetInputs = document.getElementById('btn-reset-inputs');
  const btnCalculate = document.getElementById('btn-calculate');
  const opButtons = document.querySelectorAll('.op-btn');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const btnPrintReport = document.getElementById('btn-print-report');

  // ==========================================================================
  // 1. CONVERSION ENGINE FUNCTIONS
  // ==========================================================================

  /**
   * Validate if number string is valid for given base
   */
  function validateInputString(str, base) {
    if (!str || str.trim() === '') {
      return { isValid: false, message: 'Input cannot be empty.' };
    }

    const cleanStr = str.trim().toUpperCase();
    const parts = cleanStr.split('.');

    if (parts.length > 2) {
      return { isValid: false, message: 'Multiple radix points (.) detected.' };
    }

    let regex;
    switch (parseInt(base, 10)) {
      case 2:
        regex = /^[01]+$/;
        break;
      case 8:
        regex = /^[0-7]+$/;
        break;
      case 10:
        regex = /^[0-9]+$/;
        break;
      case 16:
        regex = /^[0-9A-F]+$/;
        break;
      default:
        return { isValid: false, message: 'Unsupported base.' };
    }

    // Validate integer part
    if (parts[0] !== '' && !regex.test(parts[0])) {
      return { isValid: false, message: `Invalid character for Base ${base}. Allowed: ${getValidDigitsString(base)}` };
    }

    // Validate fractional part if exists
    if (parts.length === 2 && parts[1] !== '' && !regex.test(parts[1])) {
      return { isValid: false, message: `Invalid fraction character for Base ${base}.` };
    }

    return { isValid: true, message: 'Valid input' };
  }

  function getValidDigitsString(base) {
    switch (parseInt(base, 10)) {
      case 2: return '0, 1';
      case 8: return '0 to 7';
      case 10: return '0 to 9';
      case 16: return '0-9, A-F';
      default: return '';
    }
  }

  /**
   * Convert any base number string to Decimal (Base 10) floating point number
   */
  function convertToDecimal(str, base) {
    const cleanStr = str.trim().toUpperCase();
    const isNegative = cleanStr.startsWith('-');
    const workingStr = isNegative ? cleanStr.substring(1) : cleanStr;

    const parts = workingStr.split('.');
    const intPartStr = parts[0] || '0';
    const fracPartStr = parts[1] || '';

    // Convert Integer Part
    let decimalInt = 0;
    const len = intPartStr.length;
    for (let i = 0; i < len; i++) {
      const char = intPartStr[len - 1 - i];
      const digitVal = HEX_DIGITS.indexOf(char);
      decimalInt += digitVal * Math.pow(base, i);
    }

    // Convert Fractional Part
    let decimalFrac = 0;
    for (let j = 0; j < fracPartStr.length; j++) {
      const char = fracPartStr[j];
      const digitVal = HEX_DIGITS.indexOf(char);
      decimalFrac += digitVal * Math.pow(base, -(j + 1));
    }

    const totalDecimal = decimalInt + decimalFrac;
    return isNegative ? -totalDecimal : totalDecimal;
  }

  /**
   * Convert Decimal (Base 10) floating point number to Target Base string
   */
  function convertFromDecimal(decimalVal, targetBase, maxFracDigits = 8) {
    if (isNaN(decimalVal) || !isFinite(decimalVal)) return 'N/A';

    const isNegative = decimalVal < 0;
    let absVal = Math.abs(decimalVal);

    let intPart = Math.floor(absVal);
    let fracPart = absVal - intPart;

    // Convert Integer Part
    let intResult = '';
    if (intPart === 0) {
      intResult = '0';
    } else {
      while (intPart > 0) {
        const rem = intPart % targetBase;
        intResult = HEX_DIGITS[rem] + intResult;
        intPart = Math.floor(intPart / targetBase);
      }
    }

    // Convert Fractional Part
    let fracResult = '';
    if (fracPart > 0.000000001) {
      let count = 0;
      while (fracPart > 0.000000001 && count < maxFracDigits) {
        fracPart *= targetBase;
        const digit = Math.floor(fracPart);
        fracResult += HEX_DIGITS[digit];
        fracPart -= digit;
        count++;
      }
    }

    const finalResult = fracResult ? `${intResult}.${fracResult}` : intResult;
    return isNegative ? `-${finalResult}` : finalResult;
  }

  // ==========================================================================
  // 2. DYNAMIC INPUT UI MANAGEMENT
  // ==========================================================================

  function createInputRow(initialValue = '', initialBase = 10) {
    inputRowsCount++;
    const rowId = `input-row-${inputRowsCount}`;

    const rowEl = document.createElement('div');
    rowEl.className = 'input-row';
    rowEl.id = rowId;

    rowEl.innerHTML = `
      <div class="input-label-tag">Input ${inputRowsCount}</div>
      <select class="select-base">
        <option value="2" ${initialBase == 2 ? 'selected' : ''}>Binary (Base 2)</option>
        <option value="8" ${initialBase == 8 ? 'selected' : ''}>Octal (Base 8)</option>
        <option value="10" ${initialBase == 10 ? 'selected' : ''}>Decimal (Base 10)</option>
        <option value="16" ${initialBase == 16 ? 'selected' : ''}>Hexadecimal (Base 16)</option>
      </select>
      <div class="input-field-group">
        <input type="text" class="input-number" placeholder="Enter number..." value="${initialValue}" autocomplete="off" spellcheck="false">
        <span class="error-hint"></span>
      </div>
      <button class="btn-remove-row" title="Remove Input">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    // Event Listeners for Row Controls
    const inputEl = rowEl.querySelector('.input-number');
    const selectBaseEl = rowEl.querySelector('.select-base');
    const btnRemove = rowEl.querySelector('.btn-remove-row');

    inputEl.addEventListener('input', () => validateRow(rowEl));
    selectBaseEl.addEventListener('change', () => validateRow(rowEl));
    
    btnRemove.addEventListener('click', () => {
      if (document.querySelectorAll('.input-row').length > 3) {
        rowEl.remove();
        reindexRows();
        calculateAndRender();
      } else {
        showToast('System requires at least 3 inputs as specified in Activity specifications.', 'warning');
      }
    });

    inputsContainer.appendChild(rowEl);
    validateRow(rowEl);
  }

  function validateRow(rowEl) {
    const inputEl = rowEl.querySelector('.input-number');
    const selectBaseEl = rowEl.querySelector('.select-base');
    const errorHintEl = rowEl.querySelector('.error-hint');

    const val = inputEl.value;
    const base = selectBaseEl.value;

    if (val.trim() === '') {
      rowEl.classList.remove('invalid');
      errorHintEl.innerText = '';
      return true;
    }

    const validation = validateInputString(val, base);
    if (!validation.isValid) {
      rowEl.classList.add('invalid');
      errorHintEl.innerText = validation.message;
      return false;
    } else {
      rowEl.classList.remove('invalid');
      errorHintEl.innerText = '';
      return true;
    }
  }

  function reindexRows() {
    const rows = inputsContainer.querySelectorAll('.input-row');
    rows.forEach((row, index) => {
      const tag = row.querySelector('.input-label-tag');
      if (tag) tag.innerText = `Input ${index + 1}`;
    });
  }

  function resetToDefaultInputs() {
    inputsContainer.innerHTML = '';
    inputRowsCount = 0;
    createInputRow('1010', 2);
    createInputRow('17', 8);
    createInputRow('15', 10);
    calculateAndRender();
  }

  // ==========================================================================
  // 3. ARITHMETIC & CONVERSION CALCULATION EXECUTION
  // ==========================================================================

  function calculateAndRender() {
    const rows = inputsContainer.querySelectorAll('.input-row');
    let allValid = true;
    const inputsData = [];

    rows.forEach((row, idx) => {
      const isRowValid = validateRow(row);
      if (!isRowValid) allValid = false;

      const inputVal = row.querySelector('.input-number').value.trim();
      const base = parseInt(row.querySelector('.select-base').value, 10);

      inputsData.push({
        label: `Input ${idx + 1}`,
        rawStr: inputVal,
        base: base,
        decimalVal: inputVal ? convertToDecimal(inputVal, base) : 0
      });
    });

    if (!allValid) {
      showToast('Please fix invalid input characters highlighted in red.', 'error');
      return;
    }

    // Build Arithmetic Expression String
    const exprParts = inputsData.map(d => `${d.rawStr || '0'}${BASE_SUBSCRIPTS[d.base]}`);
    const expressionStr = exprParts.join(` ${selectedOperation} `);
    document.getElementById('expression-display').innerText = expressionStr;

    // Evaluate Arithmetic Expression in Base 10
    let decimalResult = inputsData[0] ? inputsData[0].decimalVal : 0;
    const calcSteps = [];

    calcSteps.push(`<strong>STEP 1: Normalize all inputs to Common Base-10 (Decimal):</strong>`);
    inputsData.forEach(d => {
      calcSteps.push(`  • ${d.label} (${d.rawStr || '0'}${BASE_SUBSCRIPTS[d.base]}) = <strong>${d.decimalVal}</strong>₁₀`);
    });

    calcSteps.push(`<br><strong>STEP 2: Perform ${getOpName(selectedOperation)} Operation in Base-10:</strong>`);
    let currentCalcStr = `${inputsData[0] ? inputsData[0].decimalVal : 0}`;

    for (let i = 1; i < inputsData.length; i++) {
      const prevRes = decimalResult;
      const nextVal = inputsData[i].decimalVal;

      switch (selectedOperation) {
        case '+': decimalResult += nextVal; break;
        case '-': decimalResult -= nextVal; break;
        case '*': decimalResult *= nextVal; break;
        case '/':
          if (nextVal === 0) {
            showToast('Error: Division by zero encountered.', 'error');
            decimalResult = NaN;
          } else {
            decimalResult /= nextVal;
          }
          break;
      }
      calcSteps.push(`  • (${currentCalcStr}) ${selectedOperation} ${nextVal} = <strong>${decimalResult}</strong>`);
      currentCalcStr = `${decimalResult}`;
    }

    // Round small floating precision anomalies
    decimalResult = Math.round(decimalResult * 1e8) / 1e8;

    // Convert Final Result to All 4 Bases
    const finalBin = convertFromDecimal(decimalResult, 2);
    const finalOct = convertFromDecimal(decimalResult, 8);
    const finalDec = isNaN(decimalResult) ? 'N/A' : decimalResult.toString();
    const finalHex = convertFromDecimal(decimalResult, 16);

    document.getElementById('res-bin').innerText = finalBin;
    document.getElementById('res-oct').innerText = finalOct;
    document.getElementById('res-dec').innerText = finalDec;
    document.getElementById('res-hex').innerText = finalHex;
    document.getElementById('arithmetic-decimal-badge').innerText = `Common Decimal = ${finalDec}`;

    calcSteps.push(`<br><strong>STEP 3: Convert Final Result (${finalDec}₁₀) to All Number Systems:</strong>`);
    calcSteps.push(`  • Binary (Base 2): <strong>${finalBin}</strong>₂`);
    calcSteps.push(`  • Octal (Base 8): <strong>${finalOct}</strong>₈`);
    calcSteps.push(`  • Decimal (Base 10): <strong>${finalDec}</strong>₁₀`);
    calcSteps.push(`  • Hexadecimal (Base 16): <strong>${finalHex}</strong>₁₆`);

    document.getElementById('steps-breakdown').innerHTML = calcSteps.join('<br>');

    // Render Individual Conversions Table Matrix
    renderConversionMatrix(inputsData);
  }

  function renderConversionMatrix(inputsData) {
    const tbody = document.getElementById('conversion-matrix-tbody');
    tbody.innerHTML = '';

    inputsData.forEach(d => {
      const dec = d.decimalVal;
      const bin = convertFromDecimal(dec, 2);
      const oct = convertFromDecimal(dec, 8);
      const decStr = dec.toString();
      const hex = convertFromDecimal(dec, 16);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${d.label}</strong></td>
        <td>${d.rawStr || '0'}<span class="subscript">${BASE_SUBSCRIPTS[d.base]}</span></td>
        <td>${bin}₂</td>
        <td>${oct}₈</td>
        <td>${decStr}₁₀</td>
        <td>${hex}₁₆</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function getOpName(op) {
    switch (op) {
      case '+': return 'Addition';
      case '-': return 'Subtraction';
      case '*': return 'Multiplication';
      case '/': return 'Division';
      default: return '';
    }
  }

  // ==========================================================================
  // 4. EVENT LISTENERS & UI NAVIGATION
  // ==========================================================================

  // Operation Selector Buttons
  opButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      opButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedOperation = btn.getAttribute('data-op');
      calculateAndRender();
    });
  });

  // Calculate Button
  btnCalculate.addEventListener('click', () => {
    calculateAndRender();
    showToast('Calculation & conversions updated successfully.', 'success');
  });

  // Add Input Button
  btnAddInput.addEventListener('click', () => {
    createInputRow('', 10);
  });

  // Reset Inputs Button
  btnResetInputs.addEventListener('click', () => {
    resetToDefaultInputs();
  });

  // Navigation Tabs
  tabButtons.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      tabButtons.forEach(t => t.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Preset Loaders
  document.querySelectorAll('.btn-load-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-preset');
      const preset = PRESETS[key];

      if (preset) {
        inputsContainer.innerHTML = '';
        inputRowsCount = 0;

        preset.inputs.forEach(inp => {
          createInputRow(inp.value, inp.base);
        });

        // Set Operation
        selectedOperation = preset.op;
        opButtons.forEach(b => {
          if (b.getAttribute('data-op') === preset.op) b.classList.add('active');
          else b.classList.remove('active');
        });

        // Switch to Workbench Tab
        tabButtons[0].click();
        calculateAndRender();
        showToast(`Loaded Preset: ${key.toUpperCase()} test scenario.`, 'info');
      }
    });
  });

  // Print Report Button
  btnPrintReport.addEventListener('click', () => {
    window.print();
  });

  // Toast Notification Helper
  function showToast(msg, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'fa-info-circle';
    if (type === 'error') icon = 'fa-circle-exclamation';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  // Initial Startup
  resetToDefaultInputs();

});
