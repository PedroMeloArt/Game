/*
  Animal Tap! – a tiny toddler-friendly game
  - Tap/click the animal that matches the prompt
  - Big touch targets, reads names aloud (SpeechSynthesis)
  - Works offline-friendly as a static page, mobile + desktop
*/

const animals = [
  { name: "Cow", emoji: "🐮", voice: "Cow" },
  { name: "Cat", emoji: "🐱", voice: "Cat" },
  { name: "Dog", emoji: "🐶", voice: "Dog" },
  { name: "Sheep", emoji: "🐑", voice: "Sheep" },
  { name: "Pig", emoji: "🐷", voice: "Pig" },
  { name: "Duck", emoji: "🦆", voice: "Duck" },
  { name: "Horse", emoji: "🐴", voice: "Horse" },
  { name: "Chicken", emoji: "🐔", voice: "Chicken" },
  { name: "Frog", emoji: "🐸", voice: "Frog" },
  { name: "Bear", emoji: "🐻", voice: "Bear" },
  { name: "Elephant", emoji: "🐘", voice: "Elephant" },
  { name: "Giraffe", emoji: "🦒", voice: "Giraffe" }
];

const sounds = {
  correct: [
    () => beep(660, 0.08),
    () => beep(880, 0.12)
  ],
  wrong: [
    () => beep(130, 0.15),
    () => beep(90, 0.2)
  ],
  star: [
    () => beep(880, 0.06),
    () => beep(1040, 0.06),
    () => beep(1320, 0.1)
  ]
};

let audioContext;
function getAudio() {
  if (!audioContext) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioContext = new AC();
  }
  return audioContext;
}

function beep(frequency, durationSec) {
  const ac = getAudio();
  if (!ac) return;
  const oscillator = ac.createOscillator();
  const gainNode = ac.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gainNode.gain.value = 0.08;
  oscillator.connect(gainNode).connect(ac.destination);
  oscillator.start();
  const endTime = ac.currentTime + durationSec;
  oscillator.stop(endTime);
}

const qs = (sel) => document.querySelector(sel);
const grid = qs('#grid');
const promptEmoji = qs('#promptEmoji');
const promptText = qs('#promptText');
const starsEl = qs('#stars');
const overlay = qs('#overlay');
const startBtn = qs('#startBtn');
const soundToggle = qs('#soundToggle');
const calmToggle = qs('#calmToggle');
const srProgress = qs('#srProgress');

let isSoundOn = true;
let reduceMotion = false;
let currentTarget = null;
let round = 0;
const roundsPerWin = 5;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function sample(array, count) {
  const arr = shuffle(array.slice());
  return arr.slice(0, count);
}

function pickOne(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function announce(text) {
  if (!isSoundOn) return;
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  } catch (_) {
    // ignore if not supported
  }
}

function setPrompt(animal) {
  currentTarget = animal;
  promptEmoji.textContent = animal.emoji;
  promptText.textContent = animal.name;
  announce(animal.name);
}

function createCard(animal) {
  const btn = document.createElement('button');
  btn.className = 'card';
  btn.setAttribute('data-animal', animal.name);
  btn.setAttribute('aria-label', animal.name);
  btn.innerHTML = `
    <div class="card__emoji" aria-hidden="true">${animal.emoji}</div>
    <div class="card__name">${animal.name}</div>
  `;
  btn.addEventListener('click', () => onPick(animal, btn));
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPick(animal, btn);
    }
  });
  return btn;
}

function onPick(animal, el) {
  if (!currentTarget) return;
  if (animal.name === currentTarget.name) {
    currentTarget = null; // lock to prevent double scoring
    el.dataset.correct = 'true';
    playSoundSequence(sounds.correct);
    round += 1;
    updateStars(round);
    setTimeout(nextRound, 450);
  } else {
    el.dataset.incorrect = 'true';
    setTimeout(() => { delete el.dataset.incorrect; }, 400);
    playSoundSequence(sounds.wrong);
    announce(currentTarget.name);
  }
}

function updateStars(value) {
  starsEl.innerHTML = '';
  for (let i = 0; i < roundsPerWin; i += 1) {
    const s = document.createElement('div');
    s.className = 'star' + (i < (value % roundsPerWin) ? ' is-on' : '');
    starsEl.appendChild(s);
  }
  srProgress.textContent = `Progress: ${(value % roundsPerWin)} of ${roundsPerWin}`;
}

function playSoundSequence(sequence) {
  if (!isSoundOn) return;
  const ac = getAudio();
  if (ac && ac.state === 'suspended') {
    ac.resume().catch(() => {});
  }
  let delay = 0;
  sequence.forEach(fn => {
    setTimeout(fn, delay * 1000);
    delay += 0.1;
  });
}

function drawGrid(options) {
  const { choices } = options;
  grid.innerHTML = '';
  choices.forEach(animal => {
    const card = createCard(animal);
    grid.appendChild(card);
  });
}

function nextRound() {
  if (round > 0 && round % roundsPerWin === 0) {
    celebrate();
  }
  const choices = sample(animals, 6);
  const target = pickOne(choices);
  setPrompt(target);
  drawGrid({ choices });
}

function celebrate() {
  playSoundSequence(sounds.star);
  fireConfetti();
}

function fireConfetti() {
  const container = document.getElementById('confetti');
  const count = reduceMotion ? 20 : 80;
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement('div');
    piece.style.position = 'absolute';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.top = '-10px';
    piece.style.width = '10px';
    piece.style.height = '10px';
    piece.style.background = i % 2 ? '#ffd56b' : '#7c5cff';
    piece.style.opacity = '0.9';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.borderRadius = '2px';
    piece.animate([
      { transform: `translateY(0) rotate(0deg)` },
      { transform: `translateY(100vh) rotate(${360 + Math.random() * 360}deg)` }
    ], {
      duration: reduceMotion ? 1000 : 2500 + Math.random() * 1200,
      easing: 'ease-in',
      fill: 'forwards'
    });
    frag.appendChild(piece);
  }
  container.appendChild(frag);
}

function initStars() {
  starsEl.innerHTML = '';
  for (let i = 0; i < roundsPerWin; i += 1) {
    const s = document.createElement('div');
    s.className = 'star';
    starsEl.appendChild(s);
  }
}

startBtn.addEventListener('click', () => {
  overlay.style.display = 'none';
  const ac = getAudio();
  if (ac && ac.state === 'suspended') {
    ac.resume().catch(() => {});
  }
  nextRound();
});

soundToggle.addEventListener('click', () => {
  isSoundOn = !isSoundOn;
  soundToggle.setAttribute('aria-pressed', String(isSoundOn));
  soundToggle.setAttribute('aria-label', isSoundOn ? 'Sound on' : 'Sound off');
  soundToggle.title = isSoundOn ? 'Sound on' : 'Sound off';
  if (isSoundOn && currentTarget) announce(currentTarget.name);
});

calmToggle.addEventListener('click', () => {
  reduceMotion = !reduceMotion;
  calmToggle.setAttribute('aria-pressed', String(reduceMotion));
  calmToggle.setAttribute('aria-label', reduceMotion ? 'Reduce motion on' : 'Reduce motion off');
  calmToggle.title = reduceMotion ? 'Reduce motion on' : 'Reduce motion off';
});

// Set up base UI on load
initStars();


