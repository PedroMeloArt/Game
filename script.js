/*
  Animal Tap! – Find the animal (Where's Wally? style)
  - Shows target animal (emoji + English name)
  - Tap/click the matching animal among a group
  - Levels increase number of animals and unlock new types; higher levels shrink cards
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
  { name: "Giraffe", emoji: "🦒", voice: "Giraffe" },
  { name: "Lion", emoji: "🦁", voice: "Lion" },
  { name: "Tiger", emoji: "🐯", voice: "Tiger" },
  { name: "Monkey", emoji: "🐵", voice: "Monkey" },
  { name: "Panda", emoji: "🐼", voice: "Panda" },
  { name: "Mouse", emoji: "🐭", voice: "Mouse" },
  { name: "Rabbit", emoji: "🐰", voice: "Rabbit" },
  { name: "Koala", emoji: "🐨", voice: "Koala" },
  { name: "Fox", emoji: "🦊", voice: "Fox" },
  { name: "Wolf", emoji: "🐺", voice: "Wolf" },
  { name: "Deer", emoji: "🦌", voice: "Deer" },
  { name: "Bison", emoji: "🦬", voice: "Bison" },
  { name: "Zebra", emoji: "🦓", voice: "Zebra" },
  { name: "Hippopotamus", emoji: "🦛", voice: "Hippo" },
  { name: "Rhinoceros", emoji: "🦏", voice: "Rhino" },
  { name: "Camel", emoji: "🐪", voice: "Camel" },
  { name: "Llama", emoji: "🦙", voice: "Llama" },
  { name: "Kangaroo", emoji: "🦘", voice: "Kangaroo" },
  { name: "Bat", emoji: "🦇", voice: "Bat" },
  { name: "Penguin", emoji: "🐧", voice: "Penguin" },
  { name: "Bird", emoji: "🐦", voice: "Bird" },
  { name: "Parrot", emoji: "🦜", voice: "Parrot" },
  { name: "Turkey", emoji: "🦃", voice: "Turkey" },
  { name: "Turtle", emoji: "🐢", voice: "Turtle" },
  { name: "Octopus", emoji: "🐙", voice: "Octopus" },
  { name: "Whale", emoji: "🐳", voice: "Whale" },
  { name: "Dolphin", emoji: "🐬", voice: "Dolphin" },
  { name: "Fish", emoji: "🐟", voice: "Fish" }
];

const natureObjects = [
  { name: "Tree", emoji: "🌳" },
  { name: "Evergreen", emoji: "🌲" },
  { name: "Flower", emoji: "🌸" },
  { name: "Tulip", emoji: "🌷" },
  { name: "Leaf", emoji: "🍃" },
  { name: "Mushroom", emoji: "🍄" },
  { name: "Sun", emoji: "☀️" },
  { name: "Cloud", emoji: "☁️" },
  { name: "Rainbow", emoji: "🌈" },
  { name: "Star", emoji: "⭐" },
  { name: "Water", emoji: "💧" },
  { name: "Rock", emoji: "🪨" },
  { name: "Leafy", emoji: "🍂" }
];

const sounds = {
  correct: [
    () => playChord([523.25, 659.25, 783.99], 0.15, 'sine', 0.12), // C major chord (C5-E5-G5)
    () => setTimeout(() => playNote(1046.50, 0.2, 'triangle', 0.08), 50) // C6 bell
  ],
  wrong: [
    () => playNote(220, 0.3, 'sawtooth', 0.06, true), // A3 with fade
    () => setTimeout(() => playNote(185, 0.4, 'sawtooth', 0.04, true), 150), // F#3 with fade
  ],
  star: [
    () => playArpeggio([523.25, 659.25, 783.99, 1046.50, 1318.51], 80, 'triangle', 0.1), // C major arpeggio
    () => setTimeout(() => playChord([1046.50, 1318.51, 1567.98], 0.4, 'sine', 0.15), 400) // High C major
  ]
};

let audioContext;
let preferredVoice = null;
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

function playNote(frequency, duration, waveform = 'sine', volume = 0.1, fadeOut = false) {
  const ac = getAudio();
  if (!ac) return;
  
  const oscillator = ac.createOscillator();
  const gainNode = ac.createGain();
  
  oscillator.type = waveform;
  oscillator.frequency.value = frequency;
  
  // Envelope for smoother sound
  gainNode.gain.setValueAtTime(0, ac.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.01); // Quick attack
  
  if (fadeOut) {
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, ac.currentTime + duration * 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  } else {
    gainNode.gain.setValueAtTime(volume, ac.currentTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ac.currentTime + duration);
  }
  
  oscillator.connect(gainNode).connect(ac.destination);
  oscillator.start(ac.currentTime);
  oscillator.stop(ac.currentTime + duration);
}

function playChord(frequencies, duration, waveform = 'sine', volume = 0.08) {
  const ac = getAudio();
  if (!ac) return;
  
  frequencies.forEach(freq => {
    const oscillator = ac.createOscillator();
    const gainNode = ac.createGain();
    
    oscillator.type = waveform;
    oscillator.frequency.value = freq;
    
    // Envelope
    gainNode.gain.setValueAtTime(0, ac.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume / frequencies.length, ac.currentTime + 0.02);
    gainNode.gain.setValueAtTime(volume / frequencies.length, ac.currentTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ac.currentTime + duration);
    
    oscillator.connect(gainNode).connect(ac.destination);
    oscillator.start(ac.currentTime);
    oscillator.stop(ac.currentTime + duration);
  });
}

function playArpeggio(frequencies, noteInterval, waveform = 'triangle', volume = 0.1) {
  const ac = getAudio();
  if (!ac) return;
  
  frequencies.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = ac.createOscillator();
      const gainNode = ac.createGain();
      
      oscillator.type = waveform;
      oscillator.frequency.value = freq;
      
      const duration = 0.3;
      gainNode.gain.setValueAtTime(0, ac.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      
      oscillator.connect(gainNode).connect(ac.destination);
      oscillator.start(ac.currentTime);
      oscillator.stop(ac.currentTime + duration);
    }, index * noteInterval);
  });
}

const qs = (sel) => document.querySelector(sel);
const grid = qs('#grid');
const promptEmoji = qs('#promptEmoji');
const promptText = qs('#promptText');
const timerBar = qs('#timerBar');
const overlay = qs('#overlay');
const overlayTitle = qs('#overlayTitle');
const overlayDesc = qs('#overlayDesc');
const startBtn = qs('#startBtn');
const retryBtn = qs('#retryBtn');
const restartBtn = qs('#restartBtn');
const soundToggle = qs('#soundToggle');
const calmToggle = qs('#calmToggle');
const srProgress = qs('#srProgress');
const levelTag = qs('#levelTag');
const livesEl = qs('#lives');
const levelFill = qs('#levelFill');

let isSoundOn = true;
let reduceMotion = false;
let currentTarget = null;
let level = 1;
const celebrateEveryLevels = 5;
const maxLives = 3;
let lives = maxLives;
let levelActive = false;
let timerRafId = null;
let timerStartTs = 0;
let timerDurationMs = 0;
let currentTokens = [];
let lastTargetName = '';
let pendingNextLevelTimeout = null;
let overlayMode = 'start';
const encounteredAnimals = [];

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

function choosePreferredVoice() {
  try {
    const voices = window.speechSynthesis.getVoices?.() || [];
    const byScore = voices
      .map(v => {
        let score = 0;
        const tag = `${v.name} ${v.lang}`.toLowerCase();
        if (tag.includes('child') || tag.includes('kids') || tag.includes('natural')) score += 3;
        if (tag.includes('en-us') || tag.includes('en_us')) score += 2;
        if (tag.includes('en-gb') || tag.includes('en_gb')) score += 1;
        if (/google|microsoft|apple|ava|aria|neural/.test(tag)) score += 2;
        return { v, score };
      })
      .sort((a, b) => b.score - a.score);
    preferredVoice = byScore[0]?.v || null;
  } catch (_) {
    preferredVoice = null;
  }
}

function speak(text, { rate = 0.9, pitch = 1.0 } = {}) {
  if (!isSoundOn) return;
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.pitch = pitch;
    if (preferredVoice) utter.voice = preferredVoice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  } catch (_) {
    // ignore if not supported
  }
}

function announce(text) {
  speak(text, { rate: 0.9, pitch: 1.0 });
}

const animalSounds = new Map([
  ['Cow', 'Moo!'],
  ['Dog', 'Woof!'],
  ['Cat', 'Meow!'],
  ['Duck', 'Quack!'],
  ['Sheep', 'Baa!'],
  ['Pig', 'Oink!'],
  ['Chicken', 'Cluck!'],
  ['Frog', 'Ribbit!'],
  ['Horse', 'Neigh!'],
  ['Lion', 'Roar!'],
  ['Tiger', 'Roar!'],
  ['Monkey', 'Oo-oo! Ah-ah!'],
  ['Panda', 'Yum!'],
  ['Mouse', 'Squeak!'],
  ['Rabbit', 'Hop!'],
  ['Koala', 'Munch!'],
  ['Fox', 'Ring-ding!'],
  ['Wolf', 'Awooo!'],
  ['Deer', 'Sniff!'],
  ['Bison', 'Grunt!'],
  ['Zebra', 'Neigh!'],
  ['Hippopotamus', 'Grunt!'],
  ['Rhinoceros', 'Snort!'],
  ['Camel', 'Hrumph!'],
  ['Llama', 'Mmm!'],
  ['Kangaroo', 'Thump!'],
  ['Bat', 'Screech!'],
  ['Penguin', 'Honk!'],
  ['Bird', 'Tweet!'],
  ['Parrot', 'Squawk!'],
  ['Turkey', 'Gobble!'],
  ['Turtle', 'Slowww!'],
  ['Octopus', 'Blub!'],
  ['Whale', 'Woooo!'],
  ['Dolphin', 'Eee-eee!'],
  ['Fish', 'Blub!']
]);

function playAnimalSound(animalName) {
  const sound = animalSounds.get(animalName) || null;
  if (sound) {
    // Slightly faster and playful
    speak(sound, { rate: 1.0, pitch: 1.1 });
  } else {
    playSoundSequence(sounds.correct);
  }
}

function setPrompt(animal) {
  currentTarget = animal;
  promptEmoji.textContent = animal.emoji;
  promptText.textContent = animal.name;
  // Announce only at level start
  announce(animal.name);
}

function createToken(entity) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'token';
  btn.setAttribute('data-kind', entity.kind);
  btn.setAttribute('aria-label', entity.name);
  btn.innerHTML = `<div class="token__emoji" aria-hidden="true">${entity.emoji}</div>`;
  btn.addEventListener('click', () => onPick(entity, btn));
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPick(entity, btn);
    }
  });
  return btn;
}

function onPick(entity, el) {
  if (!levelActive) return;
  if (!currentTarget) return;
  if (entity.kind === 'animal' && entity.isTarget) {
    levelActive = false;
    currentTarget = null;
    stopTimer();
    el.dataset.correct = 'true';
    addSuccessEffects(el);
    // Track correctly found animal for summary
    encounteredAnimals.push({ name: entity.name, emoji: entity.emoji });
    // Play success sound only (no animal name)
    playSoundSequence(sounds.correct);
    level += 1;
    updateLevelDisplay(level);
    // Pause ~2s before next level to give a short break
    clearTimeout(pendingNextLevelTimeout);
    const intermission = document.getElementById('intermission');
    const intermissionMsg = document.getElementById('intermissionMsg');
    if (intermission && intermissionMsg) {
      intermissionMsg.textContent = 'Muito bem! Próximo nível…';
      intermission.style.display = 'grid';
    }
    const timeTakenMs = timerDurationMs - (parseFloat(getComputedStyle(timerBar).transform.split(',')[0]) || 0);
    checkAchievements({ timeMs: Math.max(0, timeTakenMs) });
    pendingNextLevelTimeout = setTimeout(startLevel, 2000);
  } else {
    if (el) {
      el.dataset.incorrect = 'true';
      setTimeout(() => { delete el.dataset.incorrect; }, 400);
      el.classList.add('wobble');
      setTimeout(() => el.classList.remove('wobble'), 600);
    }
    playSoundSequence(sounds.wrong);
    // Do not repeat the animal name on wrong selection
    loseLife('wrong');
  }
}

function updateLevelDisplay(currentLevel) {
  const cycle = celebrateEveryLevels;
  srProgress.textContent = `Progresso: nível ${currentLevel}`;
  if (levelTag) levelTag.textContent = `Nível ${currentLevel}`;
  if (levelFill) levelFill.style.width = `${((currentLevel % cycle) / cycle) * 100}%`;
}

function getLevelScale(currentLevel) {
  // Shrink gradually; floor at 65%
  return Math.max(0.65, 1 - (currentLevel - 1) * 0.05);
}

function applyLevelScale(scale) {
  const root = document.documentElement;
  const clampMinPx = Math.round(96 * scale);
  const clampVw = (18 * scale).toFixed(2);
  const clampMaxPx = Math.round(160 * scale);
  const emojiMinRem = (2.4 * scale).toFixed(2);
  const emojiVw = (8 * scale).toFixed(2);
  const emojiMaxRem = (4 * scale).toFixed(2);
  const nameMinRem = Math.max(0.9, 1.0 * scale).toFixed(2);
  const nameVw = (3.5 * scale).toFixed(2);
  const nameMaxRem = Math.max(1.1, 1.25 * scale).toFixed(2);
  // Legacy card scaling (prompt card remains)
  root.style.setProperty('--card-min-height', `clamp(${clampMinPx}px, ${clampVw}vw, ${clampMaxPx}px)`);
  root.style.setProperty('--card-emoji-size', `clamp(${emojiMinRem}rem, ${emojiVw}vw, ${emojiMaxRem}rem)`);
  root.style.setProperty('--card-name-size', `clamp(${nameMinRem}rem, ${nameVw}vw, ${nameMaxRem}rem)`);
  // Token scaling for scatter mode
  const tokenPx = Math.max(44, Math.round(84 * scale));
  const tokenFontRem = Math.max(1.6, 3.0 * scale).toFixed(2);
  const tokenVw = (7 * scale).toFixed(2);
  root.style.setProperty('--token-size', `${tokenPx}px`);
  root.style.setProperty('--token-font-size', `clamp(${tokenFontRem}rem, ${tokenVw}vw, ${tokenFontRem}rem)`);
}

function getLevelConfig(currentLevel) {
  // Ensure all animals are used by level 15
  const minAnimalsBy15 = Math.ceil(animals.length * Math.min(1, currentLevel / 15));
  const availableTypesCount = Math.min(Math.max(5, minAnimalsBy15), animals.length);
  const totalTokens = Math.min(8 + Math.floor(currentLevel * 0.9), 56);
  // Only start nature objects after level 20
  const objectDistractors = currentLevel >= 20 ? Math.min(1 + Math.floor((currentLevel - 20) / 4), 12) : 0;
  // Increased time limit per request
  const base = 15000; // 15s at level 1
  const timerMs = Math.max(7000, base - (currentLevel - 1) * 350);
  return { availableTypesCount, totalTokens, objectDistractors, timerMs };
}

function buildLevelTokens(available, target, totalTokens, objectDistractors) {
  const tokens = [];
  // Ensure exactly one target
  tokens.push({ kind: 'animal', isTarget: true, name: target.name, emoji: target.emoji });
  // Animal distractors with duplicates (sampling with replacement)
  const animalsNeeded = Math.max(0, totalTokens - 1 - objectDistractors);
  const pool = available.filter(a => a.name !== target.name);
  for (let i = 0; i < animalsNeeded; i += 1) {
    const pick = pool.length ? pickOne(pool) : target; // fallback
    tokens.push({ kind: 'animal', isTarget: false, name: pick.name, emoji: pick.emoji });
  }
  // Object distractors
  for (let i = 0; i < objectDistractors; i += 1) {
    const obj = pickOne(natureObjects);
    tokens.push({ kind: 'object', isTarget: false, name: obj.name, emoji: obj.emoji });
  }
  return shuffle(tokens);
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

function drawScatter(tokens) {
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  const tokenSizePx = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--token-size'), 10) || 72;
  const margin = 10;
  const cell = tokenSizePx + margin;
  // initial width
  let bounds = grid.getBoundingClientRect();
  let cols = Math.max(1, Math.floor(bounds.width / cell));
  const requiredRows = Math.ceil(tokens.length / cols);
  const minHeightPx = Math.max(Math.round(window.innerHeight * 0.45), requiredRows * cell);
  grid.style.minHeight = `${minHeightPx}px`;
  // recompute after setting height
  bounds = grid.getBoundingClientRect();
  cols = Math.max(1, Math.floor(bounds.width / cell));
  const rows = Math.max(requiredRows, Math.floor(bounds.height / cell));
  const cells = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      cells.push({ r, c });
    }
  }
  shuffle(cells);
  tokens.forEach((t, idx) => {
    const el = createToken(t);
    el.classList.add('bounce-in');
    const cellIdx = idx < cells.length ? idx : Math.floor(Math.random() * cells.length);
    const sel = cells[cellIdx] || { r: Math.floor(Math.random() * rows), c: Math.floor(Math.random() * cols) };
    const jitterX = (Math.random() - 0.5) * margin;
    const jitterY = (Math.random() - 0.5) * margin;
    const left = Math.max(0, Math.min(bounds.width - tokenSizePx, sel.c * cell + jitterX));
    const top = Math.max(0, Math.min(bounds.height - tokenSizePx, sel.r * cell + jitterY));
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    frag.appendChild(el);
  });
  grid.appendChild(frag);
}

function startLevel() {
  if (level > 1 && level % celebrateEveryLevels === 0) {
    celebrate();
  }
  const { availableTypesCount, totalTokens, objectDistractors, timerMs } = getLevelConfig(level);
  const available = animals.slice(0, availableTypesCount);
  let target = pickOne(available);
  // Prevent same target consecutively
  if (lastTargetName && available.length > 1) {
    let guard = 0;
    while (target.name === lastTargetName && guard < 10) {
      target = pickOne(available);
      guard += 1;
    }
  }
  lastTargetName = target.name;
  const tokens = buildLevelTokens(available, target, totalTokens, objectDistractors);
  setPrompt(target);
  applyLevelScale(getLevelScale(level));
  updateLevelDisplay(level);
  levelActive = true;
  currentTokens = tokens;
  drawScatter(tokens);
  startTimer(timerMs);
  // Hide intermission if shown
  const intermission = document.getElementById('intermission');
  if (intermission) intermission.style.display = 'none';
}

function celebrate() {
  playSoundSequence(sounds.star);
  fireConfetti();
}

function createEmojiRain(emojis, count = 10) {
  const container = document.getElementById('confetti');
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const el = document.createElement('div');
    el.textContent = emojis[i % emojis.length];
    el.style.position = 'absolute';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = '-40px';
    el.style.fontSize = '24px';
    el.style.opacity = '0.9';
    el.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(100vh)' }
    ], { duration: 2000 + Math.random() * 1500, easing: 'ease-in', fill: 'forwards' });
    frag.appendChild(el);
  }
  container.appendChild(frag);
}

function addSuccessEffects(element) {
  createParticleBurst(element);
  createEmojiRain(['🎉','⭐','💫','🌟'], 12);
}

function createParticleBurst(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  for (let i = 0; i < 12; i += 1) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.background = `hsl(${Math.random()*60+120} 70% 60%)`;
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    const angle = (i / 12) * Math.PI * 2;
    const velocity = 100 + Math.random() * 60;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    particle.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
    ], { duration: 800, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)' })
    .onfinish = () => particle.remove();
    document.body.appendChild(particle);
  }
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

function initLives() {
  updateLivesUI();
}

function updateLivesUI() {
  if (!livesEl) return;
  livesEl.innerHTML = '';
  for (let i = 0; i < lives; i += 1) {
    const dot = document.createElement('div');
    dot.className = 'life';
    livesEl.appendChild(dot);
  }
  livesEl.setAttribute('aria-label', `Vidas: ${lives}`);
}

// Toasts / Achievements
const toastsEl = document.getElementById('toasts');
function showToast({ emoji, text }) {
  if (!toastsEl) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div class="toast__emoji">${emoji}</div><div>${text}</div>`;
  toastsEl.appendChild(t);
  setTimeout(() => { t.remove(); }, 2500);
}

const achievements = {
  first_find: { name: 'Primeiro achado!', emoji: '🎯', unlocked: false },
  speed_demon: { name: 'Rápido demais!', emoji: '⚡', unlocked: false },
  animal_lover: { name: 'Amigo dos bichinhos!', emoji: '💝', unlocked: false }
};

function checkAchievements({ timeMs }) {
  if (!achievements.first_find.unlocked && encounteredAnimals.length >= 1) {
    achievements.first_find.unlocked = true;
    showToast({ emoji: achievements.first_find.emoji, text: achievements.first_find.name });
  }
  if (!achievements.speed_demon.unlocked && timeMs < 3000) {
    achievements.speed_demon.unlocked = true;
    showToast({ emoji: achievements.speed_demon.emoji, text: achievements.speed_demon.name });
  }
  if (!achievements.animal_lover.unlocked && encounteredAnimals.length >= 10) {
    achievements.animal_lover.unlocked = true;
    showToast({ emoji: achievements.animal_lover.emoji, text: achievements.animal_lover.name });
  }
}

function loseLife(reason) {
  if (!levelActive) return;
  levelActive = false;
  stopTimer();
  lives = Math.max(0, lives - 1);
  updateLivesUI();
  if (lives <= 0) {
    showGameOver();
    return;
  }
  // Notify and offer retry or restart
  showLifeLost(reason);
}

function clearPendingNextLevel() {
  if (pendingNextLevelTimeout) {
    clearTimeout(pendingNextLevelTimeout);
    pendingNextLevelTimeout = null;
  }
}

function showGameOver() {
  overlayMode = 'gameover';
  clearPendingNextLevel();
  // Show full-page summary directly on game over
  const sp = document.getElementById('summaryPage');
  const spTitle = document.getElementById('summaryTitle');
  if (sp && spTitle) {
    spTitle.textContent = `Você conseguiu chegar ao nível ${level}! 🎉`;
    buildSummaryList('summaryPageList');
    sp.style.display = 'grid';
  }
  fireConfetti();
  overlay.style.display = 'none';
}

function showLifeLost(reason) {
  overlayMode = 'lost';
  clearPendingNextLevel();
  overlayTitle.textContent = 'Você perdeu uma vida';
  overlayDesc.textContent = reason === 'timeout' ? 'O tempo acabou!' : 'Foi o bichinho errado!';
  // Buttons: Continuar (retryBtn) and Terminar o jogo (restartBtn)
  startBtn.style.display = 'none';
  retryBtn.textContent = 'Continuar';
  restartBtn.textContent = 'Terminar o jogo';
  retryBtn.style.display = 'inline-block';
  restartBtn.style.display = 'inline-block';
  // Hide summary for single life loss
  const summary = document.getElementById('summary');
  if (summary) summary.style.display = 'none';
  overlay.style.display = 'grid';
}

function terminateRun() {
  overlayMode = 'summary';
  clearPendingNextLevel();
  // Show celebratory summary page
  const sp = document.getElementById('summaryPage');
  const spTitle = document.getElementById('summaryTitle');
  if (sp && spTitle) {
    spTitle.textContent = `Você conseguiu chegar ao nível ${level}! 🎉`;
    buildSummaryList('summaryPageList');
    sp.style.display = 'grid';
  }
  fireConfetti();
  // Hide modal overlay if visible
  overlay.style.display = 'none';
}

function buildSummaryList(listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = '';
  const unique = new Map();
  encounteredAnimals.forEach(a => { if (!unique.has(a.name)) unique.set(a.name, a); });
  
  if (unique.size === 0) {
    const noAnimals = document.createElement('div');
    noAnimals.className = 'summary__no-animals';
    noAnimals.textContent = 'Nenhum animal foi encontrado ainda!';
    list.appendChild(noAnimals);
    return;
  }
  
  unique.forEach(({ name, emoji }) => {
    const item = document.createElement('div');
    item.className = 'summary__item';
    item.innerHTML = `<div class=\"summary__emoji\">${emoji}</div><div class=\"summary__name\">${name}</div>`;
    list.appendChild(item);
  });
}

function startTimer(durationMs) {
  timerDurationMs = durationMs;
  timerStartTs = performance.now();
  if (timerBar) timerBar.style.transform = 'scaleX(1)';
  cancelAnimationFrame(timerRafId);
  const tick = () => {
    const now = performance.now();
    const elapsed = now - timerStartTs;
    const remaining = Math.max(0, durationMs - elapsed);
    const progress = remaining / durationMs;
    if (timerBar) timerBar.style.transform = `scaleX(${progress})`;
    if (remaining <= 0) {
      // timeout
      loseLife('timeout');
      return;
    }
    timerRafId = requestAnimationFrame(tick);
  };
  timerRafId = requestAnimationFrame(tick);
}

function stopTimer() {
  cancelAnimationFrame(timerRafId);
  timerRafId = null;
}

startBtn.addEventListener('click', () => {
  overlay.style.display = 'none';
  const ac = getAudio();
  if (ac && ac.state === 'suspended') {
    ac.resume().catch(() => {});
  }
  if (overlayMode === 'start' || overlayMode === 'gameover') {
    // Reset game state on start or restart
    clearPendingNextLevel();
    level = 1;
    lives = maxLives;
    encounteredAnimals.length = 0;
    updateLevelDisplay(level);
    initLives();
    startLevel();
  } else if (overlayMode === 'lost') {
    // Should not happen since startBtn is hidden, but guard to retry
    clearPendingNextLevel();
    startLevel();
  } else if (overlayMode === 'summary') {
    // Restart from summary
    clearPendingNextLevel();
    level = 1;
    lives = maxLives;
    encounteredAnimals.length = 0;
    updateLevelDisplay(level);
    initLives();
    startLevel();
  }
});

retryBtn.addEventListener('click', () => {
  overlay.style.display = 'none';
  const ac = getAudio();
  if (ac && ac.state === 'suspended') {
    ac.resume().catch(() => {});
  }
  // Retry current level without changing level or lives further
  clearPendingNextLevel();
  startLevel();
});

restartBtn.addEventListener('click', () => {
  // Terminar o jogo → Show summary page, do not continue the run
  terminateRun();
});

soundToggle.addEventListener('click', () => {
  isSoundOn = !isSoundOn;
  soundToggle.setAttribute('aria-pressed', String(isSoundOn));
  soundToggle.setAttribute('aria-label', isSoundOn ? 'Som ligado' : 'Som desligado');
  soundToggle.title = isSoundOn ? 'Som ligado' : 'Som desligado';
  if (isSoundOn && currentTarget) announce(currentTarget.name);
});

calmToggle.addEventListener('click', () => {
  reduceMotion = !reduceMotion;
  calmToggle.setAttribute('aria-pressed', String(reduceMotion));
  calmToggle.setAttribute('aria-label', reduceMotion ? 'Reduzir movimento ligado' : 'Reduzir movimento desligado');
  calmToggle.title = reduceMotion ? 'Reduzir movimento ligado' : 'Reduzir movimento desligado';
  document.documentElement.setAttribute('data-reduce-motion', reduceMotion ? 'true' : 'false');
});

// Set up base UI on load
updateLevelDisplay(level);
initLives();
overlayMode = 'start';
// Warm up best voice selection (voices may load asynchronously on some browsers)
if (window.speechSynthesis) {
  choosePreferredVoice();
  window.speechSynthesis.onvoiceschanged = () => choosePreferredVoice();
}


// Summary page restart button
const summaryRestartBtn = document.getElementById('summaryRestartBtn');
if (summaryRestartBtn) {
  summaryRestartBtn.addEventListener('click', () => {
    const sp = document.getElementById('summaryPage');
    if (sp) sp.style.display = 'none';
    clearPendingNextLevel();
    level = 1;
    lives = maxLives;
    encounteredAnimals.length = 0;
    updateLevelDisplay(level);
    initLives();
    startLevel();
  });
}


