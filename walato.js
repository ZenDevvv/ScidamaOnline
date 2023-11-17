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



const startPieces = [
    bkwh3, '', bp6, '', bkwh9, '', bp12, '', 
    '', bp8, '', bkwh11, '', bp4, '', bkwh1, 
    bkwh5, '', bp2, '', bkwh7, '', bp10, '', 
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', rp10, '', rkwh7, '', rp2, '', rkwh5, 
    rkwh1, '', rp4, '', rkwh11, '', rp8, '', 
    '', rp12, '', rkwh9, '', rp6, '', rkwh3, 
]



const startPieces1 = [
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', '', bp4, '', bp2, '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', '', rp4, '', rp2, '', '', '', 
    '', '', '', '', '', '', '', '', 
]

const startPieces2 = [
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', '', rp4, '', rp2, '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', '', bp4, '', bp2, '', '', '', 
    '', '', '', '', '', '', '', '', 
]