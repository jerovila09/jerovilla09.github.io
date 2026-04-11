const STORAGE_KEY = "expense-tracker-items";

const expenseForm = document.getElementById("expenseForm");
const expenseTableBody = document.getElementById("expenseTableBody");
const totalAmount = document.getElementById("totalAmount");
const entryCount = document.getElementById("entryCount");
const exportButton = document.getElementById("exportButton");
const clearAllButton = document.getElementById("clearAllButton");
const dateInput = document.getElementById("date");

dateInput.value = new Date().toISOString().split("T")[0];

let expenses = loadExpenses();

renderExpenses();

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(expenseForm);
  const amountValue = Number(formData.get("amount"));

  const expense = {
    id: crypto.randomUUID(),
    title: String(formData.get("title")).trim(),
    amount: Number.isFinite(amountValue) ? amountValue : 0,
    category: String(formData.get("category")).trim(),
    date: String(formData.get("date")).trim(),
    notes: String(formData.get("notes")).trim(),
  };

  if (!expense.title || expense.amount <= 0 || !expense.date) {
    window.alert("Please complete the title, amount, and date fields.");
    return;
  }

  expenses = [expense, ...expenses];
  persistExpenses();
  renderExpenses();

  expenseForm.reset();
  dateInput.value = new Date().toISOString().split("T")[0];
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

  const csvContent = [header, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
});

clearAllButton.addEventListener("click", () => {
  if (!expenses.length) {
    return;
  }

  const confirmed = window.confirm("Delete all saved expenses?");
  if (!confirmed) {
    return;
  }

  expenses = [];
  persistExpenses();
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
            <td>$${expense.amount.toFixed(2)}</td>
            <td>${escapeHtml(expense.category)}</td>
            <td>${escapeHtml(expense.date)}</td>
            <td>${escapeHtml(expense.notes || "-")}</td>
            <td>
              <button class="delete-button" type="button" data-id="${expense.id}">
                Delete
              </button>
            </td>
          </tr>
        `,
      )
      .join("");
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalAmount.textContent = formatCurrency(total);
  entryCount.textContent = String(expenses.length);

  document.querySelectorAll("[data-id]").forEach((button) => {
    button.addEventListener("click", () => removeExpense(button.dataset.id));
  });
}

function removeExpense(id) {
  expenses = expenses.filter((expense) => expense.id !== id);
  persistExpenses();
  renderExpenses();
}

function persistExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function loadExpenses() {
  try {
    const rawExpenses = localStorage.getItem(STORAGE_KEY);
    return rawExpenses ? JSON.parse(rawExpenses) : [];
  } catch (error) {
    console.error("Could not load expenses", error);
    return [];
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function escapeCsvValue(value) {
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
