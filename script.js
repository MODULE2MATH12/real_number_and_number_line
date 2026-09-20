const numberInput = document.getElementById("numberInput");
const addButton = document.getElementById("addButton");
const clearButton = document.getElementById("clearButton");
const numberList = document.getElementById("numberList");
const count = document.getElementById("count");
const error = document.getElementById("error");
const lineSection = document.getElementById("numberLineSection");
const line = document.getElementById("numberLine");
const analysisSection = document.getElementById("analysisSection");
const firstSelected = document.getElementById("firstSelected");
const secondSelected = document.getElementById("secondSelected");
const result = document.getElementById("result");

let numbers = [];
let selected = [];

function parseNumberInput(text) {
  const value = text.trim();

  if (value === "") return null;

  const mixedMatch = value.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numerator = Number(mixedMatch[2]);
    const denominator = Number(mixedMatch[3]);

    if (denominator === 0 || numerator >= denominator) return null;

    const sign = whole < 0 ? -1 : 1;
    return whole + sign * (numerator / denominator);
  }

  // Simple fraction: "1/2", "-3/4"
  const fractionMatch = value.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);

    if (denominator === 0) return null;
    return numerator / denominator;
  }

  // Normal integer or decimal.
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(value)) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  return null;
}

function formatNumber(n) {
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toPrecision(12)));
}

function formatInputValue(item) {
  return item.label;
}

function updateDisplay() {
  numberList.innerHTML = "";

  if (!numbers.length) {
    numberList.innerHTML = '<p class="empty">No numbers entered yet.</p>';
  } else {
    numbers.forEach((item, index) => {
      const element = document.createElement("div");
      element.className = "number-item";

      const value = document.createElement("span");
      value.textContent = formatInputValue(item);

      const remove = document.createElement("button");
      remove.className = "remove-button";
      remove.textContent = "×";
      remove.title = "Remove this number";

      remove.onclick = () => {
        const removed = numbers[index];
        numbers.splice(index, 1);
        selected = selected.filter(item => item !== removed);
        updateDisplay();
      };

      element.append(value, remove);
      numberList.appendChild(element);
    });
  }

  count.textContent = `${numbers.length} ${numbers.length === 1 ? "number" : "numbers"}`;
  drawNumberLine();
  updateAnalysis();
}

function addNumber() {
  const inputValue = numberInput.value.trim();

  if (inputValue === "") {
    error.textContent = "Please enter a number or fraction.";
    numberInput.focus();
    return;
  }

  const numericValue = parseNumberInput(inputValue);

  if (numericValue === null || !Number.isFinite(numericValue)) {
    error.textContent = "Use a number like 2.5, a fraction like 1/2, or a mixed number like 2 1/3.";
    numberInput.focus();
    return;
  }

  numbers.push({
    value: numericValue,
    label: inputValue
  });

  numberInput.value = "";
  error.textContent = "";
  updateDisplay();
  numberInput.focus();
}

function drawNumberLine() {
  line.innerHTML = "";

  if (!numbers.length) {
    lineSection.classList.add("hidden");
    analysisSection.classList.add("hidden");
    return;
  }

  lineSection.classList.remove("hidden");

  const values = numbers.map(item => item.value);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = max - min || 1;
  const padding = range * 0.12;
  const low = min - padding;
  const high = max + padding;
  const step = niceStep(range / 8);
  const first = Math.ceil(low / step) * step;

  for (let x = first; x <= high + step * 0.001; x += step) {
    const pct = ((x - low) / (high - low)) * 100;
    const tick = document.createElement("div");
    tick.className = "tick";
    tick.style.left = `${pct}%`;
    tick.innerHTML = `<span>${formatTick(x)}</span>`;
    line.appendChild(tick);
  }

  const zeroPct = ((0 - low) / (high - low)) * 100;
  const zero = document.createElement("div");
  zero.className = "zero-tick";
  zero.style.left = `${zeroPct}%`;
  zero.innerHTML = `<span>0</span>`;
  line.appendChild(zero);

  numbers.forEach(item => {
    const pct = ((item.value - low) / (high - low)) * 100;
    const point = document.createElement("div");
    point.className = "number-point";

    if (selected.includes(item)) point.classList.add("selected");

    point.style.left = `${pct}%`;
    point.title = `Select ${item.label}`;
    point.innerHTML = `
      <div class="point-dot"></div>
      <div class="point-label">${escapeHtml(item.label)}</div>
    `;

    point.onclick = () => selectNumber(item);
    line.appendChild(point);
  });
}

function selectNumber(item) {
  if (selected.length === 0) {
    selected = [item];
  } else if (selected.length === 1) {
    if (selected[0] === item) return;
    selected.push(item);
  } else {
    selected = [item];
  }

  drawNumberLine();
  updateAnalysis();
}

function updateAnalysis() {
  if (selected.length === 0) {
    analysisSection.classList.add("hidden");
    return;
  }

  analysisSection.classList.remove("hidden");
  firstSelected.textContent = selected[0].label;

  if (selected.length === 1) {
    secondSelected.textContent = "—";
    result.innerHTML = "<p>Select one more point to compare the numbers and calculate their distance.</p>";
    return;
  }

  const a = selected[0];
  const b = selected[1];

  secondSelected.textContent = b.label;

  let symbol;
  if (a.value < b.value) {
    symbol = "<";
  } else if (a.value > b.value) {
    symbol = ">";
  } else {
    symbol = "=";
  }

  const distance = Math.abs(a.value - b.value);

  result.innerHTML = `
    <p class="result-main">${escapeHtml(a.label)} ${symbol} ${escapeHtml(b.label)}</p>
    <p class="result-detail">
      Distance: <strong>|${escapeHtml(a.label)} − ${escapeHtml(b.label)}| = ${formatNumber(distance)}</strong>
    </p>
  `;
}

function niceStep(raw) {
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const scaled = raw / power;
  const nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return nice * power;
}

function formatTick(n) {
  return Math.abs(n) < 1e-9 ? "0" : formatNumber(n);
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

addButton.onclick = addNumber;

numberInput.onkeydown = event => {
  if (event.key === "Enter") addNumber();
};

clearButton.onclick = () => {
  numbers = [];
  selected = [];
  error.textContent = "";
  updateDisplay();
  numberInput.focus();
};

updateDisplay();

const sidebarInfo = {
  title: "Number Line Plotter",
  sections: [
    {
      heading: "MODULE 2 GROUP - BSCS 2A",
      text: "Subject - Math 12"
    },
    {
      heading: "Authors / Group",
      text: "Ancino, Jolo Jan | Bacalso, Mary Faith | Coronado, Christine Divine | Flores, John Jievol | Geloryao, Rufyn Rose | Jovero, Angeline Mae | Noveros, Altea | Valdez, Kurt Airho"
    }
  ]
};

function renderSidebarInfo() {
  document.getElementById("infoTitle").textContent = sidebarInfo.title;
  const content = document.getElementById("infoContent");
  content.innerHTML = "";

  sidebarInfo.sections.forEach(section => {
    const block = document.createElement("section");
    block.className = "info-block";

    const heading = document.createElement("h3");
    heading.textContent = section.heading;

    const text = document.createElement("p");
    text.textContent = section.text;

    block.append(heading, text);
    content.appendChild(block);
  });
}

renderSidebarInfo();
