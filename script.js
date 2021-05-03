// script.js

const imgCanvas = document.getElementById("user-image");
const ctx = imgCanvas.getContext('2d');
ctx.textAlign = 'center';
ctx.font = '28px impact';
const V_OFFSET = imgCanvas.height/15;

const imgElem = document.getElementsByName("image");
const img = new Image(); // used to load image from <input> and draw to canvas

imgElem[0].addEventListener('change', () => {   // input
  const imgURL = URL.createObjectURL(imgElem[0].files[0]);
  img.src = imgURL;
  // console.log("img loaded");
  img.alt = imgElem[0].files[0].name;
  // console.log('img name:', img.alt);
});

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // clear canvas and form
  ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
  top.value = '';
  bot.value = '';
  // toggle buttons
  submit.disabled = false;
  clear.disabled = false;
  read.disabled = true;
  voice.disabled = true;
  // fill background
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, imgCanvas.width, imgCanvas.height);
  // draw image
  const dims = Object.values(getDimmensions(imgCanvas.width, imgCanvas.height, img.width, img.height));
  ctx.drawImage(img, dims[2], dims[3], dims[0], dims[1]);
  // console.log("loaded img");
});

const form = document.getElementById("generate-meme");
const submit = document.querySelector("button[type='submit']")
const top = document.getElementById("text-top");
const bot = document.getElementById("text-bottom");
form.addEventListener('submit', (event) => {   // submit
  event.preventDefault();
  // console.log("added text");
  // add text to canvas
  ctx.fillStyle = 'black';
  ctx.lineWidth = 2;
  ctx.strokeText(top.value, imgCanvas.width/2, 1.7*V_OFFSET);
  ctx.strokeText(bot.value, imgCanvas.width/2, imgCanvas.height-V_OFFSET);
  ctx.fillStyle = 'white';
  ctx.lineWidth = 1;
  ctx.fillText(top.value, imgCanvas.width/2, 1.7*V_OFFSET);
  ctx.fillText(bot.value, imgCanvas.width/2, imgCanvas.height-V_OFFSET);
  // toggle buttons
  submit.disabled = true;
  clear.disabled = false;
  read.disabled = false;
  voice.disabled = false;
});

const clear = document.querySelector("button[type='reset']")
clear.addEventListener('click', () => {    // clear
  // clear canvas
  ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
  // toggle buttons
  submit.disabled = false;
  clear.disabled = true;
  read.disabled = true;
  voice.disabled = true;
});

const read = document.querySelector("button[type='button']");
const voice = document.getElementById("voice-selection");
const volume = document.getElementById("volume-group");
voice.remove(voice.selectedIndex);
// add compatible voices to voice selection
speechSynthesis.onvoiceschanged = () => {
  const voices = speechSynthesis.getVoices();
  for(let i = 0; i < voices.length; i++) {
    let option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voice.appendChild(option);
  }
}
read.addEventListener('click', () => {    // read text
  const tts = new SpeechSynthesisUtterance(top.value + ' ' + bot.value);
  const selVoice = document.querySelector("option:checked");
  const selOption = selVoice.getAttribute('data-name');
  const voices = speechSynthesis.getVoices();
  for(let i = 0; i < voices.length; i++) {
    if(voices[i].name === selOption) {
      tts.voice = voices[i];
    }
  }
  // console.log('reading', tts.text);
  tts.lang = selVoice.getAttribute('data-lang');
  tts.volume = slider.value/100;
  console.log('volume: ', tts.volume);
  tts.pitch = 1;
  // console.log('current voice: ', selVoice.getAttribute('data-lang'), selVoice.getAttribute('data-name'));
  if(tts.volume) {
    speechSynthesis.speak(tts);
  }
});

const slider = document.querySelector("input[type='range']");
slider.addEventListener('change', () => {
  const volIcon = document.querySelector("#volume-group img");
  // console.log(slider.value);
  if(66 < slider.value && slider.value <= 100) {
    // console.log('level 3');
    volIcon.src = "icons/volume-level-3.svg";
    volIcon.alt = "Volume Level 3";
  }
  else if(33 < slider.value && slider.value <= 66) {
    volIcon.src = "icons/volume-level-2.svg";
    volIcon.alt = "Volume Level 2";
  }
  else if(0 < slider.value && slider.value <= 33) {
    volIcon.src = "icons/volume-level-1.svg";
    volIcon.alt = "Volume Level 1";
  }
  else {
    // console.log('level 0');
    volIcon.src = "icons/volume-level-0.svg";
    volIcon.alt = "Volume Level 0";
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
