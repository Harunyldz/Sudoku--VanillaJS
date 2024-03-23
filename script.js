const cells = document.querySelectorAll(".cell")
const numbers = document.querySelectorAll(".number")
const pausePlayImg = document.getElementById("pausePlay")
const playIcon = document.getElementById("playIcon")
const mistakeSpan = document.getElementById("mistakeCount")
const loseModal = document.querySelector(".loseModal")
const overlay = document.getElementById("overlay")
const newGameModal = document.querySelector(".newGameModal")
const newGameBtnModal = document.getElementById("newGameBtnModal")
const modalCancelBtn = document.getElementById("modalCancelBtn")
const modalRestartBtn = document.getElementById("modalRestartBtn")
const modalLevels = document.querySelectorAll(".modalLevelItem")
const hintDiv = document.getElementById("hintDiv")
const hintCountSpan = document.getElementById("hintCount")
const undoDiv = document.getElementById("undo")
const deleteDiv = document.getElementById("delete")
const selectLevels = document.getElementById("levels")
const pausePlayDiv = document.getElementById("pause")
const newGameBtn = document.getElementById("newGameBtn")

let isGameStarted = true
let selectedNumber = ""
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
let hintCount = 3
let getUnOpenedCellsArray = []
let lastClickedCellsIndexes = []

import levels from "./utils/levels.js"

getNewGame()

cells.forEach((cell, index) => {
    cell.addEventListener("click", () => {
        if (cell.getAttribute("data-isOpen") !== "opened") { //Başlangıçta açık olan hücreler değiştirilemesin
            selectedCellIndex = index
        } else {
            selectedCellIndex = ""
        }
        console.log(selectedCellIndex, ".cell clicked")
        cells.forEach(cell => {
            cell.style.backgroundColor = "#fff"
        })
        if (cell.textContent) {
            const getTextContent = cell.textContent
            cells.forEach(cell => {
                // tıklanan hücreyle aynı değere sahip diğer hücreleri işaretle
                cell.style.backgroundColor = cell.textContent === getTextContent ? "#d2dce9" : "#fff"
            })
        } else {
            cell.style.backgroundColor = "#d2dce9"
        }
    })
})

numbers.forEach(number => {
    const cells = document.querySelectorAll(".cell")

    number.addEventListener("click", () => {
        if (isGameStarted) {

            selectedNumber = number.getAttribute("data-number-value")
            console.log(selectedNumber, " number clicked")
            const currentCell = cells[selectedCellIndex]
            if (selectedCellIndex) {
                const getCellValue = currentCell.getAttribute("data-cell-value")//seçilen hücrede olması gereken değeri getirdi
                lastClickedCellsIndexes.push({ cellindex: selectedCellIndex, value: currentCell.textContent })//geri al işlemi için tıklanmış hücrenin bir önceki textcontent değerini ve index değerini diziye ekledi
                console.log("son tıklananlar: ", lastClickedCellsIndexes)
                currentCell.style.color = getCellValue === selectedNumber ? "#325aaf" : "red"
                console.log("selcted ındex value: ", cells[selectedCellIndex].textContent)
                if (cells[selectedCellIndex].textContent === selectedNumber) {//seçilmiş hücrenin değeri girilen sayıya eşitse
                    cells[selectedCellIndex].textContent = ""
                    currentCell.setAttribute("data-selected-value", "")
                } else {
                    currentCell.textContent = selectedNumber
                    mistakeCount = getCellValue === selectedNumber ? mistakeCount : mistakeCount += 1
                    currentCell.setAttribute("data-selected-value", selectedNumber)
                }
                console.log("selcted ındex value cahged: ", cells[selectedCellIndex].textContent)
                console.log("selctedındex: ", selectedCellIndex)
                // if(cells[selectedCellIndex])
                cells.forEach(cell => {
                    //hücreye girilen değerle aynı değere sahip diğer hücreleri işaretle
                    if (cell.textContent)
                        cell.style.backgroundColor = cell.textContent === currentCell.textContent ? "#d2dce9" : "#fff"
                })
                if (mistakeCount === 3) {
                    loseModal.style.display = "flex"
                    overlay.style.display = "block"
                    clearInterval(gameTimer)
                    isGameStarted = false
                }
                displayMistakes(mistakeCount)
                // play ikonuna tıklandığında seçilmiş olan değeri gösterebilmek için 
            }
        }
    })
})

//*****************************************************************Event Listeners*********************************************************

selectLevels.addEventListener("change", () => {
    selectedLevel = selectLevels.value
    setLevel()
    getNewGame()
})

pausePlayDiv.addEventListener("click", () => {
    if (!isPaused) {
        pauseGame()
    } else {
        continueGame()
    }
})

newGameBtn.addEventListener("click", () => {
    getNewGame()
})

newGameBtnModal.addEventListener("click", () => {
    loseModal.style.display = "none"
    newGameModal.style.display = "block"
})

modalCancelBtn.addEventListener("click", () => {
    closeModal()
})

modalRestartBtn.addEventListener("click", () => {
    closeModal()
    getNewGame()
})

modalLevels.forEach(modalLevel => {
    modalLevel.addEventListener("click", () => {
        let selectedModalLevel = modalLevel.getAttribute("data-level-value")//modal içindeki seçeneklerden data-level-value değeri alındı
        newGameModal.style.display = "none"
        overlay.style.display = "none"
        selectLevels.value = selectedModalLevel//Select elementinin value bilgisi güncellendi
        selectedLevel = selectedModalLevel
        setLevel()
        getNewGame()
    })
})

undoDiv.addEventListener("click", () => {
    if (lastClickedCellsIndexes.length > 0) {//lastClickedCellsIndexes dizisinde eleman varsa
        cells.forEach(cell => {
            cell.style.backgroundColor = "#fff"
        })
        const lastClickedCell = lastClickedCellsIndexes[lastClickedCellsIndexes.length - 1].cellindex//lastClickedCellsIndexes dizisindeki son elemanın indis değerini aldı
        const lastClickedCellValue = lastClickedCellsIndexes[lastClickedCellsIndexes.length - 1].value//lastClickedCellsIndexes dizisindeki son elemanın value değerini aldı
        cells[lastClickedCell].textContent = lastClickedCellValue
        cells[lastClickedCell].style.color = cells[lastClickedCell].getAttribute("data-cell-value") === lastClickedCellValue ? "#325aaf" : "red"//geri getirilen değerin doğruluğuna göre rengi belirlendi
        cells[lastClickedCell].setAttribute("data-selected-value", lastClickedCellValue) // play ikonuna tıklandığında seçilmiş olan değeri gösterebilmek için 
        lastClickedCellsIndexes.pop()
        if (lastClickedCellsIndexes.length > 0) {
            //bir önceki hamle yapılan hücrenin hangisi olduğunu belirtmek için
            cells[lastClickedCellsIndexes[lastClickedCellsIndexes.length - 1].cellindex].style.backgroundColor = "#d2dce9"
        }
    }
})

deleteDiv.addEventListener("click", () => {
    if (selectedCellIndex) {
        //geri al işlemini sağlamak için var olan değer diziye eklenip sonra text content temizlenecek
        lastClickedCellsIndexes.push({ cellindex: selectedCellIndex, value: cells[selectedCellIndex].textContent })
        cells[selectedCellIndex].textContent = ""
        cells[selectedCellIndex].setAttribute("data-selected-value", "")// play ikonuna tıklandığında seçilmiş olan değeri gösterebilmek için
    }
})

hintDiv.addEventListener("click", () => {
    if (isGameStarted) {
        if (hintCount !== 0) {
            hintCount -= 1
            const hintCell = cells[getOneUnOpenedCell()]
            hintCell.textContent = hintCell.getAttribute("data-cell-value")
            hintCell.setAttribute("data-isOpen", "opened")
            hintCell.classList.add("hintCell")
            displayHintCounts()
            console.log("unopenedcells: ", getUnOpenedCellsArray)
        }
        getUnOpenedCellsArray.length = 0//açılmamış hücreleri gösteren diziyi sıfırla
    }
})


//*****************************************************************Functions*********************************************************
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
        cells[openedCell].setAttribute("data-isOpen", "opened") //Başlangıçta açık olan hücreleri kontrol edebilmek için
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
    displayTime()
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
    displayTime()
}

function displayTime() {
    const secondDiv = document.getElementById("second")
    const hourDiv = document.getElementById("hour")
    const minuteDiv = document.getElementById("minute")
    secondDiv.textContent = second > 9 ? second : "0" + second
    minuteDiv.textContent = minute > 9 ? minute + ":" : "0" + minute + ":"
    hourDiv.style.visibility = hour > 0 ? "visible" : "hidden"
    hourDiv.textContent = hour > 9 ? hour + ":" : "0" + hour + ":"
}

function pauseGame() {
    const cells = document.querySelectorAll(".cell")
    cells.forEach(cell => {
        cell.textContent = ""
        cell.style.backgroundColor = "#fff"
    })
    pausePlayImg.src = "./assets/play2.svg"
    isPaused = true
    playIcon.style.display = "block"
    clearInterval(gameTimer)
}

function continueGame() {
    const cells = document.querySelectorAll(".cell")
    playIcon.style.display = "none"

    //pauseGame fonk. çalıştığında textcontentler silindiğinden tekrar gösterebilmek için
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
        cell.style.backgroundColor = "#fff"
        cell.setAttribute("data-cell-value", "")
        cell.setAttribute("data-isOpen", "")
        cell.setAttribute("data-selected-value", "")
        cell.classList.remove("hintCell")
    })
    clearTimer()
    mistakeCount = 0
    hintCount = 3
    lastClickedCellsIndexes.length = 0 //son tıklananlar dizisini sıfırla
}

function getNewGame() {
    clearGame()
    displayBoard()
    setLevel()
    getOpenedCellsIndexes()
    showOpenedCells()
    startTimer()
    displayMistakes()
    displayHintCounts()
    isGameStarted = true
}

function closeModal() {
    newGameModal.style.display = "none"
    overlay.style.display = "none"
}

function displayMistakes() {
    mistakeSpan.textContent = mistakeCount
}

function displayHintCounts() {
    hintCountSpan.textContent = hintCount
}

function getOneUnOpenedCell() {
    cells.forEach((cell, index) => {
        if (cell.textContent === "") {//textcontent i olmayan hücrelerinin indislerini getUnOpenedCellsArray dizisine ekle
            getUnOpenedCellsArray.push(index)
        }
    })
    const shuffledUnOpenedCellsArray = shuffle(getUnOpenedCellsArray) //getUnOpenedCellsArray dizisini shuffle fonk. ile karıştır ve geri shuffledUnOpenedCellsArray dizisine ata
    return shuffledUnOpenedCellsArray[0]  //shuffledUnOpenedCellsArray dizisinin ilk elemanını seç ve
}
