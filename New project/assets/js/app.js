const STORAGE_KEY = "expense-log-items";

const expenseForm = document.getElementById("expenseForm");
const expenseTableBody = document.getElementById("expenseTableBody");
const totalAmount = document.getElementById("totalAmount");
const entryCount = document.getElementById("entryCount");
const exportButton = document.getElementById("exportButton");
const clearAllButton = document.getElementById("clearAllButton");
const dateInput = document.getElementById("date");

dateInput.value = getToday();

let expenses = loadExpenses();
renderExpenses();

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(expenseForm);
  const rawAmount = Number(formData.get("amount"));

  const expense = {
    id: createId(),
    title: String(formData.get("title") || "").trim(),
    amount: Number.isFinite(rawAmount) ? rawAmount : 0,
    category: String(formData.get("category") || "").trim(),
    date: String(formData.get("date") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  };

  if (!expense.title || expense.amount <= 0 || !expense.date) {
    window.alert("Please complete title, amount, and date.");
    return;
  }

  expenses = [expense, ...expenses];
  saveExpenses();
  renderExpenses();

  expenseForm.reset();
  dateInput.value = getToday();
});

exportButton.addEventListener("click", () => {
  if (!expenses.length) {
    window.alert("Add at least one expense before exporting.");
    return;
  }

  const header = ["Title", "Amount", "Category", "Date", "Notes"];
  const rows = expenses.map((expense) => [
    expense.title,
    expense.amount.toFixed(2),
    expense.category,
    expense.date,
    expense.notes,
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `expenses-${getToday()}.csv`;
  link.click();

  URL.revokeObjectURL(url);
});

clearAllButton.addEventListener("click", () => {
  if (!expenses.length) {
    return;
  }

  if (!window.confirm("Delete all expenses?")) {
    return;
  }

  expenses = [];
  saveExpenses();
  renderExpenses();
});

function renderExpenses() {
  if (!expenses.length) {
    expenseTableBody.innerHTML =
      '<tr><td colspan="6" class="empty-state">No expenses yet.</td></tr>';
  } else {
    expenseTableBody.innerHTML = expenses
      .map(
        (expense) => `
          <tr>
            <td>${escapeHtml(expense.title)}</td>
            <td>${formatCurrency(expense.amount)}</td>
            <td>${escapeHtml(expense.category)}</td>
            <td>${escapeHtml(expense.date)}</td>
            <td>${escapeHtml(expense.notes || "-")}</td>
            <td>
              <button class="delete-button" type="button" data-id="${expense.id}">
                Delete
              </button>
            </td>
          </tr>
        `
      )
      .join("");
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalAmount.textContent = formatCurrency(total);
  entryCount.textContent = String(expenses.length);

  document.querySelectorAll("[data-id]").forEach((button) => {
    button.addEventListener("click", () => deleteExpense(button.dataset.id));
  });
}

function deleteExpense(id) {
  expenses = expenses.filter((expense) => expense.id !== id);
  saveExpenses();
  renderExpenses();
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function loadExpenses() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Could not read saved expenses.", error);
    return [];
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function csvValue(value) {
  const text = String(value ?? "");
  if (text.includes('"') || text.includes(",") || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function createId() {
  return globalThis.crypto && globalThis.crypto.randomUUID
    ? globalThis.crypto.randomUUID()
    : `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
