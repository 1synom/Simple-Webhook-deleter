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
    type === "success" ? "bg-green-500 text-white" :
    type === "error" ? "bg-red-500 text-white" :
    "bg-gray-700 text-white"
  } transition-opacity duration-500`;
  div.textContent = message;
  statusContainer.appendChild(div);
  setTimeout(() => {
    div.classList.add("opacity-0");
    setTimeout(() => div.remove(), 500);
  }, 4000);
}

function isDiscordWebhook(url) {
  return /^https:\/\/(ptb\.|canary\.)?discord\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(url);
}

async function deleteWebhook(url) {
  if (!isDiscordWebhook(url)) return showStatus("Invalid Discord webhook URL", "error");
  try {
    const response = await fetch(url, { method: "DELETE" });
    if (response.ok) {
      showStatus("Webhook deleted successfully", "success");
    } else {
      let message = `Failed to delete webhook: ${response.status}`;
      try {
        const data = await response.json().catch(() => ({}));
        if (data.message) message += ` - ${data.message}`;
      } catch {}
      showStatus(message, "error");
    }
  } catch {
    showStatus("Failed to delete webhook", "error");
  }
}

deleteBtn.addEventListener("click", () => {
  const url = webhookUrlInput.value.trim();
  if (url) deleteWebhook(url);
  else showStatus("Please enter a webhook URL", "error");
});

copyBtn.addEventListener("click", async () => {
  if (!webhookUrlInput.value) return showStatus("Nothing to copy", "error");
  try {
    await navigator.clipboard.writeText(webhookUrlInput.value);
    showStatus("Webhook URL copied to clipboard", "success");
  } catch {
    showStatus("Failed to copy URL", "error");
  }
});

addWebhookBtn.addEventListener("click", () => {
  const url = batchInput.value.trim();
  if (!url) return showStatus("Please enter a webhook URL", "error");
  if (!isDiscordWebhook(url)) return showStatus("Invalid Discord webhook URL", "error");

  const normalizedUrl = url.toLowerCase();
  if (webhookArray.map(u => u.toLowerCase()).includes(normalizedUrl)) 
    return showStatus("Webhook already added", "error");

  webhookArray.push(url);

  const div = document.createElement("div");
  div.className = "flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-lg overflow-hidden w-full";
  div.innerHTML = `
    <span class="flex-1 mr-0 sm:mr-2 text-sm text-gray-800 dark:text-gray-200 max-w-full break-words">${url}</span>
    <button class="text-red-500 hover:text-red-700 remove-btn flex-shrink-0">Remove</button>
  `;
  webhookList.appendChild(div);
  batchInput.value = "";
  deleteAllBtn.disabled = false;

  div.querySelector(".remove-btn").addEventListener("click", () => {
    webhookArray = webhookArray.filter(item => item !== url);
    div.remove();
    if (!webhookArray.length) deleteAllBtn.disabled = true;
  });
});

deleteAllBtn.addEventListener("click", async () => {
  if (!webhookArray.length) return showStatus("No webhooks to delete", "error");
  
  await Promise.all(webhookArray.map(url => deleteWebhook(url)));

  webhookArray = [];
  webhookList.innerHTML = "";
  deleteAllBtn.disabled = true;
});

function updateThemeIcons() {
  darkIcon.classList.toggle("hidden", document.documentElement.classList.contains("dark"));
  lightIcon.classList.toggle("hidden", !document.documentElement.classList.contains("dark"));
}

themeToggleBtn.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  updateThemeIcons();
  localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
});

if (localStorage.getItem("theme") === "dark" || 
    (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}
updateThemeIcons();
