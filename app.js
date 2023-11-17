const socket = io('https://scidamaonline.onrender.com')
const gameBoard = document.querySelector("#gameboard")
const playerDisplay = document.querySelector("#player")
const infoStatus = document.querySelector("#info")
const width = 8




const infoDisplay = document.querySelector("#info-display")
const userContainer = document.getElementById('user-container')
const gameContainer = document.querySelector('#game-container')


const roomForm = document.querySelector('#room-form')
const nameInput = document.querySelector('#name-input')
const roomInput = document.querySelector('#room-input')
const createButton = document.getElementById("create-button");
const findButton = document.getElementById("find-button");
let player1 = ''
let player2 = ''
let roomId = ''
let playerColor = '' 
let opponentColor = ''
let yourTurn = false
let pieceJumping = ''
gameContainer.style.display = 'None'
let roomCreated = false // prevents the same user joining after creating a room
 
/// ----------------------------------------------------------SOCKET ON
socket.on('room-created', roomId => {
    const notif = document.querySelector('#notif')
    const waiting = document.createElement('div')
    waiting.textContent = 'Waiting for other players...'
    notif.textContent = `Room ID:${roomId}`
    notif.appendChild(waiting)
    roomCreated = true
})


socket.on('show-player2', (playerId, roomId) => {  // join room
    gameContainer.style.display = 'block'
    roomForm.style.display = 'None'

    player2 = playerId
    socket.emit('player1-joined', player1, roomId)
    updateOpponentInfo()
    createPlayerBoard()
})

socket.on('show-player1', (playerId, roomId) => {
    player2 = playerId
    gameContainer.style.display = 'block'
    roomForm.style.display = 'None'
    updateOpponentInfo()
    createPlayerBoard()
})

socket.on('opponent-disconnected', () => {
    window.alert('Opponent disconnected')
    location.reload();
})


socket.on('moved-piece-id', pieceId => {
    const draggedPiece = document.querySelector(`#${pieceId.draggedElementId}`)
    const targetSquare = document.querySelector(`[square-id="${pieceId.targetId}"]`)
    
    targetSquare.append(draggedPiece)
    scanPrioEat()
})
socket.on('make-king', piece => {
    console.log(piece)
    const targetSquare = document.querySelector(`#${piece}`)
    makeKing(targetSquare, opponentColor)
})


socket.on('remove-piece', removedPieceId => {
    const pieceToRemove = document.querySelector(`#${removedPieceId}`)
    removePiece(pieceToRemove)
})

socket.on('change-player-opponent', () => {
    yourTurn = true
    playerDisplay.textContent = playerColor
    if(opponentColor === 'red'){
        gameboard.style.borderColor = "#006791";
    }else{
        gameboard.style.borderColor = "#9C090C";
    }

})





createButton.addEventListener('click', e => { // create room
    e.preventDefault()
    playerColor = 'red'
    opponentColor = 'blue'
    playerDisplay.textContent = playerColor
    const name = nameInput.value
    const room = roomInput.value
    roomId = room
    player1 = name
    yourTurn = true
    console.log(name, room)
    
    
    socket.emit('create-room', name, room, roomExists => {
        const notif = document.querySelector('#notif')
        notif.textContent = roomExists
        setTimeout(() => notif.textContent = '', 2000)
        console.log(roomExists) //cannot create room, roomId already exist
    })
})


findButton.addEventListener('click', e => {
    e.preventDefault()

    if(!roomCreated){
        playerColor = 'blue'
        opponentColor = 'red'
        playerDisplay.textContent = opponentColor
        
        const name = nameInput.value
        const room = roomInput.value
        player2 = name
        console.log(name, room)
    
        socket.emit('join-room', name, room, roomFull => {
            const notif = document.querySelector('#notif')
            notif.textContent = roomFull
            setTimeout(() => notif.textContent = '', 2000)
            console.log(roomFull) //cannot join room, room contains 2 players
        })
    }
})


function updateOpponentInfo() {
    const opponent = document.querySelector('#opponent')
    opponent.textContent = `playing against ${player2}`
}






function appendUser(user){
    const userElement = document.createElement('div')
    userElement.innerText = user
    userContainer.append(userElement)
}



const startPieces2 = [
    rkwh3, '', rp6, '', rkwh9, '', rp12, '', 
    '', rp8, '', rkwh11, '', rp4, '', rkwh1, 
    rkwh5, '', rp2, '', rkwh7, '', rp10, '', 
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', bp10, '', bkwh7, '', bp2, '', bkwh5, 
    bkwh1, '', bp4, '', bkwh11, '', bp8, '', 
    '', bp12, '', bkwh9, '', bp6, '', bkwh3, 
]


const startPieces1 = [
    bkwh3, '', bp6, '', bkwh9, '', bp12, '', 
    '', bp8, '', bkwh11, '', bp4, '', bkwh1, 
    bkwh5, '', bp2, '', bkwh7, '', bp10, '', 
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', rp10, '', rkwh7, '', rp2, '', rkwh5, 
    rkwh1, '', rp4, '', rkwh11, '', rp8, '', 
    '', rp12, '', rkwh9, '', rp6, '', rkwh3, 
]


const operator = [
    'multiply', '', 'divide','', 'subtract','', 'add','',
    '', 'divide','', 'multiply', '','add','', 'subtract',
    'subtract', '', 'add', '', 'multiply', '', 'divide','',
    '', 'add', '', 'subtract', '', 'divide','', 'multiply',
    'multiply', '', 'divide','', 'subtract','', 'add','',
    '', 'divide','', 'multiply', '','add','', 'subtract',
    'subtract', '', 'add', '', 'multiply', '', 'divide','',
    '', 'add', '', 'subtract', '', 'divide','', 'multiply'
]



function createBoard() {
    
    if(playerColor === 'red'){
        chips = startPieces1
    }else{
        chips = startPieces2
    }

    chips.forEach((startPieces, i) => {
        const square = document.createElement('div')
        square.classList.add('square')
        square.setAttribute('square-id', (width * width -1)-i)
        

        const row = Math.floor( (63 - i) / 8) + 1
        if( row % 2 === 0){
            square.classList.add(i % 2 === 0 ? "white" : "green")
        } else {
            square.classList.add(i % 2 === 0 ? "green" : "white")
        }

        // ----------------------------adding piece---------------------------
        square.innerHTML = startPieces
        square.firstChild?.setAttribute('draggable', true)
        if ( i <= 23){
            if(square.firstChild){
                if(playerColor === 'red'){
                    square.firstChild.firstChild.classList.add("blue")
                }else{
                    square.firstChild.firstChild.classList.add("red")
                }
            }
        }
        if ( i >= 40){
            if(square.firstChild){
                if(playerColor === 'red'){
                    square.firstChild.firstChild.classList.add("red")
                }else{
                    square.firstChild.firstChild.classList.add("blue")
                }
            }
        }

        // --------------------adding operator on the board ---------------------------
        const op = operator[i]
        if (op) {
            square.classList.add(op);
        }
        gameBoard.append(square)
    })
}

function createPlayerBoard(playerColor){
    createBoard(playerColor)

    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach(square => {
        square.addEventListener('dragstart', dragStart)
        square.addEventListener('dragover', dragOver)
        square.addEventListener('drop', dragDrop)
        square.addEventListener('mouseover', mouseOver)
        square.addEventListener('mouseout', mouseOut)
        square.addEventListener('click', mouseClick)
        square.addEventListener('touchstart', touchStart)
    })
}

function touchStart(e){
    if(normalValidMoves.includes(e.target)){// DRAG DROP
        if(priorityEat.length){
            e.target.append(clickedElement)
            pieceJumping  = clickedElement

            if(clickedElement.classList.contains('king')){
                for (const [eatenPiece, eatenMoves] of captureInfo) {
                    console.log(eatenPiece,eatenMoves)
                    if(eatenMoves.includes(e.target)){
                        socket.emit('remove-piece', eatenPiece.getAttribute('id'))
                        removePiece(eatenPiece)
                        console.log(true)
                    }else[
                        console.log(false)
                    ]

                    const isCapture = kingValidMoves(clickedElement)
                    if(!isCapture){
                        changePlayer()
                        socket.emit('change-player')
                    }
                }
            }else{
                for (const [eatenPiece, eatenMoves] of captureInfo) {
                    if(eatenMoves === e.target){
                        socket.emit('remove-piece', eatenPiece.getAttribute('id'))
                        removePiece(eatenPiece)
                    }
                }
                const isCapture = checkNormalCaptures(e.target.firstChild)
                if(!isCapture){
                    if(upLimit.includes(Number(e.target.getAttribute('square-id')))){
                        makeKing(clickedElement, playerColor)
                        socket.emit('make-king', clickedElement.getAttribute('id'))
                    }
                    changePlayer()
                    socket.emit('change-player')
                }
            }
            
            socket.emit('move-piece', {draggedElementId: clickedElement.getAttribute('id'), targetId: e.target.getAttribute('square-id')}) 
            scanPrioEat()

        }else{
            e.target.append(clickedElement)
            socket.emit('move-piece', {draggedElementId: clickedElement.getAttribute('id'), targetId: e.target.getAttribute('square-id')}) 
            if(upLimit.includes(Number(e.target.getAttribute('square-id')))){
                makeKing(clickedElement, playerColor)
                console.log(clickedElement)
                socket.emit('make-king', clickedElement.getAttribute('id'))
            }
            changePlayer()
            socket.emit('change-player')
            
        }
        clearValid()
        yellowToNormal()


    }else if(yourTurn && e.target.firstChild && e.target.firstChild.classList.contains(playerColor)){ //drag start
        clickedElement = e.target
        const isKing = clickedElement.classList.contains('king')

       
        if(priorityEat.length){
            if(priorityEat.includes(e.target)){
                if(isKing){
                    redToNormal()
                    kingValidMoves(clickedElement)
                    drawValidMoves(normalValidMoves) 

                }else{
                    redToNormal()
                    checkNormalCaptures(clickedElement)
                    drawValidMoves(normalValidMoves)
                }
                
            }else{
                drawPrioEat()
                yellowToNormal()
                playSoundEffect('move-illegal001')
            }

        }else {
            if(isKing){
                normalValidMoves = []
                yellowToNormal()
                kingValidMoves(clickedElement)
                drawValidMoves(normalValidMoves)   

            }else{
                normalValidMoves = []
                yellowToNormal()
                checkNormalValidMoves(clickedElement)
                drawValidMoves(normalValidMoves)   
            }
        }  
    }else{
        yellowToNormal()
    }
}


function mouseClick(e){
     if(e.target.classList.contains('piece')){
        // setTimeout(() => transparentize(e), 2000)
        // e.target.style.opacity = .5
//  --------  all piece becomes king (for testing only. comment this out)----
        // const kingImage = document.createElement('img');
        // kingImage.src = 'assets/red_crown.png'; 
        // kingImage.classList.add('king-image');
        // e.target.classList.add('king')
        // e.target.appendChild(kingImage);
// -------------------------------------------------------------------------
    }
}

function scanPrioEat(){
    priorityEat = []
    if(pieceJumping){
        priorityEat.push(pieceJumping)
    } else {
        const pieces = document.querySelectorAll('.piece')
        pieces.forEach(piece => {
            if(piece.firstChild.classList.contains(playerColor)){
                const isKing = piece.classList.contains('king')
                if(isKing){
                    let isCapture = kingValidMoves(piece)
                    if(isCapture){
                        priorityEat.push(piece)
                    }
                }else{
                    let isCapture = checkNormalCaptures(piece)
                    if(isCapture){
                        priorityEat.push(piece)
                    }
                }
                
            }
        })
        clearValid()
    }
}


let priorityEat = []
let normalValidMoves = []
let kingCaptureMoves = null
const captureInfo = new Map()
let draggedElement = ''
let clickedElement = ''
//  ----------------------------------------------EVENT HANDLERS ---------------------------------------------

function dragStart (e) {
    if(yourTurn && e.target.firstChild.classList.contains(playerColor)){
        draggedElement = e.target;
        const isKing = draggedElement.classList.contains('king')
        e.dataTransfer.setDragImage(draggedElement, 37,37);
        if(isKing){
            if(priorityEat.includes(draggedElement)){
                redToNormal()
                kingValidMoves(draggedElement)
                drawValidMoves(normalValidMoves)
            }else if(priorityEat.length === 0) {
                console.log(true)
                kingValidMoves(draggedElement)
                drawValidMoves(normalValidMoves)
            }
            else{
                drawPrioEat()
                playSoundEffect('move-illegal001')
            }

        } else {
            if(priorityEat.includes(draggedElement)){
                redToNormal()
                checkNormalCaptures(draggedElement)
                drawValidMoves(normalValidMoves)
            }else if(priorityEat.length === 0){
                checkNormalValidMoves(draggedElement)
                drawValidMoves(normalValidMoves)
            }else{
                drawPrioEat()
                playSoundEffect('move-illegal001')
            }
        }
    }else{
        playSoundEffect('move-illegal001')
    }
}

function dragOver (e){
    e.preventDefault()
}

function dragDrop (e) {
    e.stopPropagation()

    if(priorityEat.length){ // if there is to capture
        if(priorityEat.includes(draggedElement) && normalValidMoves.includes(e.target)){
            e.target.append(draggedElement)
            pieceJumping  = draggedElement
            
            if(draggedElement.classList.contains('king')){
                for (const [eatenPiece, eatenMoves] of captureInfo) {
                    console.log(captureInfo)
                    if(eatenMoves.includes(e.target)){
                        socket.emit('remove-piece', eatenPiece.getAttribute('id'))
                        removePiece(eatenPiece)
                    }
                }
                const isCapture = kingValidMoves(draggedElement)
                if(!isCapture){
                    changePlayer()
                    socket.emit('change-player')
                }

                 
            }else {
                for (const [eatenPiece, eatenMoves] of captureInfo) {
                    if(eatenMoves === e.target){
                        socket.emit('remove-piece', eatenPiece.getAttribute('id'))
                        removePiece(eatenPiece)
                    }
                }

                const isCapture = checkNormalCaptures(e.target.firstChild)
                if(!isCapture){
                    if(upLimit.includes(Number(e.target.getAttribute('square-id')))){
                        makeKing(draggedElement, playerColor)
                        socket.emit('make-king', draggedElement.getAttribute('id'))
                    }
                    changePlayer()
                    socket.emit('change-player')
                }
            }
            
            socket.emit('move-piece', {draggedElementId: draggedElement.getAttribute('id'), targetId: e.target.getAttribute('square-id')}) 

            
        }

    }else{
        if(normalValidMoves.includes(e.target)){
            e.target.append(draggedElement)
            if(upLimit.includes(Number(e.target.getAttribute('square-id')))){
                makeKing(draggedElement, playerColor)
                socket.emit('make-king', draggedElement.getAttribute('id'))
            }
            socket.emit('move-piece', {draggedElementId: draggedElement.getAttribute('id'), targetId: e.target.getAttribute('square-id')})    
            socket.emit('change-player')
            changePlayer()
        }
    }
    
    clearValid()
    yellowToNormal()
    scanPrioEat()
}


function kingValidMoves(draggedElement){
    const state1 = upleftKing(draggedElement)
    const state2 = uprightKing(draggedElement)
    const state3 = downleftKing(draggedElement)
    const state4 = downrightKing(draggedElement)

    if(state1 || state2 || state3 || state4){
        normalValidMoves = []

        if(state1){
            kingCaptureMoves = []
            upleftKing(state1.firstChild)
            kingCaptureMoves.forEach(moves => {
                normalValidMoves.push(moves)
            })
            captureInfo.set(state1.firstChild, kingCaptureMoves)
        }
        if(state2){
            kingCaptureMoves = []
            uprightKing(state2.firstChild)
            kingCaptureMoves.forEach(moves => {
                normalValidMoves.push(moves)
            }) 
            captureInfo.set(state2.firstChild, kingCaptureMoves)
        }
        if(state3){
            kingCaptureMoves = []
            downleftKing(state3.firstChild)
            kingCaptureMoves.forEach(moves => {
                normalValidMoves.push(moves)
            }) 
            captureInfo.set(state3.firstChild, kingCaptureMoves)
        }
        if(state4){
            kingCaptureMoves = []
            downrightKing(state4.firstChild)
            kingCaptureMoves.forEach(moves => {
                normalValidMoves.push(moves)
            }) 
            captureInfo.set(state4.firstChild, kingCaptureMoves)
        }

        return true
    }
}

function upleftKing(draggedElement){
    if(upLeftLimit(draggedElement.parentNode)){
        let upleft = getSquareOnUpLeft(draggedElement.parentNode)
        while(!upleft.firstChild){ // loop while empty, stops if there's a piece
            if(kingCaptureMoves === null){
                if(!upLeftLimit(upleft)){
                    normalValidMoves.push(upleft)
                    break
                }else{
                    normalValidMoves.push(upleft)
                }
            }else{
                if(!upLeftLimit(upleft)){
                    kingCaptureMoves.push(upleft)
                    break
                }else{
                    kingCaptureMoves.push(upleft)
                }
            }
            upleft = getSquareOnUpLeft(upleft)
        } 
        if(upleft.firstChild && upleft.firstChild.firstChild.classList.contains(opponentColor) && upLeftLimit(upleft) && !getSquareOnUpLeft(upleft).firstChild) { // if piece is ooponent and the next square is empty (can be eaten)
            return upleft
        }else{
            return false
        }
    }
}

function uprightKing(draggedElement) {
    if(upRightLimit(draggedElement.parentNode)){
        let upright = getSquareOnUpRight(draggedElement.parentNode)
        while(!upright.firstChild){ // stops if there's a piece
            if(kingCaptureMoves === null){
                if(!upRightLimit(upright)){
                    normalValidMoves.push(upright)
                    break
                }else{
                    normalValidMoves.push(upright)
                }
            }else{
                if(!upRightLimit(upright)){
                    kingCaptureMoves.push(upright)
                    break
                }else{
                    kingCaptureMoves.push(upright)
                }
            }
            upright = getSquareOnUpRight(upright)
        }
        if(upright.firstChild && upright.firstChild.firstChild.classList.contains(opponentColor) && upRightLimit(upright) && !getSquareOnUpRight(upright).firstChild) {// if piece is ooponent and the next square is empty (can be eaten)
            return upright
        }else{
            return false
        }
    }
}

function downleftKing(draggedElement){
    if(downLeftLimit(draggedElement.parentNode)){
        let downleft = getSquareOnDownLeft(draggedElement.parentNode)
        while(!downleft.firstChild){ // stops if there's a piece
            if(kingCaptureMoves === null) {
                if(!downLeftLimit(downleft)){
                    normalValidMoves.push(downleft)
                    break
                }else{
                    normalValidMoves.push(downleft)
                }
            }else{
                if(!downLeftLimit(downleft)){
                    kingCaptureMoves.push(downleft)
                    break
                }else{
                    kingCaptureMoves.push(downleft)
                }
            }
            downleft = getSquareOnDownLeft(downleft)
        }
        if(downleft.firstChild && downleft.firstChild.firstChild.classList.contains(opponentColor) && downLeftLimit(downleft) && !getSquareOnDownLeft(downleft).firstChild) {// if piece is ooponent and the next square is empty (can be eaten)
            return downleft
        }else{
            return false
        }
    }
}

function downrightKing(draggedElement) {
    if(downRightLimit(draggedElement.parentNode)){
        let downright = getSquareOnDownRight(draggedElement.parentNode)
        while(!downright.firstChild){ // stops if there's a piece
            if(kingCaptureMoves === null){
                if(!downRightLimit(downright)){
                    normalValidMoves.push(downright)
                    break
                }else{
                    normalValidMoves.push(downright)
                }
            }else{
                if(!downRightLimit(downright)){
                    kingCaptureMoves.push(downright)
                    break
                }else{
                    kingCaptureMoves.push(downright)
                }
            }
            downright = getSquareOnDownRight(downright)
        }
        if(downright.firstChild && downright.firstChild.firstChild.classList.contains(opponentColor) && downRightLimit(downright) && !getSquareOnDownRight(downright).firstChild) {// if piece is ooponent and the next square is empty (can be eaten)
            return downright
        }else{
            return false
        }
    }
}




function checkNormalValidMoves(selectedElement){
    const selectedElementParent = selectedElement.parentNode
    const upleft = getSquareOnUpLeft(selectedElementParent)
    const upright = getSquareOnUpRight(selectedElementParent)
    if(priorityEat.length === 0){
        if(!upleft.firstChild && upLeftLimit(selectedElementParent)){
            normalValidMoves.push(upleft)
        }
        if(!upright.firstChild && upRightLimit(selectedElementParent)){
            normalValidMoves.push(upright)
        }
    }
    
}

function checkNormalCaptures(pieceElement) {
    let isCapture = false
    const pieceElementParent = pieceElement.parentNode

    const upleft = getSquareOnUpLeft(pieceElementParent)
    if(upleft !== null){
        const upleftSkip = getSquareOnUpLeft(upleft)
        if(upleftSkip !== null){
            if(upLeftLimit(pieceElementParent) && upLeftLimit(upleft) && upleft.firstChild && upleft.firstChild.firstChild.classList.contains(opponentColor) && !upleftSkip.firstChild){
                normalValidMoves.push(upleftSkip)
                isCapture = true
        
                captureInfo.set(upleft.firstChild, upleftSkip)
            }
        }
    }
   

    const upright = getSquareOnUpRight(pieceElementParent)
    if(upright !== null){
        const uprightSkip = getSquareOnUpRight(upright)
        if(uprightSkip !== null){
            if(upRightLimit(pieceElementParent) && upRightLimit(upright) && upright.firstChild && upright.firstChild.firstChild.classList.contains(opponentColor) && !uprightSkip.firstChild){
                normalValidMoves.push(uprightSkip)
                isCapture = true
                
                captureInfo.set(upright.firstChild, uprightSkip)
            }
        }
    }
    

    const downleft = getSquareOnDownLeft(pieceElementParent)
    if(downleft !== null){
        const downleftSkip = getSquareOnDownLeft(downleft)
        if(downleftSkip !== null){
            if(downLeftLimit(pieceElementParent) && downLeftLimit(downleft) && downleft.firstChild && downleft.firstChild.firstChild.classList.contains(opponentColor) && !downleftSkip.firstChild){
                normalValidMoves.push(downleftSkip)
                isCapture = true
        
                captureInfo.set(downleft.firstChild, downleftSkip)
            }
        }
    }
    
    
    
    const downright = getSquareOnDownRight(pieceElementParent)
    if(downright !== null){
        const downrightSkip = getSquareOnDownRight(downright)
        if(downrightSkip !== null){
            if(downRightLimit(pieceElementParent) && downRightLimit(downright) && downright.firstChild && downright.firstChild.firstChild.classList.contains(opponentColor) && !downrightSkip.firstChild){
                normalValidMoves.push(downrightSkip)
                isCapture = true
        
                captureInfo.set(downright.firstChild, downrightSkip)
            }
        }
    }
    
    return isCapture
}

















function getSquareOnUpLeft(pieceSquare){
    const pieceSquareId = Number(pieceSquare.getAttribute('square-id'))
    const upleftSquare = document.querySelector(`[square-id="${pieceSquareId + width + 1}"]`)
    return upleftSquare
}

function getSquareOnUpRight(pieceSquare){
    const pieceSquareId = Number(pieceSquare.getAttribute('square-id'))
    const uprightSquare = document.querySelector(`[square-id="${pieceSquareId + width - 1}"]`)
    return uprightSquare
}

function getSquareOnDownLeft(pieceSquare){
    const pieceSquareId = Number(pieceSquare.getAttribute('square-id'))
    const downleftSquare = document.querySelector(`[square-id="${pieceSquareId - width + 1}"]`)
    return downleftSquare
}

function getSquareOnDownRight(pieceSquare){
    const pieceSquareId = Number(pieceSquare.getAttribute('square-id'))
    const downrightSquare = document.querySelector(`[square-id="${pieceSquareId - width - 1}"]`)
    return downrightSquare
}

function removePiece(piece) {
    piece.remove()
}

function makeKing(piece, player){
    // playSoundEffect('move-promotion001')

    const kingImage = document.createElement('img');
    if(player == 'blue'){
        kingImage.src = 'assets/blue_crown.png'; // Set the path to your crown image
    }else{
        kingImage.src = 'assets/red_crown.png'; // Set the path to your crown image
    }
    kingImage.classList.add('king-image');
  
    piece.classList.add('king')
    piece.appendChild(kingImage);
}

function changePlayer() {
    playerDisplay.textContent = opponentColor
    if(opponentColor === 'blue'){
        gameboard.style.borderColor = "#006791";
    }else{
        gameboard.style.borderColor = "#9C090C";
    }
    yourTurn = false
    pieceJumping = ''
    changeBorder()
}

function changeBorder(){
    
}



function clearValid(){
    normalValidMoves = []
    draggedElement = ''
    clickedElement = ''
    captureInfo.clear()
    kingCaptureMoves = null
}

function playSoundEffect(soundEffectId){
    const soundEffect = document.getElementById(soundEffectId)
    soundEffect.play()
}

function mouseOver(e){
    if(yourTurn && e.target.firstChild && e.target.firstChild.classList.contains(playerColor)){
        e.target.parentNode.classList.add('yellow')
    }
}

function mouseOut(e){
    if(yourTurn && e.target.firstChild && e.target.firstChild.classList.contains(playerColor)){
        e.target.parentNode.classList.remove('yellow')

    }
}

function drawPrioEat(){
    priorityEat.forEach(square => {
        square.parentNode.classList.add('red')
    })
}

function drawValidMoves(validMoves){
    validMoves.forEach(square => {
        square.classList.add('yellow')
    })
}

function yellowToNormal(){
    const yel = document.querySelectorAll('.square.yellow')
    yel.forEach(squares => {
        squares.classList.remove('yellow')
    })
}

function redToNormal(){
    const red = document.querySelectorAll('.square.red')
    red.forEach(squares => {
        squares.classList.remove('red')
    })
}

const upLimit = [56, 57, 58, 59, 60, 61, 62, 63]
const leftLimit = [7, 15, 23, 31, 39, 47, 55, 63]
const downLimit = [0, 1, 2, 3, 4, 5, 6, 7]
const rightLimit = [0, 8, 16, 24, 32, 40, 48, 56]



function upLeftLimit(square){   // if the square is not on edge
    if(leftLimit.includes(Number(square.getAttribute('square-id'))) ||
    upLimit.includes(Number(square.getAttribute('square-id')))){
        return false
    }else{
        return true
    }
}

function upRightLimit(square){  // if the square is not on edge
    if(rightLimit.includes(Number(square.getAttribute('square-id'))) ||
    upLimit.includes(Number(square.getAttribute('square-id')))){
        return false
    }else{
        return true
    }
}

function downLeftLimit(square){ // if the square is not on edge
    if(leftLimit.includes(Number(square.getAttribute('square-id'))) ||
    downLimit.includes(Number(square.getAttribute('square-id')))){
        return false
    }else{
        return true
    }
}

function downRightLimit(square){    // if the square is not on edge
    if(rightLimit.includes(Number(square.getAttribute('square-id'))) ||
    downLimit.includes(Number(square.getAttribute('square-id')))){
        return false
    }else{
        return true
    }
}

// function revertIds() {
//     const allSquares = document.querySelectorAll(".square")
//     allSquares.forEach((square, i) => square.setAttribute('square-id', i))
// }

// function reverseIds() {
//     const allSquares = document.querySelectorAll(".square")
//     allSquares.forEach((square, i) => 
//         square.setAttribute('square-id', (width * width -1)-i))
// }
