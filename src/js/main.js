const webhookUrlInput = document.getElementById("webhook-url");
const deleteBtn = document.getElementById("delete-btn");
const copyBtn = document.getElementById("copy-btn");
const statusContainer = document.getElementById("status-container");

const batchInput = document.getElementById("batch-webhook-url");
const addWebhookBtn = document.getElementById("add-webhook-btn");
const webhookList = document.getElementById("webhook-list");
const deleteAllBtn = document.getElementById("delete-all-btn");

const themeToggleBtn = document.getElementById("theme-toggle");
const darkIcon = document.getElementById("theme-toggle-dark-icon");
const lightIcon = document.getElementById("theme-toggle-light-icon");

let webhookArray = [];

function showStatus(message, type = "info") {
  const div = document.createElement("div");
  div.className = `px-4 py-3 rounded-lg shadow-md ${
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
      ? "bg-red-500 text-white"
      : "bg-gray-700 text-white"
  }`;
  div.textContent = message;
  statusContainer.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

async function deleteWebhook(url) {
  try {
    const response = await fetch(url, { method: "DELETE" });
    if (response.ok) {
      showStatus("Webhook deleted successfully", "success");
    } else {
      showStatus("Failed to delete webhook", "error");
    }
  } catch {
    showStatus("Invalid webhook URL", "error");
  }
}

deleteBtn.addEventListener("click", () => {
  const url = webhookUrlInput.value.trim();
  if (url) deleteWebhook(url);
  else showStatus("Please enter a webhook URL", "error");
});

copyBtn.addEventListener("click", () => {
  if (webhookUrlInput.value) {
    navigator.clipboard.writeText(webhookUrlInput.value);
    showStatus("Webhook URL copied to clipboard", "success");
  } else {
    showStatus("Nothing to copy", "error");
  }
});

addWebhookBtn.addEventListener("click", () => {
  const url = batchInput.value.trim();
  if (url) {
    webhookArray.push(url);
    const div = document.createElement("div");
    div.className =
      "flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-lg";
    div.innerHTML = `
      <span class="truncate flex-1 mr-2 text-sm text-gray-800 dark:text-gray-200">${url}</span>
      <button class="text-red-500 hover:text-red-700 remove-btn">Remove</button>
    `;
    webhookList.appendChild(div);
    batchInput.value = "";
    deleteAllBtn.disabled = false;

    div.querySelector(".remove-btn").addEventListener("click", () => {
      webhookArray = webhookArray.filter((item) => item !== url);
      div.remove();
      if (webhookArray.length === 0) deleteAllBtn.disabled = true;
    });
  } else {
    showStatus("Please enter a webhook URL", "error");
  }
});

deleteAllBtn.addEventListener("click", async () => {
  if (webhookArray.length === 0) {
    showStatus("No webhooks to delete", "error");
    return;
  }
  for (const url of webhookArray) {
    await deleteWebhook(url);
  }
  webhookArray = [];
  webhookList.innerHTML = "";
  deleteAllBtn.disabled = true;
});

function updateThemeIcons() {
  if (document.documentElement.classList.contains("dark")) {
    darkIcon.classList.add("hidden");
    lightIcon.classList.remove("hidden");
  } else {
    darkIcon.classList.remove("hidden");
    lightIcon.classList.add("hidden");
  }
}

themeToggleBtn.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  updateThemeIcons();
  if (document.documentElement.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

if (
  localStorage.getItem("theme") === "dark" ||
  (!localStorage.getItem("theme") &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}
updateThemeIcons();
