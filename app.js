import { SYSTEM_PROMPT } from "./prompts.js";

const API_URL =
  "https://order-of-steel-api.cbgraphics1.workers.dev/";

const MAX_HISTORY_MESSAGES = 10;

const nameEl = document.getElementById("knight-name");
const responseEl = document.getElementById("knight-response");
const inputEl = document.getElementById("player-input");
const sendBtn = document.getElementById("send-btn");
const statusEl = document.getElementById("status");

const backgroundMusic = document.getElementById("backgroundMusic");

if (backgroundMusic) {
  backgroundMusic.volume = 0.10;

  const startBackgroundMusic = async () => {
    try {
      await backgroundMusic.play();

      document.removeEventListener("pointerdown", startBackgroundMusic);
      document.removeEventListener("keydown", startBackgroundMusic);
    } catch (error) {
      console.warn("No se pudo iniciar la música:", error);
    }
  };

  document.addEventListener("pointerdown", startBackgroundMusic);
  document.addEventListener("keydown", startBackgroundMusic);
}

let conversation = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
];

// Mensajes inmersivos cuando ocurre cualquier problema
const ERROR_MESSAGES = [
  "Algo perturba estas piedras. Mis pensamientos no alcanzan aún la respuesta.",
  "Una extraña sombra cubre mis recuerdos. Háblame de nuevo, viajero.",
  "Los ecos de esta fortaleza guardan hoy silencio. Intentemos otra vez.",
  "La memoria de la Order of Steel permanece velada por un instante.",
  "No toda pregunta encuentra respuesta al primer intento. Vuelve a hablarme.",
  "El silencio envuelve mi mente. Concédeme otro instante.",
  "Incluso el acero necesita un respiro antes de volver al combate. Inténtalo de nuevo."
];

function randomErrorMessage() {
  return ERROR_MESSAGES[
    Math.floor(Math.random() * ERROR_MESSAGES.length)
  ];
}

function typeText(target, text, speed = 16) {

// ===============================
// Voz de Sir Aldren (PRUEBA)
// ===============================

function speakAsAldren(text) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "es-ES";
  utterance.rate = 0.88;
  utterance.pitch = 0.82;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();

  const spanishVoice =
    voices.find(v => v.lang === "es-ES") ||
    voices.find(v => v.lang.startsWith("es"));

  if (spanishVoice) {
    utterance.voice = spanishVoice;
  }

  window.speechSynthesis.speak(utterance);
}

window.speechSynthesis.onvoiceschanged = () => {
  window.speechSynthesis.getVoices();
};  
  
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
    throw new Error("Respuesta inválida");
  }

  if (!response.ok || !result?.ok) {
    throw new Error("Error del servidor");
  }

  const reply = result.reply?.trim();

  if (!reply) {
    throw new Error("Respuesta vacía");
  }

  conversation.push({
    role: "assistant",
    content: reply,
  });

  trimConversationHistory();

  clearLoading();

  await typeText(responseEl, reply);
  speakAsAldren(reply);
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

    await typeText(
      responseEl,
      randomErrorMessage(),
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

  const music = document.getElementById("backgroundMusic");

  if (music) {
    music.volume = 0.10;

    document.addEventListener(
      "click",
      () => {
        music.play().catch(() => {});
      },
      { once: true }
    );
  }

  nameEl.textContent = "SIR ALDREN";
  setControlsDisabled(false);

  await typeText(
    responseEl,
    "Por fin has llegado. Soy Sir Aldren, caballero de Order of Steel. Habla, viajero: ¿qué te trae hasta este lugar?"
  );
});
