import { SYSTEM_PROMPT } from "./prompts.js";

const API_URL =
  "https://order-of-steel-api.cbgraphics1.workers.dev/";

const MAX_HISTORY_MESSAGES = 10;

const nameEl = document.getElementById("knight-name");
const responseEl = document.getElementById("knight-response");
const inputEl = document.getElementById("player-input");
const sendBtn = document.getElementById("send-btn");
const statusEl = document.getElementById("status");

let conversation = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
];

function typeText(target, text, speed = 16) {
  return new Promise((resolve) => {
    target.textContent = "";
    let index = 0;

    const timer = setInterval(() => {
      target.textContent += text.charAt(index);
      index += 1;

      if (index >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

function setLoading(message = "Sir Aldren medita sus palabras...") {
  statusEl.textContent = message;
  statusEl.classList.add("visible");
}

function clearLoading() {
  statusEl.classList.remove("visible");
  statusEl.textContent = "";
}

function setControlsDisabled(disabled) {
  inputEl.disabled = disabled;
  sendBtn.disabled = disabled;
  sendBtn.classList.toggle("disabled", disabled);
}

function trimConversationHistory() {
  const systemMessage = conversation[0];
  const recentMessages = conversation
    .slice(1)
    .slice(-MAX_HISTORY_MESSAGES);

  conversation = [systemMessage, ...recentMessages];
}

async function generateResponse(userText) {
  conversation.push({
    role: "user",
    content: userText,
  });

  trimConversationHistory();
  setLoading("Sir Aldren medita sus palabras...");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: conversation,
    }),
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "El servidor ha devuelto una respuesta que no se puede interpretar."
    );
  }

  if (!response.ok || !result?.ok) {
    throw new Error(
      result?.error ||
        "La Orden no ha podido establecer contacto con Sir Aldren."
    );
  }

  const reply = result.reply?.trim();

  if (!reply) {
    throw new Error("Sir Aldren ha guardado silencio.");
  }

  conversation.push({
    role: "assistant",
    content: reply,
  });

  trimConversationHistory();
  clearLoading();

  await typeText(responseEl, reply);
}

async function handleSend() {
  const text = inputEl.value.trim();

  if (!text || sendBtn.disabled) {
    return;
  }

  inputEl.value = "";
  setControlsDisabled(true);

  try {
    await generateResponse(text);
  } catch (error) {
    console.error(error);
    clearLoading();

    const message =
      error instanceof Error
        ? error.message
        : "Una fuerza desconocida ha interrumpido la conversación.";

    await typeText(
      responseEl,
      `Algo perturba estas piedras. ${message}`,
      12
    );
  } finally {
    setControlsDisabled(false);
    inputEl.focus();
  }
}

sendBtn.addEventListener("click", handleSend);

inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSend();
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  nameEl.textContent = "SIR ALDREN";
  setControlsDisabled(false);

  await typeText(
    responseEl,
    "Por fin has llegado. Soy Sir Aldren, caballero de la Orden de Acero, conocida como Order of Steel. Habla, viajero: ¿qué te trae hasta este lugar?"
  );
});
