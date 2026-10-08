// ระบบบันทึกรายรับรายจ่าย
const STORAGE_KEY = "expense-tracker-entries";

let entries = loadEntries();
let currentFilter = "all";

const form = document.getElementById("entryForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");

dateInput.value = new Date().toISOString().slice(0, 10);

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatMoney(n) {
  return "฿" + n.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function updateSummary() {
  const income = entries
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);
  const expense = entries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  document.getElementById("totalIncome").textContent = formatMoney(income);
  document.getElementById("totalExpense").textContent = formatMoney(expense);
  document.getElementById("balance").textContent = formatMoney(income - expense);
}

function render() {
  listEl.innerHTML = "";

  const shown = entries
    .filter((e) => currentFilter === "all" || e.type === currentFilter)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  emptyEl.style.display = shown.length === 0 ? "block" : "none";

  shown.forEach((e) => {
    const li = document.createElement("li");

    const dot = document.createElement("span");
    dot.className = "dot " + e.type;

    const info = document.createElement("div");
    info.className = "info";
    const name = document.createElement("b");
    name.textContent = e.title; // ใช้ textContent ป้องกันการแทรก HTML
    const date = document.createElement("small");
    date.textContent = formatDate(e.date);
    info.append(name, date);

    const amt = document.createElement("span");
    amt.className = "amt " + e.type;
    amt.textContent = (e.type === "income" ? "+" : "−") + formatMoney(e.amount);

    const del = document.createElement("button");
    del.className = "del";
    del.setAttribute("aria-label", "ลบรายการ " + e.title);
    del.textContent = "×";
    del.addEventListener("click", () => deleteEntry(e.id));

    li.append(dot, info, amt, del);
    listEl.appendChild(li);
  });

  updateSummary();
}

function addEntry(event) {
  event.preventDefault();

  const amount = parseFloat(amountInput.value);
  const title = titleInput.value.trim();
  if (!title || !(amount > 0)) return;

  entries.push({
    id: Date.now(),
    type: form.elements["type"].value,
    title: title,
    amount: amount,
    date: dateInput.value,
  });

  saveEntries();
  render();

  titleInput.value = "";
  amountInput.value = "";
  titleInput.focus();
}

function deleteEntry(id) {
  entries = entries.filter((e) => e.id !== id);
  saveEntries();
  render();
}

form.addEventListener("submit", addEntry);

document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

document.getElementById("clearAll").addEventListener("click", () => {
  if (entries.length && confirm("ต้องการลบรายการทั้งหมดใช่ไหม?")) {
    entries = [];
    saveEntries();
    render();
  }
});

render();
