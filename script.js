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
const notesDiv = document.getElementById("notesDiv")
const notesImg = document.getElementById("notesImg")
const onOffSpan = document.getElementById("onOff")
const scoreSpan = document.getElementById("score")
const winModal = document.querySelector(".winModal")

// oyun bitiminde gözükecek modalı ve oyun bitiminde oluşacak animasyonu yap
let isGameStarted = true
let selectedNumber = ""
let selectedCellIndex = ""
let openedCellCount = 40
let selectedLevel = "kolay"
let basePoint
let score = 0
let moveTime = 0
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
let isNotesActive = false
let selectedNotesArray = []

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
            if (selectedCellIndex >= 0) {
                if (isNotesActive) {
                    console.log("selectedcellIndex: ", selectedCellIndex)
                    currentCell.textContent = ""
                    addSelectedNoteCells(selectedCellIndex, selectedNumber)
                    showSelectedNotes(currentCell, selectedCellIndex)
                    console.log("selctedNotesArray= ", selectedNotesArray)

                } else {
                    if (currentCell.querySelector("div")) {//eğer seçili hücrede notlar varsa notları kaldır ve text contenti temizle
                        removeNoteBoard(currentCell, selectedCellIndex)
                        currentCell.textContent = ""
                    }
                    const getCellValue = currentCell.getAttribute("data-cell-value")//seçilen hücrede olması gereken değeri getirdi
                    lastClickedCellsIndexes.push({ cellindex: selectedCellIndex, value: currentCell.textContent })//geri al işlemi için tıklanmış hücrenin bir önceki textcontent değerini ve index değerini diziye ekledi
                    currentCell.style.color = getCellValue === selectedNumber ? "#325aaf" : "red"
                    if (currentCell.textContent === selectedNumber) {//seçilmiş hücrenin değeri girilen sayıya eşitse
                        console.log("burada")
                        currentCell.textContent = ""
                        currentCell.setAttribute("data-selected-value", "")
                    } else {
                        currentCell.textContent = selectedNumber
                        mistakeCount = getCellValue === selectedNumber ? mistakeCount : mistakeCount += 1
                        if (getCellValue === selectedNumber) {
                            setScore()
                            if (isGameFinished()) {
                                openWinModal()
                            }
                        }
                        currentCell.setAttribute("data-selected-value", selectedNumber)
                    }
                    console.log("selcted ındex value cahged: ", currentCell.textContent)
                    console.log("selctedındex: ", selectedCellIndex)
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
                    displayMistakes()
                }

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

playIcon.addEventListener("click", () => {
    continueGame()
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
    if (selectedCellIndex >= 0) {
        if (cells[selectedCellIndex].querySelector("div")) {
            removeNoteBoard(cells[selectedCellIndex], selectedCellIndex)
            cells[selectedCellIndex].textContent = ""
        } else {
            //geri al işlemini sağlamak için var olan değer diziye eklenip sonra text content temizlenecek
            lastClickedCellsIndexes.push({ cellindex: selectedCellIndex, value: cells[selectedCellIndex].textContent })
            cells[selectedCellIndex].textContent = ""
            cells[selectedCellIndex].setAttribute("data-selected-value", "")// play ikonuna tıklandığında seçilmiş olan değeri gösterebilmek için
        }
    }
})

notesDiv.addEventListener("click", () => {
    if (!isNotesActive) {
        notesImg.style.border = "2px solid #325aaf"
        onOffSpan.textContent = "ON"
        onOffSpan.style.backgroundColor = "#325aaf"
        isNotesActive = true
    } else {
        notesImg.style.border = "none"
        onOffSpan.textContent = "OFF"
        onOffSpan.style.backgroundColor = "#adb6c2"
        isNotesActive = false
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
            hintCell.style.color = "#325aaf"
            displayHintCounts()
            console.log("unopenedcells: ", getUnOpenedCellsArray)
            score = score + basePoint
            displayScore()
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
    basePoint = levels[selectedLevel].basePoint
    console.log("puan: ", basePoint)
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
    moveTime = 0
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
    cells.forEach((cell, index) => {
        if (cell.getAttribute("data-isOpen")) {
            cell.textContent = cell.getAttribute("data-cell-value")
        } if (cell.getAttribute("data-selected-value")) {
            cell.textContent = cell.getAttribute("data-selected-value")
        }
        showSelectedNotes(cell, index)
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
        cell.classList.remove("fullCell")
    })
    clearTimer()
    mistakeCount = 0
    hintCount = 3
    lastClickedCellsIndexes.length = 0 //son tıklananlar dizisini sıfırla
    selectedCellIndex = ""
    isNotesActive = false
    score = 0
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
    displayScore()
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

function createNoteBoard(selectedNoteCell) {
    const noteBoardDiv = document.createElement("div")
    noteBoardDiv.classList.add("noteBoard")
    selectedNoteCell.appendChild(noteBoardDiv)
    for (let i = 0; i < 9; i++) {
        const noteCellDiv = document.createElement("div")
        noteCellDiv.classList.add("noteCell")
        noteBoardDiv.appendChild(noteCellDiv)
        noteCellDiv.setAttribute("data-note-value", i + 1)
    }
}

function addSelectedNoteCells(cellIndex, noteIndex) {
    const index = isCellHasNoteBoard(cellIndex)
    if (index !== -1) {//eğer seçilen hücreye daha önce de note eklenmişse
        if (!selectedNotesArray[index].notes.includes(noteIndex)) { //eğer seçilen note değeri dizide yoksa diziye ekle
            selectedNotesArray[index].notes.push(noteIndex)
        } else {
            const getIndexofNoteCell = selectedNotesArray[index].notes.indexOf(noteIndex)//eğer seçilen not değeri dizide varsa indexini al
            selectedNotesArray[index].notes.splice(getIndexofNoteCell, 1) //alınan indexteki değeri diziden çıkar
        }
    } else {//seçilen hücreye ilk kez note ekleniyorsa
        selectedNotesArray.push({ index: cellIndex, notes: [noteIndex] })
    }
}

function isCellHasNoteBoard(cellIndex) {
    for (let i = 0; i < selectedNotesArray.length; i++) {
        console.log(selectedNotesArray[i].index)
        if (selectedNotesArray[i].index === cellIndex) {
            return i
        }
    }
    return -1
}

function showSelectedNotes(selectedNoteCell, cellIndex) {
    const selectedCellIndexInArray = selectedNotesArray.findIndex(item => item.index === cellIndex);
    if (selectedCellIndexInArray !== -1) { // Eğer hücrenin notları varsa
        const notesArray = selectedNotesArray[selectedCellIndexInArray].notes;
        createNoteBoard(selectedNoteCell)//noteCell lerin olduğu noteBoard u oluştur

        const noteCells = selectedNoteCell.querySelectorAll(".noteCell")//seçilen hücredeki noteCelller
        noteCells.forEach(noteCell => {
            for (let i = 0; i < notesArray.length; i++) {
                if (noteCell.getAttribute("data-note-value") === notesArray[i]) {
                    noteCell.textContent = noteCell.getAttribute("data-note-value")
                }
            }
        })
    }
}
function removeNoteBoard(selectedNoteCell, cellIndex) {
    const deletedBoardDiv = selectedNoteCell.querySelector("div")
    if (deletedBoardDiv) {
        deletedBoardDiv.style.display = "none"
    }
    const removeNoteIndex = selectedNotesArray.findIndex(item => item.index === cellIndex)
    console.log(removeNoteIndex)
    selectedNotesArray.splice(removeNoteIndex, 1)
}

function displayScore() {
    scoreSpan.textContent = score > 0 ? score : "0"
}

function setScore() {

    let timeInterval = time - moveTime
    let point
    if (timeInterval <= 5) {
        point = getBonusPoint(basePoint)
    } else if (timeInterval <= 10) {
        point = getBonusPoint(basePoint - basePoint * 10 / 100)
    } else if (timeInterval <= 20) {
        point = getBonusPoint(basePoint - basePoint * 20 / 100)
    } else if (timeInterval <= 35) {
        point = getBonusPoint(basePoint - basePoint * 30 / 100)
    } else if (timeInterval <= 60) {
        point = getBonusPoint(basePoint - basePoint * 50 / 100)
    } else {
        point = getBonusPoint(basePoint - basePoint * 80 / 100)
    }
    score = score + point
    displayScore()
    moveTime = time
}

function getBonusPoint(basePoint) {
    const [newCells, rowIndex, colIndex] = getTwoDimensionalCells() //array destructuring ile newCells,rowIndex,colIndex alındı 
    const isColFulled = isColFull(newCells, colIndex)
    const isRowFulled = isRowFull(newCells, rowIndex)
    const isBoxFulled = isBoxFull(newCells, colIndex, rowIndex)
    let bonusPoint
    if (isBoxFulled && isColFulled && isRowFulled) {
        bonusPoint = 15 * basePoint
    } else if (isColFulled && isRowFulled) {
        bonusPoint = 10 * basePoint
    } else if (isBoxFulled || isColFulled || isRowFulled) {
        bonusPoint = 5 * basePoint
    } else {
        bonusPoint = basePoint
    }
    return bonusPoint
}
function getTwoDimensionalCells() {
    let colIndex = selectedCellIndex % 9
    let rowIndex = Math.floor(selectedCellIndex / 9)
    let newCells = []

    //Tek boyutlu olan cells dizisini kontrolleri daha rahat yapabilmek için 2 boyutlu hale dönüştürüp newCells dizisine atadım
    for (let i = 0; i < 9; i++) {
        newCells[i] = []
        for (let j = 0; j < 9; j++) {
            const index = i * 9 + j
            newCells[i][j] = cells[index]
        }
    }
    return [newCells, rowIndex, colIndex]
}

//seçilen hücrenin bulunduğu sütunun tamamı doğru ve dolu mu
function isColFull(newCells, colIndex) {
    for (let i = 0; i < 9; i++) {
        if (newCells[i][colIndex].textContent !== newCells[i][colIndex].getAttribute("data-cell-value")) {
            return false
        }
    }
    for (let k = 0; k < 9; k++) {
        if (newCells[k][colIndex].classList.contains("fullCell")) {
            newCells[k][colIndex].classList.remove("fullCell")
        }
        setTimeout(() => {//tüm sütun doluysa hücrelere fullcell animasyonu ekle
            newCells[k][colIndex].classList.add("fullCell")
        }, 100 * k);
    }

    return true//aynı sütundaki tüm hücreler doğru dolmuş
}

//seçilen hücrenin bulunduğu satırın tamamı doğru ve dolu mu
function isRowFull(newCells, rowIndex) {
    for (let i = 0; i < 9; i++) {
        if (newCells[rowIndex][i].textContent !== newCells[rowIndex][i].getAttribute("data-cell-value")) {
            return false
        }
    }
    for (let k = 0; k < 9; k++) {
        if (newCells[rowIndex][k].classList.contains("fullCell")) {
            newCells[rowIndex][k].classList.remove("fullCell")
        }
        setTimeout(() => {//tüm satır doluysa hücrelere fullcell animasyonu ekle
            newCells[rowIndex][k].classList.add("fullCell")
        }, 100 * k);
    }
    return true //aynı satırdaki tüm hücreler doğru dolmuş
}

//3*3 karenin tamamı doğru rakmlarla dolu mu
function isBoxFull(newCells, colIndex, rowIndex) {
    const startRow = Math.floor(rowIndex / 3) * 3;//seçili hücrenin bulunduğu 3*3 lük karenin ilk satır indisi
    const startCol = Math.floor(colIndex / 3) * 3;//seçili hücrenin bulunduğu 3*3 lük karenin ilk sütun indisi

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (newCells[startRow + i][startCol + j].textContent !== newCells[startRow + i][startCol + j].getAttribute("data-cell-value")) {
                return false;
            }
        }
    }
    for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
            if (newCells[startRow + k][startCol + l].classList.contains("fullCell")) {
                newCells[startRow + k][startCol + l].classList.remove("fullCell")
            }
            setTimeout(() => { //tüm 3*3 lük kare doluysa hücrelere fullcell animasyonu ekle
                newCells[startRow + k][startCol + l].classList.add("fullCell")
            }, 100 * k);
        }
    }
    return true;//3*3 lük karedeki tüm hücreler doğru dolmuş
}

function isGameFinished() {
    let isFinished = true
    cells.forEach(cell => {
        if (cell.textContent !== cell.getAttribute("data-cell-value")) {
            isFinished = false
        }
    })
    return isFinished
}
function displayWinScores() {
    const gameScoreSpan = document.getElementById("gameScore")
    const gameLevelSpan = document.getElementById("gameLevel")
    const gameHourSpan = document.getElementById("gameHour")
    const gameMinuteSpan = document.getElementById("gameMinute")
    const gameSecondSpan = document.getElementById("gameSecond")

    gameScoreSpan.textContent = score
    gameLevelSpan.textContent =selectLevels.value.charAt(0).toUpperCase()+selectLevels.value.slice(1);//Baş harfi büyük olsun diye
    gameSecondSpan.textContent = second > 9 ? second : "0" + second
    gameMinuteSpan.textContent = minute > 9 ? minute + ":" : "0" + minute + ":"
    gameHourSpan.style.visibility = hour > 0 ? "visible" : "hidden"
    gameHourSpan.textContent = hour > 9 ? hour + ":" : "0" + hour + ":"
}

function openWinModal() {
    winModal.style.display = "flex"
    displayWinScores()
}
