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

function formatNumber(n) {
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toPrecision(12)));
}

function updateDisplay() {
  numberList.innerHTML = "";
  if (!numbers.length) {
    numberList.innerHTML = '<p class="empty">No numbers entered yet.</p>';
  } else {
    numbers.forEach((number, index) => {
      const item = document.createElement("div");
      item.className = "number-item";
      const value = document.createElement("span");
      value.textContent = formatNumber(number);
      const remove = document.createElement("button");
      remove.className = "remove-button";
      remove.textContent = "×";
      remove.title = "Remove this number";
      remove.onclick = () => {
        numbers.splice(index, 1);
        selected = selected.filter(n => n !== number);
        updateDisplay();
      };
      item.append(value, remove);
      numberList.appendChild(item);
    });
  }
  count.textContent = `${numbers.length} ${numbers.length === 1 ? "number" : "numbers"}`;
  drawNumberLine();
  updateAnalysis();
}

function addNumber() {
  const value = numberInput.value.trim();
  if (value === "") { error.textContent = "Please enter a number."; return; }
  const n = Number(value);
  if (!Number.isFinite(n)) { error.textContent = "Please enter a valid real number."; return; }
  numbers.push(n);
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

  const min = Math.min(0, ...numbers);
  const max = Math.max(0, ...numbers);
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

  numbers.forEach(n => {
    const pct = ((n - low) / (high - low)) * 100;
    const point = document.createElement("div");
    point.className = "number-point";
    if (selected.includes(n)) point.classList.add("selected");
    point.style.left = `${pct}%`;
    point.title = "Click to select";
    point.innerHTML = `<div class="point-dot"></div><div class="point-label">${formatNumber(n)}</div>`;
    point.onclick = () => selectNumber(n);
    line.appendChild(point);
  });
}

function selectNumber(n) {
  // Clicking the same value twice does not create a duplicate selection.
  if (selected.length === 0) {
    selected = [n];
  } else if (selected.length === 1) {
    if (selected[0] === n) return;
    selected.push(n);
  } else {
    selected = [n];
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
  firstSelected.textContent = formatNumber(selected[0]);

  if (selected.length === 1) {
    secondSelected.textContent = "—";
    result.innerHTML = "<p>Select one more point to compare the numbers and calculate their distance.</p>";
    return;
  }

  const a = selected[0];
  const b = selected[1];
  secondSelected.textContent = formatNumber(b);

  let comparison;
  let symbol;
  if (a < b) { comparison = `${formatNumber(a)} is less than ${formatNumber(b)}`; symbol = "<"; }
  else if (a > b) { comparison = `${formatNumber(a)} is greater than ${formatNumber(b)}`; symbol = ">"; }
  else { comparison = `${formatNumber(a)} is equal to ${formatNumber(b)}`; symbol = "="; }

  const distance = Math.abs(a - b);
  result.innerHTML = `
    <p class="result-main">${formatNumber(a)} ${symbol} ${formatNumber(b)}</p>
    <p class="result-detail">Distance: <strong>|${formatNumber(a)} − ${formatNumber(b)}| = ${formatNumber(distance)}</strong></p>
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

addButton.onclick = addNumber;
numberInput.onkeydown = e => { if (e.key === "Enter") addNumber(); };
clearButton.onclick = () => {
  numbers = [];
  selected = [];
  error.textContent = "";
  updateDisplay();
  numberInput.focus();
};

updateDisplay();


// Information sidebar
// Edit this section to change what appears in the sidebar.
const sidebarInfo = {
  title: "Real Number and Number Line",
  sections: [
    {
      heading: "MODULE 2 GROUP - BSCS 2A",
      text: "Math 12"
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
