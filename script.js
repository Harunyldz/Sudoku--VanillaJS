const cells = document.querySelectorAll(".cell")
const numbers = document.querySelectorAll(".number")
const pausePlayImg = document.getElementById("pausePlay")
const playIcon = document.getElementById("playIcon")
const mistakeSpan = document.getElementById("mistakeCount")
const loseModal=document.querySelector(".loseModal")
const overlay=document.getElementById("overlay")
const newGameModal=document.querySelector(".newGameModal")
const newGameBtnModal=document.getElementById("newGameBtnModal")
const modalCancelBtn=document.getElementById("modalCancelBtn")
const modalRestartBtn=document.getElementById("modalRestartBtn")
const modalLevels=document.querySelectorAll(".modalLevelItem")

let isGameStarted=true
let selectedNumber = ""
let isCellSelected = false
let selectedCellIndex = ""
let openedCellCount = 40
let selectedLevel = "easy"
let openedCellIndexes = []
let second = 0
let minute = 0
let hour = 0
let time = 0
let isPaused = false
let gameTimer
let mistakeCount = 3

import levels from "./utils/levels.js"

getNewGame()
console.log(openedCellIndexes)

cells.forEach((cell, index) => {
    cell.addEventListener("click", () => {
        selectedCellIndex = index
        console.log(selectedCellIndex, ".cell clicked")
        isCellSelected = true
    })
})

numbers.forEach(number => {
    const cells = document.querySelectorAll(".cell")
   
    number.addEventListener("click", () => {
        if(isGameStarted){

            const currentCell = cells[selectedCellIndex]
            selectedNumber = number.getAttribute("data-number-value")
            console.log(selectedNumber, " number clicked")
            if (isCellSelected) {
                const getCellValue = currentCell.getAttribute("data-cell-value")
                currentCell.style.color = getCellValue === selectedNumber ? "#325aaf" : "red"
                currentCell.textContent = selectedNumber
                mistakeCount = getCellValue === selectedNumber ? mistakeCount : mistakeCount += 1
                if(mistakeCount===3){
                    loseModal.style.display="flex"
                    overlay.style.display="block"
                    clearInterval(gameTimer)
                    isGameStarted=false
                }
                displayMistakes(mistakeCount)
                // geri al tuşuna tıklandığında seçilmiş olan değeri kullanabilmek için 
                currentCell.setAttribute("data-selected-value", selectedNumber)
        }
        }
    })
})

const selectLevels = document.getElementById("levels")
selectLevels.addEventListener("change", () => {
    selectedLevel = selectLevels.value
    setLevel()
    getNewGame()
})

const pausePlayDiv = document.getElementById("pause")
pausePlayDiv.addEventListener("click", () => {
    if (!isPaused) {
        pauseGame()
    } else {
        continueGame()
    }
})

const newGameBtn = document.getElementById("newGameBtn")
newGameBtn.addEventListener("click", () => {
    getNewGame()
})

newGameBtnModal.addEventListener("click",()=>{
    loseModal.style.display="none"
    newGameModal.style.display="block"
})

modalCancelBtn.addEventListener("click",()=>{
    newGameModal.style.display="none"
    overlay.style.display="none"
})

modalRestartBtn.addEventListener("click",()=>{
    overlay.style.display="none"
    newGameModal.style.display="none"
    getNewGame()
})

modalLevels.forEach(modalLevel=>{
    modalLevel.addEventListener("click",()=>{
        let selectedModalLevel=modalLevel.getAttribute("data-level-value")
        newGameModal.style.display="none"
        overlay.style.display="none"
        selectLevels.value=selectedModalLevel
        selectedLevel = selectLevels.value
        setLevel()
        getNewGame()
    })
})

//sudoku tahtasındaki rakamların hazırlanışı için gerekli fonksiyonlar
function rowSafe(board, row, num) {
    return !board[row].includes(num);
}

function colSafe(board, col, num) {
    return !board.some(row => row[col] === num);
}

function boxSafe(board, row, col, num) {
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }
    return true;
}

function isSafe(board, row, col, num) {
    return rowSafe(board, row, num) && colSafe(board, col, num) && boxSafe(board, row, col, num);
}

function fillPuzzle(board) {
    const emptyCell = findEmptyCell(board);

    if (!emptyCell) {
        return true; // Puzzle başarıyla dolduruldu
    }

    const shuffledValues = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of shuffledValues) {
        if (isSafe(board, emptyCell.row, emptyCell.col, num)) {
            board[emptyCell.row][emptyCell.col] = num;

            if (fillPuzzle(board)) {
                return true; // Bir sonraki boş hücreye geç
            }

            // Eğer mevcut sayıyı yerleştirmek çözüme ulaştırmazsa, geri al
            board[emptyCell.row][emptyCell.col] = 0;
        }
    }

    // Hiçbir sayı işe yaramazsa, önceki hücreye geri dön
    return false;
}

function findEmptyCell(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                return { row, col };
            }
        }
    }
    return null; // Puzzle tamamen dolduruldu
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generatePlayableBoard() {
    const emptyBoard = Array.from({ length: 9 }, () => Array(9).fill(0));

    if (!fillPuzzle(emptyBoard)) {
        console.error("Oynanabilir bir tahta oluşturulamadı.");
        return null;
    }

    return emptyBoard;
}

// Tahtayı HTML sayfasına yerleştiren fonksiyon
function displayBoard() {
    const board = generatePlayableBoard()
    const cells = document.querySelectorAll(".cell")
    let k = 0
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cellValue = board[i][j] !== 0 ? board[i][j].toString() : '';
            cells[k].setAttribute("data-cell-value", cellValue)
            k++
        }
    }
}

//seviyeyi ayarla
function setLevel() {
    openedCellCount = levels[selectedLevel].openedCellCount
    console.log("openedCellCount: " + openedCellCount)
}

//başlangıçta açık olacak hücreleri seç
function getOpenedCellsIndexes() {
    const allCellIndexes = Array.from({ length: 81 }, (_, index) => index); // Tüm hücre indekslerini içeren dizi

    const shuffledIndexes = shuffle(allCellIndexes)

    openedCellIndexes = shuffledIndexes.slice(0, openedCellCount)
    return openedCellIndexes
}

//başlangıçta açık olacak hücreleri aç
function showOpenedCells() {
    const cells = document.querySelectorAll(".cell")
    openedCellIndexes.forEach(openedCell => {
        cells[openedCell].textContent = cells[openedCell].getAttribute("data-cell-value")
        cells[openedCell].setAttribute("data-isOpen", "opened")
    })
}

function Timer() {
    time += 1
    second += 1
    if (second === 60) {
        second = 0
        minute += 1
    } if (minute === 60) {
        minute = 0
        hour += 1
    }
    displaySecond()
    displayMinute()
    displayHour()
}

function startTimer() {
    gameTimer = setInterval(Timer, 1000)
}
function clearTimer() {
    clearInterval(gameTimer)
    time = 0
    second = 0
    minute = 0
    hour = 0
    displaySecond()
    displayMinute()
    displayHour()
}

function displaySecond() {
    const secondDiv = document.getElementById("second")
    secondDiv.textContent = second > 9 ? second : "0" + second
}
function displayMinute() {
    const minuteDiv = document.getElementById("minute")
    minuteDiv.textContent = minute > 9 ? minute + ":" : "0" + minute + ":"
}

function displayHour() {
    const hourDiv = document.getElementById("hour")
    hourDiv.style.visibility = hour > 0 ? "visible" : "hidden"
    hourDiv.textContent = hour > 9 ? hour + ":" : "0" + hour + ":"
}

function pauseGame() {
    const cells = document.querySelectorAll(".cell")
    cells.forEach(cell => {
        cell.textContent = ""
    })
    pausePlayImg.src = "./assets/play2.svg"
    isPaused = true
    playIcon.style.display = "block"
    clearInterval(gameTimer)
}

function continueGame() {
    const cells = document.querySelectorAll(".cell")
    playIcon.style.display = "none"
    cells.forEach(cell => {
        if (cell.getAttribute("data-isOpen")) {
            cell.textContent = cell.getAttribute("data-cell-value")
        } if (cell.getAttribute("data-selected-value")) {
            cell.textContent = cell.getAttribute("data-selected-value")
        }
    })
    pausePlayImg.src = "./assets/pause.svg"
    startTimer()
    isPaused = false
}

function clearGame() {
    const cells = document.querySelectorAll(".cell")
    cells.forEach(cell => {
        cell.textContent = ""
        cell.style.color = "#265073"
        cell.setAttribute("data-cell-value", "")
        cell.setAttribute("data-isOpen", "")
        cell.setAttribute("data-selected-value", "")
    })
    clearTimer()
    mistakeCount=0
}

function getNewGame() {
    clearGame()
    displayBoard()
    setLevel()
    getOpenedCellsIndexes()
    showOpenedCells()
    startTimer()
    displayMistakes(mistakeCount)
    isGameStarted=true
}

function displayMistakes(mistakeCount) {
    mistakeSpan.textContent = mistakeCount
}