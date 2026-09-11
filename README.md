# Activity No. 1: System Development Activity
## Number System Converter and Arithmetic Calculator System

A comprehensive, interactive web application and documentation system built for **System Development Activity No. 1**. This application performs multi-base number system conversions (Binary, Octal, Decimal, Hexadecimal) and evaluates multi-input arithmetic operations with step-by-step mathematical breakdowns.

---

##  Key Features

1. **Dynamic Multi-Base Input Workbench**
   - Supports 3 or more dynamic input fields (Add/Remove inputs dynamically).
   - Independent base selection for *each* input number: **Binary (Base 2)**, **Octal (Base 8)**, **Decimal (Base 10)**, and **Hexadecimal (Base 16)**.
   - Real-time digit validation per selected base (e.g., flags digits `2-9` in binary or `8-9` in octal).
   - Full support for both integer and fractional / floating-point numbers (e.g. `1010.11₂`, `17.4₈`, `3A.F₁₆`).

2. **Individual Base Conversion Matrix**
   - Instant conversion of each individual input number into all 4 bases.
   - Step-by-step mathematical expansion visualizer (showing positional integer powers and radix fraction multiplications).

3. **Mixed-Base Arithmetic Calculator**
   - Supports **Addition (+)**, **Subtraction (-)**, **Multiplication (*)**, and **Division (/)**.
   - Converts input values into a common Base-10 representation before evaluation.
   - Displays the formatted arithmetic expression using original input symbols and base subscripts (e.g., `1010.1₂ + 17₈ * 3A.F₁₆`).
   - Outputs the final calculation result in **Binary**, **Octal**, **Decimal**, and **Hexadecimal**.
   - Detailed calculation breakdown log showing intermediate decimal steps and final back-conversions.

4. **Academic Documentation & Test Suite**
   - **System Requirements**: Functional & non-functional requirements specification.
   - **Algorithm & Pseudocode**: Formal algorithms for input validation, base conversion, and multi-operand arithmetic.
   - **Flowchart Visualizer**: SVG diagram illustrating system workflow and decision logic.
   - **Program Implementation**: Mathematical specs and data structures.
   - **Interactive Test Case Presets**: One-click test runners for required base combinations:
     - `Binary + Octal + Decimal`
     - `Binary + Decimal + Hexadecimal`
     - `Octal + Decimal + Hexadecimal`
     - `Binary + Octal + Hexadecimal`
     - Covers Addition, Subtraction, Multiplication, and Division scenarios.

---

#### Runtime & Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **HTML5** | — | Application markup and structure |
| **CSS3** | — | Glassmorphic dark-theme styling, CSS Variables, Responsive Grid |
| **JavaScript** | — | Conversion algorithms, expression engine, dynamic UI |
| **Font Awesome** | — | UI icons (loaded via CDN) |

---

### Functional Requirements

| ID | Requirement | Description | Status |
|----|------------|-------------|--------|
| FR-01 | Dynamic Input Control | Accept at least 3 input numbers with the ability to add or remove inputs dynamically. | ✅ Implemented |
| FR-02 | Multi-Base Selection | Allow independent base selection per input: Binary, Octal, Decimal, Hexadecimal. | ✅ Implemented |
| FR-03 | Input Validation | Validate digits of each input against its selected base (e.g., reject digits `8`/`9` in Octal). | ✅ Implemented |
| FR-04 | Individual Conversions | Convert each input number to all 4 bases (Binary, Octal, Decimal, Hexadecimal). | ✅ Implemented |
| FR-05 | Mixed-Base Arithmetic | Perform `+`, `-`, `*`, `/` operations across inputs of different number bases. | ✅ Implemented |
| FR-06 | Common Representation | Normalize all inputs to Base-10 (Decimal) before executing arithmetic. | ✅ Implemented |
| FR-07 | Expression Display | Render the arithmetic expression with original symbols and base subscript notation. | ✅ Implemented |
| FR-08 | Multi-Base Results | Output the final result in Binary, Octal, Decimal, and Hexadecimal. | ✅ Implemented |
| FR-09 | Parenthesized Expressions | Support arbitrary expressions with mixed operators and parentheses, e.g. `(A + B - C) * D`. | ✅ Implemented |
| FR-10 | Operator Precedence | Enforce PEMDAS/BODMAS: `*` and `/` evaluated before `+` and `-`, with left-to-right associativity. | ✅ Implemented |
| FR-11 | Error Trapping | Detect and report: division by zero, mismatched parentheses, illegal operator combinations, and undefined variables. | ✅ Implemented |

---


##  How to Run

1. Clone or download the project folder:
   ```
   C:\Users\<YourUsername>\Documents\PROJECTS\number-system-converter
   ```
2. Double-click `index.html` or open it directly in any modern browser.
3. Use the **Converter & Calculator** tab to enter custom values, change bases, and select arithmetic operations.
4. Click **Test Cases & Presets** to run pre-configured test scenarios for your activity report.

---

##  Project Structure

```
number-system-converter/
├── index.html       # Main application markup & tabbed academic documentation
├── styles.css       # Premium dark glassmorphic styling & print rules
├── script.js        # Converter algorithms, dynamic UI logic & test case runner
└── README.md        # Comprehensive activity documentation & project overview
```

---

##  Academic Activity Specifications Checklist

- [x] Accept at least 3 dynamic input numbers.
- [x] Allow base selection for each input (Binary, Octal, Decimal, Hexadecimal).
- [x] Validate inputs based on selected number system.
- [x] Display individual conversion results for each input across all 4 bases.
- [x] Support arithmetic operations: Addition (+), Subtraction (-), Multiplication (*), Division (/).
- [x] Normalize values to common Base-10 before performing arithmetic.
- [x] Display arithmetic expression using original inputs with base subscripts.
- [x] Output final result in Binary, Octal, Decimal, and Hexadecimal.
- [x] Include System Requirements, Algorithm/Pseudocode, Flowchart, Program Implementation, Test Cases, and Sample Outputs.
- [x] Test combinations of Binary+Octal+Decimal, Binary+Decimal+Hex, Octal+Decimal+Hex, Binary+Octal+Hex across +, -, *, /.
