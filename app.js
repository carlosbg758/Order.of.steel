import { SYSTEM_PROMPT } from "./prompts.js";

const API_URL =
  "https://order-of-steel-api.cbgraphics1.workers.dev/";

const MAX_HISTORY_MESSAGES = 10;

// ==========================================================
// DETECCIÓN DE DISPOSITIVO
// ==========================================================

function isMobileDevice() {
  return window.matchMedia("(max-width: 768px)").matches;
}

const DEVICE = {
  mobile: isMobileDevice(),
};

const SCENE_FOLDER = DEVICE.mobile
  ? "images/mobile/"
  : "images/desktop/";

// ==========================================================
// ELEMENTOS DE LA INTERFAZ
// ==========================================================

const nameEl = document.getElementById("knight-name");
const responseEl = document.getElementById("knight-response");
const inputEl = document.getElementById("player-input");
const sendBtn = document.getElementById("send-btn");
const statusEl = document.getElementById("status");
const voicePanel = document.querySelector(".voice-panel");

const backgroundMusic =
  document.getElementById("backgroundMusic");

// ==========================================================
// ESCENARIOS
// ==========================================================

const sceneImage =
  document.getElementById("sceneImage");

const sceneVideo =
  document.getElementById("sceneVideo");

const sceneLoader =
  document.getElementById("sceneLoader");

const SCENES = [
  {
    type: "image",
    src: SCENE_FOLDER + "00escenario.webp",
  },
  {
    type: "video",
    src: "videos/01escenario.mp4",
  },
  {
    type: "video",
    src: "videos/02escenario.mp4",
  },
  {
    type: "video",
    src: "videos/03escenario.mp4",
  },
  {
    type: "image",
    src: SCENE_FOLDER + "02escenario.webp",
  },
  {
    type: "image",
    src: SCENE_FOLDER + "03escenario.webp",
  },
  {
    type: "image",
    src: SCENE_FOLDER + "04escenario.webp",
  },
  {
    type: "image",
    src: SCENE_FOLDER + "05escenario.webp",
  },
  {
    type: "image",
    src: SCENE_FOLDER + "06escenario.webp",
  },
  {
    type: "image",
    src: SCENE_FOLDER + "07escenario.webp",
  },
  {
    type: "image",
    src: SCENE_FOLDER + "08escenario.webp",
  },
];

function hideSceneLoader() {
  if (!sceneLoader) {
    return;
  }

  sceneLoader.classList.add("hidden");

  window.setTimeout(() => {
    sceneLoader.style.display = "none";
  }, 850);
}

function showFallbackScene() {
  if (!sceneImage || !sceneVideo) {
    return;
  }

  sceneVideo.pause();
  sceneVideo.style.display = "none";

  sceneImage.style.display = "block";
 sceneImage.style.backgroundImage =
  `url("${SCENE_FOLDER}00escenario.webp")`;
  sceneImage.style.opacity = "0";

  requestAnimationFrame(() => {
    sceneImage.style.opacity = "1";
    hideSceneLoader();
  });
}

async function loadImageScene(scene) {
  await new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = resolve;
    image.onerror = reject;
    image.src = scene.src;
  });

  sceneVideo.pause();
  sceneVideo.removeAttribute("src");
  sceneVideo.load();
  sceneVideo.style.display = "none";
  sceneVideo.style.opacity = "0";

  sceneImage.style.display = "block";
  sceneImage.style.backgroundImage =
    `url("${scene.src}")`;
  sceneImage.style.opacity = "0";

  requestAnimationFrame(() => {
    sceneImage.style.opacity = "1";
    hideSceneLoader();
  });
}

async function loadVideoScene(scene) {
  sceneImage.style.display = "none";
  sceneImage.style.opacity = "0";

  sceneVideo.muted = true;
  sceneVideo.defaultMuted = true;
  sceneVideo.volume = 0;
  sceneVideo.loop = true;
  sceneVideo.autoplay = true;
  sceneVideo.playsInline = true;
  sceneVideo.src = scene.src;
  sceneVideo.style.display = "block";
  sceneVideo.style.opacity = "0";

  await new Promise((resolve, reject) => {
    const handleCanPlay = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      reject(
        new Error("No se pudo cargar el vídeo.")
      );
    };

    const cleanup = () => {
      sceneVideo.removeEventListener(
        "canplay",
        handleCanPlay
      );

      sceneVideo.removeEventListener(
        "error",
        handleError
      );
    };

    sceneVideo.addEventListener(
      "canplay",
      handleCanPlay
    );

    sceneVideo.addEventListener(
      "error",
      handleError
    );

    sceneVideo.load();
  });

  try {
    await sceneVideo.play();
  } catch (error) {
    console.warn(
      "El navegador bloqueó el autoplay:",
      error
    );
  }

  requestAnimationFrame(() => {
    sceneVideo.style.opacity = "1";
    hideSceneLoader();
  });
}

async function loadRandomScene() {
  if (!sceneImage || !sceneVideo || !sceneLoader) {
    console.error(
      "No se encontraron sceneImage, sceneVideo o sceneLoader."
    );

    return;
  }

  const scene =
    SCENES[
      Math.floor(Math.random() * SCENES.length)
    ];

  try {
    if (scene.type === "video") {
      await loadVideoScene(scene);
      return;
    }

    await loadImageScene(scene);
  } catch (error) {
    console.error(
      "No se pudo cargar el escenario seleccionado:",
      error
    );

    showFallbackScene();
  }
}

// ==========================================================
// MÚSICA AMBIENTAL
// ==========================================================

const MUSIC = [
  "audio/2.Order.mp3",
  // "audio/3.Order.mp3",
  // "audio/4.Order.mp3",
  // "audio/5.Order.mp3",
  // "audio/6.Order.mp3",
  // "audio/7.Order.mp3",
  // "audio/8.Order.mp3",
  // "audio/9.Order.mp3",
];

function prepareBackgroundMusic() {
  if (!backgroundMusic) {
    return Promise.resolve();
  }

  backgroundMusic.src =
    MUSIC[Math.floor(Math.random() * MUSIC.length)];

  backgroundMusic.volume = 0.2;
  backgroundMusic.loop = true;

  return backgroundMusic.play();
}

// ==========================================================
// CONVERSACIÓN
// ==========================================================

let conversation = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
];

const ERROR_MESSAGES = [
  "Algo perturba estas piedras. Mis pensamientos no alcanzan aún la respuesta.",
  "Una extraña sombra cubre mis recuerdos. Háblame de nuevo, viajero.",
  "Los ecos de esta fortaleza guardan hoy silencio. Intentemos otra vez.",
  "La memoria de Order of Steel permanece velada por un instante.",
  "No toda pregunta encuentra respuesta al primer intento. Vuelve a hablarme.",
  "El silencio envuelve mi mente. Concédeme otro instante.",
  "Incluso el acero necesita un respiro antes de volver al combate. Inténtalo de nuevo.",
];

function randomErrorMessage() {
  return ERROR_MESSAGES[
    Math.floor(
      Math.random() * ERROR_MESSAGES.length
    )
  ];
}

function typeText(target, text, speed = 16) {
  return new Promise((resolve) => {
    target.textContent = "";

    let index = 0;

    const timer = window.setInterval(() => {
      target.textContent += text.charAt(index);
      index += 1;

      if (index >= text.length) {
        window.clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

// ==========================================================
// VOZ DE SIR ALDREN — ELEVENLABS + RESPALDO MICROSOFT PABLO
// ==========================================================

let currentAldrenAudio = null;

function startVoiceAnimation() {
  voicePanel?.classList.add("speaking");
}

function stopVoiceAnimation() {
  voicePanel?.classList.remove("speaking");
}

function speakWithMicrosoftPablo(text) {
  if (!("speechSynthesis" in window)) {
    console.warn(
      "Este navegador no admite síntesis de voz."
    );

    stopVoiceAnimation();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.lang = "es-ES";
  utterance.rate = 0.78;
  utterance.pitch = 0.60;
  utterance.volume = 1;

  const voices =
    window.speechSynthesis.getVoices();

  const spanishVoice =
    voices.find((voice) =>
      voice.name.includes("Microsoft Pablo")
    ) ||
    voices.find((voice) =>
      voice.name.includes("Pablo")
    ) ||
    voices.find(
      (voice) =>
        voice.lang.toLowerCase() === "es-es"
    ) ||
    voices.find((voice) =>
      voice.lang.toLowerCase().startsWith("es")
    );

  if (!spanishVoice) {
    console.warn(
      "No se encontró ninguna voz española. Se cancela la reproducción."
    );

    stopVoiceAnimation();
    return;
  }

  utterance.voice = spanishVoice;

  utterance.onstart = () => {
    startVoiceAnimation();
  };

  utterance.onend = () => {
    stopVoiceAnimation();
  };

  utterance.onerror = () => {
    stopVoiceAnimation();
  };

  window.speechSynthesis.speak(utterance);
}

async function speakAsAldren(text) {
  if (!text || typeof text !== "string") {
    stopVoiceAnimation();
    return;
  }

  startVoiceAnimation();

  // Detiene cualquier voz anterior.
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  if (currentAldrenAudio) {
    currentAldrenAudio.pause();
    currentAldrenAudio.src = "";
    currentAldrenAudio = null;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "tts",
        text,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `ElevenLabs devolvió el estado ${response.status}.`
      );
    }

    const audioBlob = await response.blob();

    if (!audioBlob.size) {
      throw new Error(
        "ElevenLabs devolvió un audio vacío."
      );
    }

    const audioUrl =
      URL.createObjectURL(audioBlob);

    const audio =
      new Audio(audioUrl);

    currentAldrenAudio = audio;
    audio.volume = 1;

    audio.addEventListener(
      "ended",
      () => {
        URL.revokeObjectURL(audioUrl);

        if (currentAldrenAudio === audio) {
          currentAldrenAudio = null;
        }
      },
      { once: true }
    );

    audio.addEventListener(
      "error",
      () => {
        URL.revokeObjectURL(audioUrl);

        if (currentAldrenAudio === audio) {
          currentAldrenAudio = null;
        }
      },
      { once: true }
    );

    await audio.play();
  } catch (error) {
    console.warn(
      "ElevenLabs no pudo reproducir la voz. Se utilizará Microsoft Pablo:",
      error
    );

    speakWithMicrosoftPablo(text);
  }
}

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged =
    () => {
      window.speechSynthesis.getVoices();
    };
}

// ==========================================================
// ESTADO DE LA INTERFAZ
// ==========================================================

function setLoading(
  message = "Sir Aldren medita sus palabras..."
) {
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

  sendBtn.classList.toggle(
    "disabled",
    disabled
  );
}

function trimConversationHistory() {
  const systemMessage = conversation[0];

  const recentMessages = conversation
    .slice(1)
    .slice(-MAX_HISTORY_MESSAGES);

  conversation = [
    systemMessage,
    ...recentMessages,
  ];
}

// ==========================================================
// RESPUESTA DE SIR ALDREN
// ==========================================================

async function generateResponse(userText) {
  conversation.push({
    role: "user",
    content: userText,
  });

  trimConversationHistory();

  setLoading(
    "Sir Aldren medita sus palabras..."
  );

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
    throw new Error("Respuesta inválida.");
  }

  if (!response.ok || !result?.ok) {
    throw new Error("Error del servidor.");
  }

  const reply = result.reply?.trim();

  if (!reply) {
    throw new Error("Respuesta vacía.");
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

// ==========================================================
// EVENTOS
// ==========================================================

sendBtn.addEventListener(
  "click",
  handleSend
);

inputEl.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  }
);

window.addEventListener(
  "DOMContentLoaded",
  () => {
    const entryScreen =
      document.getElementById("entry-screen");

    const enterButton =
      document.getElementById("enter-button");

    setControlsDisabled(true);

    enterButton.addEventListener(
      "click",
      async () => {
        enterButton.disabled = true;

 if (navigator.vibrate) {
  navigator.vibrate(25);
}
        await prepareBackgroundMusic();

        entryScreen.classList.add("entry-screen-hidden");

        await loadRandomScene();

await new Promise(resolve => setTimeout(resolve, 600));

document
  .querySelector(".dialogue-panel")
  ?.classList.add("show");

nameEl.textContent = "SIR ALDREN";

        setControlsDisabled(false);

        await typeText(
          responseEl,
          "Soy Sir Aldren, caballero de Order of Steel. Habla, viajero: ¿qué te trae hasta este lugar?"
        );

        inputEl.focus();
      },
      { once: true }
    );
  }
);
