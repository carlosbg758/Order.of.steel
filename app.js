import { CreateMLCEngine } from "@mlc-ai/web-llm";
import { SYSTEM_PROMPT } from "./prompts.js";

const MODEL_ID = "Llama-3.2-1B-Instruct-q4f32_1-MLC";
const MAX_HISTORY_MESSAGES = 10;

const nameEl = document.getElementById("knight-name");
const responseEl = document.getElementById("knight-response");
const inputEl = document.getElementById("player-input");
const sendBtn = document.getElementById("send-btn");
const statusEl = document.getElementById("status");

let engine = null;
let enginePromise = null;

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

function setLoading(message = "Despertando la memoria del caballero...") {
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

function formatProgress(report) {
  if (typeof report?.progress === "number") {
    const percentage = Math.round(report.progress * 100);

    return `Despertando los recuerdos de Sir Aldren... ${percentage}%`;
  }

  return "Despertando los recuerdos de Sir Aldren...";
}

function checkWebGPUSupport() {
  return "gpu" in navigator;
}

async function initializeEngine() {
  if (engine) {
    return engine;
  }

  if (enginePromise) {
    return enginePromise;
  }

  if (!checkWebGPUSupport()) {
    throw new Error(
      "Este artefacto no puede despertar en este navegador. Utiliza una versión reciente de Chrome o Edge."
    );
  }

  setControlsDisabled(true);
  setLoading("Despertando los recuerdos de Sir Aldren...");

  enginePromise = CreateMLCEngine(MODEL_ID, {
    initProgressCallback: (report) => {
      setLoading(formatProgress(report));
    },
  })
    .then((loadedEngine) => {
      engine = loadedEngine;
      clearLoading();
      setControlsDisabled(false);
      return engine;
    })
    .catch((error) => {
      enginePromise = null;
      clearLoading();
      setControlsDisabled(false);
      throw error;
    });

  return enginePromise;
}

function trimConversationHistory() {
  const systemMessage = conversation[0];
  const recentMessages = conversation.slice(1).slice(-MAX_HISTORY_MESSAGES);

  conversation = [systemMessage, ...recentMessages];
}

async function generateResponse(userText) {
  const activeEngine = await initializeEngine();

  conversation.push({
    role: "user",
    content: userText,
  });

  trimConversationHistory();

  setLoading("Sir Aldren medita sus palabras...");

  const completion = await activeEngine.chat.completions.create({
    messages: conversation,
    temperature: 0.75,
    top_p: 0.9,
    max_tokens: 220,
    repetition_penalty: 1.1,
  });

  clearLoading();

  const reply =
    completion?.choices?.[0]?.message?.content?.trim() ||
    "El silencio pesa sobre estas piedras. Formula de nuevo tu pregunta, viajero.";

  conversation.push({
    role: "assistant",
    content: reply,
  });

  trimConversationHistory();

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

    await typeText(
      responseEl,
      "Algo perturba mis recuerdos. Las sombras de estas piedras no me permiten responder en este momento.",
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
    "Por fin has llegado. Soy Sir Aldren, caballero de la Orden de Acero. Algunos la conocen como Order of Steel. Habla, viajero: ¿qué te trae hasta este lugar?"
  );
});
