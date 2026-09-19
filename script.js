/* ==========================================================================
   Activity No. 1: Number System Converter and Arithmetic Calculator
   JavaScript Application Core Logic & Expression Engine
   Supports: Arbitrary Expressions, Parentheses, PEMDAS/BODMAS Precedence,
   Associativity, and Comprehensive Arithmetic Error Handling
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // --- Base Constants & Subscripts ---
  const BASE_NAMES = {
    2: "Binary",
    8: "Octal",
    10: "Decimal",
    16: "Hexadecimal",
  };

  const BASE_SUBSCRIPTS = {
    2: "₂",
    8: "₈",
    10: "₁₀",
    16: "₁₆",
  };

  const HEX_DIGITS = "0123456789ABCDEF";
  const VAR_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // --- State Variables ---
  let inputRowsCount = 0;
  let complementSelectorsInitialized = false;

  // --- Preset Data Definitions with Expressions ---
  const PRESETS = {
    combo1: {
      expression: "(A + B - C) * D",
      inputs: [
        { value: "1010", base: 2 }, // 10
        { value: "17", base: 8 }, // 15
        { value: "5", base: 10 }, // 5
        { value: "2", base: 16 }, // 2 -> (10 + 15 - 5) * 2 = 40
      ],
    },
    combo2: {
      expression: "A + B * C - D",
      inputs: [
        { value: "10", base: 10 }, // 10
        { value: "1100", base: 2 }, // 12
        { value: "5", base: 10 }, // 5
        { value: "20", base: 8 }, // 16 -> 10 + (12 * 5) - 16 = 54
      ],
    },
    combo3: {
      expression: "((A + B) * C) / D",
      inputs: [
        { value: "100", base: 8 }, // 64
        { value: "14", base: 10 }, // 14
        { value: "2", base: 10 }, // 2
        { value: "4", base: 16 }, // 4 -> ((64 + 14) * 2) / 4 = 39
      ],
    },
    combo4: {
      expression: "A / (B - C)",
      inputs: [
        { value: "1000", base: 2 }, // 8
        { value: "10", base: 10 }, // 10
        { value: "12", base: 8 }, // 10 -> Denominator = 0 (Div by zero error)
      ],
    },
    mismatch: {
      expression: "(A + B * C",
      inputs: [
        { value: "1010", base: 2 },
        { value: "5", base: 10 },
        { value: "2", base: 16 },
      ],
    },
    fractional: {
      expression: "(A + B) * C",
      inputs: [
        { value: "1010.1", base: 2 }, // 10.5
        { value: "12.4", base: 8 }, // 10.5
        { value: "2", base: 10 }, // 2 -> (10.5 + 10.5) * 2 = 42
      ],
    },
  };

  // --- DOM Elements ---
  const inputsContainer = document.getElementById("inputs-container");
  const btnAddInput = document.getElementById("btn-add-input");
  const btnAddInputFloat = document.getElementById("btn-add-input-float");
  const btnResetInputs = document.getElementById("btn-reset-inputs");
  const btnCalculate = document.getElementById("btn-calculate");
  const customExprInput = document.getElementById("custom-expression-input");
  const keypadVarsContainer = document.getElementById("keypad-vars");
  const errorBanner = document.getElementById("expression-error-banner");
  const errorMsgEl = document.getElementById("expression-error-msg");
  const complementWidthSelect = document.getElementById("complement-width");
  const complementMinuendSelect = document.getElementById("complement-minuend");
  const complementSubtrahendSelect = document.getElementById(
    "complement-subtrahend",
  );
  const complementSubtractionButton = document.getElementById(
    "btn-complement-subtract",
  );
  const complementResult = document.getElementById(
    "complement-subtraction-result",
  );
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  // ==========================================================================
  // 1. CONVERSION ENGINE FUNCTIONS (Radix & Floating-Point Expansion)
  // ==========================================================================

  /**
   * Validate if number string is valid for given base
   */
  function validateInputString(str, base) {
    if (!str || str.trim() === "") {
      return { isValid: false, message: "Input cannot be empty." };
    }

    const cleanStr = str.trim().toUpperCase();
    const magnitudeStr = cleanStr.startsWith("-")
      ? cleanStr.substring(1)
      : cleanStr;

    if (!magnitudeStr || magnitudeStr === ".") {
      return {
        isValid: false,
        message: "Input must contain at least one digit.",
      };
    }

    const parts = magnitudeStr.split(".");

    if (parts.length > 2) {
      return { isValid: false, message: "Multiple radix points (.) detected." };
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
        return { isValid: false, message: "Unsupported base." };
    }

    if (parts[0] !== "" && !regex.test(parts[0])) {
      return {
        isValid: false,
        message: `Invalid character for Base ${base}. Allowed: ${getValidDigitsString(base)}`,
      };
    }

    if (parts.length === 2 && parts[1] !== "" && !regex.test(parts[1])) {
      return {
        isValid: false,
        message: `Invalid fraction character for Base ${base}.`,
      };
    }

    return { isValid: true, message: "Valid input" };
  }

  function getValidDigitsString(base) {
    switch (parseInt(base, 10)) {
      case 2:
        return "0, 1";
      case 8:
        return "0 to 7";
      case 10:
        return "0 to 9";
      case 16:
        return "0-9, A-F";
      default:
        return "";
    }
  }

  /**
   * Convert any base number string to Decimal (Base 10) floating point number
   */
  function convertToDecimal(str, base) {
    const cleanStr = str.trim().toUpperCase();
    const isNegative = cleanStr.startsWith("-");
    const workingStr = isNegative ? cleanStr.substring(1) : cleanStr;

    const parts = workingStr.split(".");
    const intPartStr = parts[0] || "0";
    const fracPartStr = parts[1] || "";

    let decimalInt = 0;
    const len = intPartStr.length;
    for (let i = 0; i < len; i++) {
      const char = intPartStr[len - 1 - i];
      const digitVal = HEX_DIGITS.indexOf(char);
      decimalInt += digitVal * Math.pow(base, i);
    }

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
    if (isNaN(decimalVal) || !isFinite(decimalVal)) return "N/A";

    const isNegative = decimalVal < 0;
    let absVal = Math.abs(decimalVal);

    let intPart = Math.floor(absVal);
    let fracPart = absVal - intPart;

    let intResult = "";
    if (intPart === 0) {
      intResult = "0";
    } else {
      while (intPart > 0) {
        const rem = intPart % targetBase;
        intResult = HEX_DIGITS[rem] + intResult;
        intPart = Math.floor(intPart / targetBase);
      }
    }

    let fracResult = "";
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
  // 2. EXPRESSION PARSER & EVALUATION ENGINE (PEMDAS, BODMAS, SHUNTING-YARD)
  // ==========================================================================

  const OPERATOR_DEFS = {
    "+": {
      precedence: 1,
      associativity: "L",
      fn: (a, b) => a + b,
      symbol: "+",
    },
    "-": {
      precedence: 1,
      associativity: "L",
      fn: (a, b) => a - b,
      symbol: "−",
    },
    "*": {
      precedence: 2,
      associativity: "L",
      fn: (a, b) => a * b,
      symbol: "×",
    },
    "/": {
      precedence: 2,
      associativity: "L",
      fn: (a, b) => {
        if (Math.abs(b) < 1e-12) {
          throw new Error(
            `Arithmetic Error: Division by zero encountered (${a} ÷ 0). Division by zero is mathematically undefined.`,
          );
        }
        return a / b;
      },
      symbol: "÷",
    },
  };

  /**
   * Tokenize mathematical expression into variables, numbers, operators, and parentheses
   */
  function tokenizeExpression(expr) {
    if (!expr || expr.trim() === "") {
      throw new Error(
        "Expression is empty. Please enter an arithmetic expression.",
      );
    }

    // Normalize unicode symbols
    let normalized = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/\s+/g, "");

    const tokens = [];
    let i = 0;
    const len = normalized.length;

    while (i < len) {
      const char = normalized[i];

      // Parentheses
      if (char === "(" || char === ")") {
        tokens.push({ type: "paren", value: char });
        i++;
        continue;
      }

      // Operators (+, -, *, /)
      if (char in OPERATOR_DEFS) {
        // Check for unary minus (at start or after '(' or after another operator)
        const prevToken = tokens[tokens.length - 1];
        const isUnary =
          char === "-" &&
          (!prevToken ||
            prevToken.value === "(" ||
            prevToken.type === "operator");

        if (isUnary) {
          tokens.push({ type: "number", value: 0 });
          tokens.push({ type: "operator", value: "-" });
        } else {
          tokens.push({ type: "operator", value: char });
        }
        i++;
        continue;
      }

      // Variables (single letter A-Z or a-z)
      if (/[A-Za-z]/.test(char)) {
        tokens.push({ type: "variable", value: char.toUpperCase() });
        i++;
        continue;
      }

      // Raw Numeric Literals (e.g. 25 or 3.14)
      if (/[0-9]/.test(char) || char === ".") {
        let numStr = "";
        while (
          i < len &&
          (/[0-9]/.test(normalized[i]) || normalized[i] === ".")
        ) {
          numStr += normalized[i];
          i++;
        }
        if ((numStr.match(/\./g) || []).length > 1) {
          throw new Error(
            `Syntax Error: Invalid number literal '${numStr}' with multiple decimal points.`,
          );
        }
        tokens.push({ type: "number", value: parseFloat(numStr) });
        continue;
      }

      throw new Error(
        `Syntax Error: Unrecognized character '${char}' in expression.`,
      );
    }

    // Validation: Check for consecutive operators, empty parentheses, or trailing operators
    for (let t = 0; t < tokens.length; t++) {
      const cur = tokens[t];
      const next = tokens[t + 1];

      if (cur.type === "operator" && next && next.type === "operator") {
        throw new Error(
          `Syntax Error: Consecutive operators '${cur.value} ${next.value}' are invalid.`,
        );
      }

      if (cur.value === "(" && next && next.value === ")") {
        throw new Error(`Syntax Error: Empty parentheses '()' detected.`);
      }
    }

    const last = tokens[tokens.length - 1];
    if (last && last.type === "operator") {
      throw new Error(
        `Syntax Error: Expression cannot end with operator '${last.value}'.`,
      );
    }

    const first = tokens[0];
    if (first && first.type === "operator" && first.value !== "-") {
      throw new Error(
        `Syntax Error: Expression cannot start with operator '${first.value}'.`,
      );
    }

    return tokens;
  }

  /**
   * Shunting-Yard Algorithm: Convert Infix Tokens to Postfix / Reverse Polish Notation (RPN)
   * Strictly enforces PEMDAS / BODMAS operator precedence and associativity
   */
  function infixToPostfix(tokens) {
    const outputQueue = [];
    const operatorStack = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === "variable" || token.type === "number") {
        outputQueue.push(token);
      } else if (token.type === "operator") {
        const op1 = token.value;
        const op1Def = OPERATOR_DEFS[op1];

        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type !== "operator") break;

          const op2 = top.value;
          const op2Def = OPERATOR_DEFS[op2];

          // Operator precedence & left-to-right associativity check
          if (
            (op1Def.associativity === "L" &&
              op1Def.precedence <= op2Def.precedence) ||
            (op1Def.associativity === "R" &&
              op1Def.precedence < op2Def.precedence)
          ) {
            outputQueue.push(operatorStack.pop());
          } else {
            break;
          }
        }
        operatorStack.push(token);
      } else if (token.value === "(") {
        operatorStack.push(token);
      } else if (token.value === ")") {
        let foundOpenParen = false;
        while (operatorStack.length > 0) {
          const top = operatorStack.pop();
          if (top.value === "(") {
            foundOpenParen = true;
            break;
          }
          outputQueue.push(top);
        }
        if (!foundOpenParen) {
          throw new Error(
            "Syntax Error: Mismatched parentheses. Found unexpected closing ')' without a matching '('.",
          );
        }
      }
    }

    while (operatorStack.length > 0) {
      const top = operatorStack.pop();
      if (top.value === "(" || top.value === ")") {
        throw new Error(
          "Syntax Error: Mismatched parentheses. Unclosed '(' found in expression.",
        );
      }
      outputQueue.push(top);
    }

    return outputQueue;
  }

  /**
   * Evaluate Postfix (RPN) Stack with Variable Bindings and Step Tracing
   */
  function evaluatePostfixRPN(postfixTokens, variableMap) {
    const evalStack = [];
    const stepLogs = [];
    let stepCount = 0;

    for (let i = 0; i < postfixTokens.length; i++) {
      const token = postfixTokens[i];

      if (token.type === "variable") {
        const varName = token.value;
        if (!(varName in variableMap)) {
          const definedVars = Object.keys(variableMap).sort().join(", ");
          throw new Error(
            `Undefined Variable: '${varName}' is not defined. Available inputs: [${definedVars}].`,
          );
        }
        const varData = variableMap[varName];
        evalStack.push({
          val: varData.decimalVal,
          repr: `${varName}`,
          detailed: `${varName}(${varData.decimalVal})`,
        });
      } else if (token.type === "number") {
        evalStack.push({
          val: token.value,
          repr: `${token.value}`,
          detailed: `${token.value}`,
        });
      } else if (token.type === "operator") {
        if (evalStack.length < 2) {
          throw new Error(
            `Syntax Error: Insufficient operands for operator '${token.value}'.`,
          );
        }

        const b = evalStack.pop();
        const a = evalStack.pop();
        const opDef = OPERATOR_DEFS[token.value];

        stepCount++;
        const evaluatedValue = opDef.fn(a.val, b.val);
        const stepDesc = `  • Step ${stepCount} [${opDef.symbol}]: (${a.repr}) ${opDef.symbol} (${b.repr}) → (${a.val}) ${opDef.symbol} (${b.val}) = <strong>${evaluatedValue}</strong>`;
        stepLogs.push(stepDesc);

        evalStack.push({
          val: evaluatedValue,
          repr: `${evaluatedValue}`,
          detailed: `(${a.repr} ${opDef.symbol} ${b.repr})`,
        });
      }
    }

    if (evalStack.length !== 1) {
      throw new Error(
        "Syntax Error: Incomplete expression evaluation. Verify formula operands and operators.",
      );
    }

    return {
      finalDecimal: evalStack[0].val,
      stepLogs: stepLogs,
    };
  }

  // ==========================================================================
  // 3. DYNAMIC INPUT ROWS & UI MANAGEMENT
  // ==========================================================================

  function createInputRow(initialValue = "", initialBase = 10) {
    inputRowsCount++;
    const rowId = `input-row-${inputRowsCount}`;

    const rowEl = document.createElement("div");
    rowEl.className = "input-row";
    rowEl.id = rowId;

    rowEl.innerHTML = `
      <div class="input-var-tag" title="Variable Symbol">A</div>
      <div class="input-label-tag">Input ${inputRowsCount}</div>
      <select class="select-base">
        <option value="2" ${initialBase == 2 ? "selected" : ""}>Binary (Base 2)</option>
        <option value="8" ${initialBase == 8 ? "selected" : ""}>Octal (Base 8)</option>
        <option value="10" ${initialBase == 10 ? "selected" : ""}>Decimal (Base 10)</option>
        <option value="16" ${initialBase == 16 ? "selected" : ""}>Hexadecimal (Base 16)</option>
      </select>
      <div class="input-field-group">
        <input type="text" class="input-number" placeholder="Enter number..." value="${initialValue}" autocomplete="off" spellcheck="false">
        <span class="error-hint"></span>
      </div>
      <button class="btn-remove-row" title="Remove Input">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;

    // Row Event Listeners
    const inputEl = rowEl.querySelector(".input-number");
    const selectBaseEl = rowEl.querySelector(".select-base");
    const btnRemove = rowEl.querySelector(".btn-remove-row");

    inputEl.addEventListener("input", () => {
      validateRow(rowEl);
      calculateAndRender();
    });

    selectBaseEl.addEventListener("change", () => {
      validateRow(rowEl);
      calculateAndRender();
    });

    btnRemove.addEventListener("click", () => {
      if (document.querySelectorAll(".input-row").length > 3) {
        rowEl.remove();
        reindexRows();
        calculateAndRender();
        showToast("Removed input field.", "info");
      } else {
        showToast(
          "System requires at least 3 inputs as specified in Activity instructions.",
          "warning",
        );
      }
    });

    inputsContainer.appendChild(rowEl);
    reindexRows();
    validateRow(rowEl);
  }

  function validateRow(rowEl) {
    const inputEl = rowEl.querySelector(".input-number");
    const selectBaseEl = rowEl.querySelector(".select-base");
    const errorHintEl = rowEl.querySelector(".error-hint");

    const val = inputEl.value;
    const base = selectBaseEl.value;

    if (val.trim() === "") {
      rowEl.classList.remove("invalid");
      errorHintEl.innerText = "";
      return true;
    }

    const validation = validateInputString(val, base);
    if (!validation.isValid) {
      rowEl.classList.add("invalid");
      errorHintEl.innerText = validation.message;
      return false;
    } else {
      rowEl.classList.remove("invalid");
      errorHintEl.innerText = "";
      return true;
    }
  }

  function reindexRows() {
    const rows = inputsContainer.querySelectorAll(".input-row");
    rows.forEach((row, index) => {
      const varLetter = VAR_LETTERS[index] || `V${index + 1}`;
      const varTag = row.querySelector(".input-var-tag");
      if (varTag) varTag.innerText = varLetter;

      const labelTag = row.querySelector(".input-label-tag");
      if (labelTag) labelTag.innerText = `Input ${index + 1}`;
    });

    // Update Top Stat
    const topMetricInputs = document.getElementById("top-metric-inputs");
    if (topMetricInputs) {
      topMetricInputs.innerHTML = `${rows.length} <span class="unit">fields</span>`;
    }

    // Refresh Keypad Variable Buttons
    refreshKeypadVariableButtons();
    refreshComplementSelectors();
  }

  function refreshKeypadVariableButtons() {
    if (!keypadVarsContainer) return;
    const rows = inputsContainer.querySelectorAll(".input-row");
    keypadVarsContainer.innerHTML =
      '<span class="keypad-label">Variables:</span>';

    rows.forEach((row, index) => {
      const varLetter = VAR_LETTERS[index] || `V${index + 1}`;
      const btn = document.createElement("button");
      btn.className = "key-btn key-var";
      btn.setAttribute("data-token", varLetter);
      btn.innerText = varLetter;
      btn.addEventListener("click", () => insertTokenAtCursor(varLetter));
      keypadVarsContainer.appendChild(btn);
    });
  }

  function insertTokenAtCursor(token) {
    if (!customExprInput) return;
    const startPos =
      customExprInput.selectionStart || customExprInput.value.length;
    const endPos = customExprInput.selectionEnd || customExprInput.value.length;
    const val = customExprInput.value;

    // Add spacing around operators
    let insertText = token;
    if (token in OPERATOR_DEFS) {
      insertText = ` ${token} `;
    }

    customExprInput.value =
      val.substring(0, startPos) + insertText + val.substring(endPos);
    customExprInput.focus();
    customExprInput.selectionStart = customExprInput.selectionEnd =
      startPos + insertText.length;
    calculateAndRender();
  }

  function resetToDefaultInputs() {
    inputsContainer.innerHTML = "";
    inputRowsCount = 0;
    createInputRow("1010", 2); // A = 10
    createInputRow("17", 8); // B = 15
    createInputRow("5", 10); // C = 5
    createInputRow("2", 16); // D = 2
    if (customExprInput) {
      customExprInput.value = "(A + B - C) * D";
    }
    calculateAndRender();
  }

  function normalizeToBitWidth(value, bitWidth) {
    const modulus = 2 ** bitWidth;
    return ((value % modulus) + modulus) % modulus;
  }

  function getComplementRepresentation(decimalValue, bitWidth) {
    if (!Number.isSafeInteger(decimalValue)) return null;

    const modulus = 2 ** bitWidth;
    const normalizedValue = normalizeToBitWidth(decimalValue, bitWidth);
    const sourceBits = normalizedValue.toString(2).padStart(bitWidth, "0");
    const onesValue = modulus - 1 - normalizedValue;
    const twosValue = (modulus - normalizedValue) % modulus;

    return {
      width: bitWidth,
      sourceBits,
      onesBits: onesValue.toString(2).padStart(bitWidth, "0"),
      twosBits: twosValue.toString(2).padStart(bitWidth, "0"),
      onesValue,
      twosValue,
    };
  }

  function formatComplementBases(representation, valueKey, bitsKey) {
    const value = representation[valueKey];
    return {
      binary: representation[bitsKey],
      octal: convertFromDecimal(value, 8),
      decimal: value.toString(),
      hexadecimal: convertFromDecimal(value, 16),
    };
  }

  function complementCellMarkup(values) {
    return `<div class="complement-cell">
      <span><strong>Bin</strong>${values.binary}</span>
      <span><strong>Oct</strong>${values.octal}</span>
      <span><strong>Dec</strong>${values.decimal}</span>
      <span><strong>Hex</strong>${values.hexadecimal}</span>
    </div>`;
  }

  function refreshComplementSelectors() {
    if (!complementMinuendSelect || !complementSubtrahendSelect) return;

    const rows = inputsContainer.querySelectorAll(".input-row");
    const previousMinuend = complementMinuendSelect.value;
    const previousSubtrahend = complementSubtrahendSelect.value;
    const options = Array.from(rows).map((row, index) => {
      const variable = VAR_LETTERS[index] || `V${index + 1}`;
      const input = row.querySelector(".input-number").value.trim() || "0";
      return `<option value="${variable}">${variable} (${input})</option>`;
    });

    complementMinuendSelect.innerHTML = options.join("");
    complementSubtrahendSelect.innerHTML = options.join("");

    if (options.length > 0) {
      const optionValues = Array.from(complementMinuendSelect.options).map(
        (option) => option.value,
      );
      if (!complementSelectorsInitialized && optionValues.length >= 2) {
        complementMinuendSelect.value = optionValues[0];
        complementSubtrahendSelect.value = optionValues[1];
        complementSelectorsInitialized = true;
      } else {
        complementMinuendSelect.value = optionValues.includes(previousMinuend)
          ? previousMinuend
          : optionValues[0];
        complementSubtrahendSelect.value = optionValues.includes(
          previousSubtrahend,
        )
          ? previousSubtrahend
          : optionValues[Math.min(1, optionValues.length - 1)];
      }
    }
  }

  function renderComplementMatrix(inputsData, bitWidth) {
    const tbody = document.getElementById("complement-matrix-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    inputsData.forEach((data) => {
      const representation = data.rawStr
        ? getComplementRepresentation(data.decimalVal, bitWidth)
        : null;
      const row = document.createElement("tr");

      if (!representation) {
        row.innerHTML = `
          <td><strong>${data.label}</strong></td>
          <td>${data.rawStr || "0"}<span class="subscript">${BASE_SUBSCRIPTS[data.base]}</span></td>
          <td colspan="2">Available for whole-number inputs only</td>`;
      } else {
        const ones = formatComplementBases(
          representation,
          "onesValue",
          "onesBits",
        );
        const twos = formatComplementBases(
          representation,
          "twosValue",
          "twosBits",
        );
        row.innerHTML = `
          <td><strong>${data.label}</strong></td>
          <td>${data.rawStr}<span class="subscript">${BASE_SUBSCRIPTS[data.base]}</span><br><small>${bitWidth}-bit source: ${representation.sourceBits}</small></td>
          <td>${complementCellMarkup(ones)}</td>
          <td>${complementCellMarkup(twos)}</td>`;
      }

      tbody.appendChild(row);
    });
  }

  function decodeComplementValue(value, bitWidth, method) {
    const signBit = 2 ** (bitWidth - 1);
    if (value < signBit) return value;
    if (method === "ones") return -(2 ** bitWidth - 1 - value);
    return -(2 ** bitWidth - value);
  }

  function subtractionRepresentation(value, bitWidth, method) {
    const bits = value.toString(2).padStart(bitWidth, "0");
    return {
      bits,
      octal: convertFromDecimal(value, 8),
      decimal: decodeComplementValue(value, bitWidth, method).toString(),
      hexadecimal: convertFromDecimal(value, 16),
    };
  }

  function renderComplementSubtraction(inputsData, bitWidth) {
    if (
      !complementResult ||
      !complementMinuendSelect ||
      !complementSubtrahendSelect
    )
      return;

    const minuend = inputsData.find(
      (data) => data.variable === complementMinuendSelect.value,
    );
    const subtrahend = inputsData.find(
      (data) => data.variable === complementSubtrahendSelect.value,
    );
    if (
      !minuend ||
      !subtrahend ||
      !Number.isSafeInteger(minuend.decimalVal) ||
      !Number.isSafeInteger(subtrahend.decimalVal)
    ) {
      complementResult.textContent =
        "Complement subtraction requires two whole-number inputs.";
      return;
    }

    const modulus = 2 ** bitWidth;
    const minuendValue = normalizeToBitWidth(minuend.decimalVal, bitWidth);
    const subtrahendValue = normalizeToBitWidth(
      subtrahend.decimalVal,
      bitWidth,
    );
    const onesSubtrahend = modulus - 1 - subtrahendValue;
    const onesRaw = minuendValue + onesSubtrahend;
    const onesCarry = onesRaw >= modulus;
    const onesResult = (onesRaw + (onesCarry ? 1 : 0)) % modulus;
    const twosSubtrahend = (modulus - subtrahendValue) % modulus;
    const twosRaw = minuendValue + twosSubtrahend;
    const twosCarry = twosRaw >= modulus;
    const twosResult = twosRaw % modulus;
    const ones = subtractionRepresentation(onesResult, bitWidth, "ones");
    const twos = subtractionRepresentation(twosResult, bitWidth, "twos");

    complementResult.innerHTML = `
      <strong>${minuend.variable} (${minuend.decimalVal}) − ${subtrahend.variable} (${subtrahend.decimalVal}) using ${bitWidth} bits</strong><br>
      <strong>1's complement:</strong> ${minuendValue.toString(2).padStart(bitWidth, "0")} + ${onesSubtrahend.toString(2).padStart(bitWidth, "0")} ${onesCarry ? "→ end-around carry + 1" : "→ no end-around carry"} = <strong>${ones.bits}</strong>₂ | ${ones.octal}₈ | ${ones.decimal}₁₀ | ${ones.hexadecimal}₁₆<br>
      <strong>2's complement:</strong> ${minuendValue.toString(2).padStart(bitWidth, "0")} + ${twosSubtrahend.toString(2).padStart(bitWidth, "0")} ${twosCarry ? "→ discard carry" : "→ no carry"} = <strong>${twos.bits}</strong>₂ | ${twos.octal}₈ | ${twos.decimal}₁₀ | ${twos.hexadecimal}₁₆`;
  }

  // ==========================================================================
  // 4. MAIN ARITHMETIC CALCULATION & DOM RENDERING
  // ==========================================================================

  function calculateAndRender() {
    const rows = inputsContainer.querySelectorAll(".input-row");
    let allInputsValid = true;
    const inputsData = [];
    const variableMap = {};

    rows.forEach((row, idx) => {
      const isRowValid = validateRow(row);
      if (!isRowValid) allInputsValid = false;

      const inputVal = row.querySelector(".input-number").value.trim();
      const base = parseInt(row.querySelector(".select-base").value, 10);
      const varLetter = VAR_LETTERS[idx] || `V${idx + 1}`;
      const decVal = inputVal ? convertToDecimal(inputVal, base) : 0;

      const rowData = {
        variable: varLetter,
        label: `Input ${idx + 1} (${varLetter})`,
        rawStr: inputVal,
        base: base,
        decimalVal: decVal,
      };

      inputsData.push(rowData);
      variableMap[varLetter] = rowData;
    });

    // If input characters are invalid for their base, halt and show error
    if (!allInputsValid) {
      displayError(
        "Input characters do not match selected number system. Check inputs marked in red.",
      );
      return;
    }

    const complementBitWidth = complementWidthSelect
      ? parseInt(complementWidthSelect.value, 10)
      : 8;
    refreshComplementSelectors();
    renderComplementMatrix(inputsData, complementBitWidth);
    renderComplementSubtraction(inputsData, complementBitWidth);

    const exprStr = customExprInput
      ? customExprInput.value.trim()
      : "(A + B - C) * D";

    try {
      // 1. Tokenize expression
      const tokens = tokenizeExpression(exprStr);

      // 2. Parse Infix to Postfix (RPN) enforcing PEMDAS/BODMAS
      const postfixTokens = infixToPostfix(tokens);

      // 3. Evaluate Postfix Expression
      const evalResult = evaluatePostfixRPN(postfixTokens, variableMap);
      let finalDecimal = evalResult.finalDecimal;

      // Clean small floating-point arithmetic precision anomalies
      finalDecimal = Math.round(finalDecimal * 1e8) / 1e8;

      // Hide error alert
      clearError();

      // Format Expression Display with original symbols and base subscripts (clean plain text)
      const formattedExpressionStr = formatExpressionWithSubscripts(
        exprStr,
        variableMap,
      );
      document.getElementById("expression-display").textContent =
        formattedExpressionStr;

      // Convert final result to all 4 bases
      const finalBin = convertFromDecimal(finalDecimal, 2);
      const finalOct = convertFromDecimal(finalDecimal, 8);
      const finalDec = isNaN(finalDecimal) ? "N/A" : finalDecimal.toString();
      const finalHex = convertFromDecimal(finalDecimal, 16);

      document.getElementById("res-bin").innerText = finalBin;
      document.getElementById("res-oct").innerText = finalOct;
      document.getElementById("res-dec").innerText = finalDec;
      document.getElementById("res-hex").innerText = finalHex;
      document.getElementById("arithmetic-decimal-badge").innerText =
        `Common Decimal = ${finalDec}`;

      // Update Top Metrics
      const topMetricOp = document.getElementById("top-metric-op");
      if (topMetricOp) {
        topMetricOp.innerHTML = `Expr <span class="unit">PEMDAS</span>`;
      }
      const topMetricDecimal = document.getElementById("top-metric-decimal");
      if (topMetricDecimal) {
        topMetricDecimal.innerHTML = `${finalDec} <span class="unit">₁₀</span>`;
      }

      // Build Step-by-Step Calculation Breakdown
      const calcSteps = [];

      calcSteps.push(
        `<strong>STEP 1: Normalize Input Variables to Common Base-10 (Decimal):</strong>`,
      );
      inputsData.forEach((d) => {
        calcSteps.push(
          `  • Variable <strong>${d.variable}</strong> = ${d.rawStr || "0"}${BASE_SUBSCRIPTS[d.base]} → <strong>${d.decimalVal}</strong>₁₀`,
        );
      });

      calcSteps.push(
        `<br><strong>STEP 2: Infix Expression Parsing & Precedence (Shunting-Yard RPN):</strong>`,
      );
      calcSteps.push(`  • Infix Expression: <code>${exprStr}</code>`);
      const rpnDisplay = postfixTokens.map((t) => t.value).join(" ");
      calcSteps.push(
        `  • Postfix (Reverse Polish Notation): <code>${rpnDisplay}</code>`,
      );
      calcSteps.push(
        `  • Precedence Order: Parentheses <code>()</code> evaluated first, then Multiplication <code>×</code> & Division <code>÷</code>, followed by Addition <code>+</code> & Subtraction <code>−</code> (Left-to-Right Associativity).`,
      );

      calcSteps.push(
        `<br><strong>STEP 3: Step-by-Step Sub-Expression Evaluation:</strong>`,
      );
      evalResult.stepLogs.forEach((step) => calcSteps.push(step));
      calcSteps.push(
        `  • Final Decimal Evaluation Result = <strong>${finalDec}</strong>₁₀`,
      );

      calcSteps.push(
        `<br><strong>STEP 4: Convert Evaluated Result (${finalDec}₁₀) to All Number Systems:</strong>`,
      );
      calcSteps.push(`  • Binary (Base 2): <strong>${finalBin}</strong>₂`);
      calcSteps.push(`  • Octal (Base 8): <strong>${finalOct}</strong>₈`);
      calcSteps.push(`  • Decimal (Base 10): <strong>${finalDec}</strong>₁₀`);
      calcSteps.push(
        `  • Hexadecimal (Base 16): <strong>${finalHex}</strong>₁₆`,
      );

      document.getElementById("steps-breakdown").innerHTML =
        calcSteps.join("<br>");

      // Render Individual Conversion Matrix
      renderConversionMatrix(inputsData);
    } catch (err) {
      displayError(err.message);
      document.getElementById("res-bin").innerText = "Error";
      document.getElementById("res-oct").innerText = "Error";
      document.getElementById("res-dec").innerText = "Error";
      document.getElementById("res-hex").innerText = "Error";
      document.getElementById("arithmetic-decimal-badge").innerText =
        `Evaluation Error`;
      document.getElementById("steps-breakdown").innerHTML =
        `<span style="color:#ef4444; font-weight:700;">Evaluation halted due to:</span> ${err.message}`;
    }
  }

  function formatExpressionWithSubscripts(expr, variableMap) {
    // 1. Prettify operator symbols with standard mathematical glyphs and clean spacing
    let result = expr
      .replace(/\*/g, " × ")
      .replace(/\//g, " ÷ ")
      .replace(/\+/g, " + ")
      .replace(/-/g, " − ");

    // 2. Substitute variables with their raw numbers and base subscripts (no HTML tags)
    Object.keys(variableMap).forEach((v) => {
      const data = variableMap[v];
      const sub = BASE_SUBSCRIPTS[data.base] || "";
      const replacement = `${data.rawStr || "0"}${sub}`;
      const reg = new RegExp(`\\b${v}\\b`, "g");
      result = result.replace(reg, replacement);
    });

    return result;
  }

  function displayError(msg) {
    if (errorBanner && errorMsgEl) {
      errorMsgEl.innerText = msg;
      errorBanner.classList.add("active");
    }
    if (customExprInput) {
      customExprInput.classList.add("invalid");
    }
  }

  function clearError() {
    if (errorBanner) {
      errorBanner.classList.remove("active");
    }
    if (customExprInput) {
      customExprInput.classList.remove("invalid");
    }
  }

  function renderConversionMatrix(inputsData) {
    const tbody = document.getElementById("conversion-matrix-tbody");
    tbody.innerHTML = "";

    inputsData.forEach((d) => {
      const dec = d.decimalVal;
      const bin = convertFromDecimal(dec, 2);
      const oct = convertFromDecimal(dec, 8);
      const decStr = dec.toString();
      const hex = convertFromDecimal(dec, 16);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${d.label}</strong></td>
        <td>${d.rawStr || "0"}<span class="subscript">${BASE_SUBSCRIPTS[d.base]}</span></td>
        <td>${bin}₂</td>
        <td>${oct}₈</td>
        <td>${decStr}₁₀</td>
        <td>${hex}₁₆</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ==========================================================================
  // 5. EVENT LISTENERS & UI NAVIGATION
  // ==========================================================================

  // Formula Input Listeners
  if (customExprInput) {
    customExprInput.addEventListener("input", () => calculateAndRender());
    customExprInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        calculateAndRender();
        showToast("Expression evaluated.", "success");
      }
    });
  }

  // Evaluate Button
  if (btnCalculate) {
    btnCalculate.addEventListener("click", () => {
      calculateAndRender();
      showToast("Expression evaluated successfully.", "success");
    });
  }

  // Keypad Static Action Buttons
  document.querySelectorAll(".keypad-group .key-btn").forEach((btn) => {
    const token = btn.getAttribute("data-token");
    if (token) {
      btn.addEventListener("click", () => insertTokenAtCursor(token));
    }
  });

  const btnBackspace = document.getElementById("btn-expr-backspace");
  if (btnBackspace) {
    btnBackspace.addEventListener("click", () => {
      if (!customExprInput) return;
      const startPos = customExprInput.selectionStart;
      const endPos = customExprInput.selectionEnd;
      const val = customExprInput.value;

      if (startPos > 0 && startPos === endPos) {
        customExprInput.value =
          val.substring(0, startPos - 1) + val.substring(endPos);
        customExprInput.selectionStart = customExprInput.selectionEnd =
          startPos - 1;
      } else if (startPos !== endPos) {
        customExprInput.value =
          val.substring(0, startPos) + val.substring(endPos);
        customExprInput.selectionStart = customExprInput.selectionEnd =
          startPos;
      }
      customExprInput.focus();
      calculateAndRender();
    });
  }

  const btnClearExpr = document.getElementById("btn-expr-clear");
  if (btnClearExpr) {
    btnClearExpr.addEventListener("click", () => {
      if (customExprInput) {
        customExprInput.value = "";
        customExprInput.focus();
        calculateAndRender();
      }
    });
  }

  if (complementWidthSelect) {
    complementWidthSelect.addEventListener("change", () =>
      calculateAndRender(),
    );
  }

  if (complementMinuendSelect) {
    complementMinuendSelect.addEventListener("change", () =>
      calculateAndRender(),
    );
  }

  if (complementSubtrahendSelect) {
    complementSubtrahendSelect.addEventListener("change", () =>
      calculateAndRender(),
    );
  }

  if (complementSubtractionButton) {
    complementSubtractionButton.addEventListener("click", () => {
      calculateAndRender();
      showToast("Complement subtraction evaluated.", "success");
    });
  }

  // Add Input Buttons
  if (btnAddInput) {
    btnAddInput.addEventListener("click", () => {
      createInputRow("", 10);
      showToast("Added new input field.", "info");
    });
  }

  if (btnAddInputFloat) {
    btnAddInputFloat.addEventListener("click", () => {
      createInputRow("", 10);
      showToast("Added new input field.", "info");
    });
  }

  // Reset Inputs Button
  if (btnResetInputs) {
    btnResetInputs.addEventListener("click", () => {
      resetToDefaultInputs();
      showToast("Reset inputs to default scenario.", "info");
    });
  }

  // Header Calculator Icon
  const btnTopCalcIcon = document.getElementById("btn-top-calc-icon");
  if (btnTopCalcIcon) {
    btnTopCalcIcon.addEventListener("click", () => {
      tabButtons[0].click();
    });
  }

  // Dock Buttons
  const dockBtnCalc = document.getElementById("dock-btn-calc");
  if (dockBtnCalc) {
    dockBtnCalc.addEventListener("click", () => {
      calculateAndRender();
      showToast("Expression evaluated.", "success");
    });
  }

  // Navigation Tabs
  tabButtons.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-tab");

      tabButtons.forEach((t) => t.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // Preset Loaders (Including bottom dock and presets tab)
  document.querySelectorAll(".btn-load-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-preset");
      const preset = PRESETS[key];

      if (preset) {
        inputsContainer.innerHTML = "";
        inputRowsCount = 0;

        preset.inputs.forEach((inp) => {
          createInputRow(inp.value, inp.base);
        });

        // Set Expression
        if (customExprInput) {
          customExprInput.value = preset.expression;
        }

        // Switch to Workbench Tab
        tabButtons[0].click();
        calculateAndRender();
        showToast(`Loaded Preset: ${preset.expression}`, "info");
      }
    });
  });

  // Category Pills
  const categoryPills = document.querySelectorAll(".category-pill");
  categoryPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      categoryPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      tabButtons[0].click();
    });
  });

  // Toast Notification Helper
  function showToast(msg, type = "info") {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    let icon = "fa-info-circle";
    if (type === "error") icon = "fa-circle-exclamation";
    if (type === "success") icon = "fa-circle-check";
    if (type === "warning") icon = "fa-triangle-exclamation";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  // Initial Startup
  resetToDefaultInputs();
});
