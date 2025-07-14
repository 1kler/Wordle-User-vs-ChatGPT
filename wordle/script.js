const tiles = document.getElementsByClassName("tile")
const buttons = document.getElementsByTagName('button')
let answer
let currentRowIndex = 0;
let currentTileIndex = 0;
const maxGuesses = 6;
const wordLength = 5;

async function getData() {
  const url = "https://random-word-api.herokuapp.com/word?length=5";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    answer = data[0].toUpperCase();
    console.log("Fetched answer:", answer);
  } catch (error) {
    console.error(error.message);
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  await getData();
});

Array.from(buttons).forEach(element => 
    element.addEventListener("click", handleKeyClick))

addEventListener("keydown", handleKeyDown)

function handleKeyClick(e){
const key = e.target.dataset.key;
  if (key === 'Backspace') handleBackspace();
  else if (key === 'Enter') handleEnter();
  else handleLetter(key);
}

function handleKeyDown(e) {
    const key = e.key.toUpperCase();
    if (key === 'BACKSPACE') handleBackspace();
    else if (key === 'ENTER') handleEnter();
    else handleLetter(key);
}

function handleBackspace(){
    const currentRow = document.querySelectorAll('.row')[currentRowIndex];
    const tilesInRow = currentRow.children;

    if (currentTileIndex > 0) {
        currentTileIndex--;
        tilesInRow[currentTileIndex].textContent = "";
        tilesInRow[currentTileIndex].classList.remove('active');
        tilesInRow[currentTileIndex].classList.add('empty');
        currentRow.classList.remove('full');
    }
}

function handleEnter(){
    const currentRow = document.querySelectorAll('.row')[currentRowIndex];
    const tilesInRow = currentRow.children;

    if (!currentRow.classList.contains("full")) {
        // Not a full guess yet
        return;
    }

    let guess = "";
    Array.from(tilesInRow).forEach(tile => {
        guess += tile.textContent;
    });

    const result = answerCheck(guess);

    updateKeyboardButtonColor(guess,result)

    for (let i = 0; i < result.length; i++) {
        tilesInRow[i].classList.add(result[i]);
    }

    if (result.every(color => color === "correct")) {
        winnerState();
        // Disable further input if you want
        Array.from(document.querySelectorAll('.active')).forEach(tile => {
            tile.classList.remove("active");
        });
        return;
    }

    currentRowIndex++;
    currentTileIndex = 0; // Reset for the next row

    if (currentRowIndex === maxGuesses) {
        // Handle loss condition here
        console.log("Game Over! The word was:", answer);
        // Optionally, show a "loser" message
    } else {
        // Prepare the next row by adding 'free' class
        const nextRow = document.querySelectorAll('.row')[currentRowIndex];
        if (nextRow) { // Ensure there is a next row
            nextRow.classList.add('free');
        }
    }
    // Remove 'active' from current row's tiles after processing
    Array.from(tilesInRow).forEach(tile => {
        tile.classList.remove("active");
    });
}

function updateKeyboardButtonColor(guess, result){

    for(let i=0;i<guess.length;i++){
        let button = document.querySelector('[data-key="'+guess[i]+'"]')
        button.classList.remove("asbent","correct","present")
        button.classList.add(result[i])
    }

}

function handleLetter(key){

    if (!/^[A-Za-z]$/.test(key)){
        console.warn("Invalid key pressed:", key);
        return;
    }
    const currentRow = document.querySelectorAll('.row')[currentRowIndex];
    const tilesInRow = currentRow.children;

    if (currentTileIndex < wordLength) {
        tilesInRow[currentTileIndex].textContent = key;
        tilesInRow[currentTileIndex].classList.add('active');
        tilesInRow[currentTileIndex].classList.remove('empty'); // Make sure to remove empty
        currentTileIndex++;
    }

    if (currentTileIndex === wordLength) {
        currentRow.classList.add('full');
    }
}
    
function answerCheck(guess){
    const result = Array(guess.length).fill('absent');
    const answerArr = answer.split('');
    const used = Array(answer.length).fill(false); // tracks matched letters

    // First pass: correct letter and position (green)
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === answer[i]) {
        result[i] = 'correct';
        used[i] = true;
        }
    }

    // Second pass: correct letter, wrong position (yellow)
    for (let i = 0; i < guess.length; i++) {
        if (result[i] === 'absent') {
        for (let j = 0; j < answer.length; j++) {
            if (!used[j] && guess[i] === answer[j]) {
            result[i] = 'present';
            used[j] = true;
            break;
            }
        }
        }
    }

    return result;
}

function winnerState(){
    const winMessage = document.querySelector('.message')
    winMessage.classList.add("show")
}
