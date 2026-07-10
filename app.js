import { SYSTEM_PROMPT } from "./prompts.js";

// --- WebLLM integration scaffold -------------------------------------------
// When ready to use a real model, load WebLLM in the browser:
//
//   import * as webllm from "https://esm.run/@mlc-ai/web-llm";
//   const engine = await webllm.CreateMLCEngine("Llama-3.2-1B-Instruct-q4f32_1-MLC", {
//     initProgressCallback: (p) => { setLoading(p.text || p.progress); }
//   });
//   const reply = await engine.chat.completions.create({
//     messages: [
//       { role: "system", content: SYSTEM_PROMPT },
//       { role: "user", content: userText },
//     ],
//   });
//   const text = reply.choices[0].message.content;
//
// For now we simulate responses so the interface can be visually tested.

const SIMULATED_RESPONSES = [
  "Tus palabras me encuentran en la hora quieta tras las laudes, amigo. Habla sin rodeos: ¿qué peso oprime tu espíritu este día?",
  "He cabalgado los caminos de Antioquía hasta Acre, y he aprendido que la lengua habla más fuerte que la espada. Dime qué te inquieta.",
  "La Regla nos manda levantarnos antes del sol y trabajar hasta las vísperas. Aun así, te escucho. ¿Qué pides a un pobre caballero del Temple?",
  "Hablas como quien ha visto el polvo de Tierra Santa. O quizás eres nuevo en estos caminos. De cualquier modo, pregunta y responderé según Dios me dé entendimiento.",
  "Una pregunta justa, aunque mi mente pesa con el recuerdo de hermanos caídos ante los muros de Jerusalén. Continúa, y te daré el consejo que pueda.",
  "No soy ningún sabio, sólo un hermano consagrado a la oración y la espada. Pero si tu corazón busca la verdad, no te cerraré la puerta. Habla.",
  "La noche se alarga y las velas menguan. Aun así, un caballero puede ceder un momento a quien busca consejo con buena fe. ¿Qué deseas saber?",
  "Recuerdo la primera vez que vestí el manto blanco: su peso no era nada comparado con el peso del voto. Pero basta de mí. Tu pregunta, amigo.",
];

// --- DOM --------------------------------------------------------------------
const nameEl = document.getElementById("knight-name");
const responseEl = document.getElementById("knight-response");
const inputEl = document.getElementById("player-input");
const sendBtn = document.getElementById("send-btn");
const statusEl = document.getElementById("status");
const panelEl = document.getElementById("dialogue-panel");
const crestEl = document.getElementById("crest");

let responseIndex = 0;

// --- Typewriter effect ------------------------------------------------------
function typeText(target, text, speed = 22) {
  return new Promise((resolve) => {
    target.textContent = "";
    let i = 0;
    const timer = setInterval(() => {
      target.textContent += text.charAt(i);
      i += 1;
      if (i >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

// --- Loading / status -------------------------------------------------------
function setLoading(message = "Despertando la memoria del templario...") {
  statusEl.textContent = message;
  statusEl.classList.add("visible");
}
function clearLoading() {
  statusEl.classList.remove("visible");
  statusEl.textContent = "";
}

// --- Simulated generation ---------------------------------------------------
async function simulateResponse(userText) {
  setLoading();
  await new Promise((r) => setTimeout(r, 900));
  clearLoading();

  const reply = SIMULATED_RESPONSES[responseIndex % SIMULATED_RESPONSES.length];
  responseIndex += 1;
  await typeText(responseEl, reply);
}

// --- WebLLM-ready generation (currently simulated) --------------------------
async function generateResponse(userText) {
  // Replace the body of this function with the WebLLM call shown above
  // once a model engine is loaded. The UI wiring stays the same.
  return simulateResponse(userText);
}

// --- Send handling ----------------------------------------------------------
async function handleSend() {
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = "";
  inputEl.disabled = true;
  sendBtn.disabled = true;
  sendBtn.classList.add("disabled");

  await generateResponse(text);

  inputEl.disabled = false;
  sendBtn.disabled = false;
  sendBtn.classList.remove("disabled");
  inputEl.focus();
}

sendBtn.addEventListener("click", handleSend);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSend();
  }
});

// --- Intro line on load ----------------------------------------------------
window.addEventListener("DOMContentLoaded", async () => {
  await typeText(
    responseEl,
    "Por fin has llegado. Soy Sir Aldren, de la Orden del Temple. Habla, amigo: ¿qué te trae hasta este lugar?"
  );
});

// Keep SYSTEM_PROMPT referenced so tree-shaking does not drop it.
window.__SYSTEM_PROMPT__ = SYSTEM_PROMPT;
