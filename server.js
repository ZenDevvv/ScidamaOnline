// const { instrument } = require('@socket.io/admin-ui')

const io = require('socket.io')(3000, {
    cors: {
        origin: "*"
    }
})

const existingRooms = new Map();
const reverse = 63




io.on('connection', socket => {

    socket.on('create-room', (playerName, roomId, cb) => {
        if (!existingRooms.has(roomId)  && roomId !== '' && playerName !== '') {
            const roomData = {
                player1: { name: playerName, socketId: socket.id },
                player2: null, // Initialize player2 as null
            };
            existingRooms.set(roomId, roomData);
            socket.join(roomId);
            socket.emit('room-created', roomId);
        } else {
            cb('Room already exist!');
        }

        console.log(existingRooms)
    })
 

    socket.on('join-room', (playerName, roomId, cb) => {
        const roomData = existingRooms.get(roomId);
        console.log(roomData)
        if(roomData) {
            if(!roomData.player2){
                roomData.player2 = { name: playerName, socketId: socket.id };
                socket.join(roomId);
                socket.to(roomId).emit('show-player2', playerName, roomId);
                
            }else{
                cb('Room already full!')
            }
        }else{
            cb('Room does not exist!')
        }
        console.log(existingRooms)
    });

    socket.on('player1-joined', (playerName ,roomId) => {
        socket.to(roomId).emit('show-player1', playerName ,roomId)
    })
 
    socket.on('move-piece', pieceId => {
        pieceId.targetId = reverse-pieceId.targetId // reverse players move
        existingRooms.forEach((roomData, roomId) => {
            if((roomData.player1 && roomData.player1.socketId === socket.id) || (roomData.player2 && roomData.player2.socketId === socket.id)){ //find the room with the same socket.id of players inside
                socket.to(roomId).emit('moved-piece-id', pieceId); // emit the reversed move to the opponent,
            }
        })
    })

    socket.on('remove-piece', removedPieceId => {
        existingRooms.forEach((roomData, roomId) => {
            if((roomData.player1 && roomData.player1.socketId === socket.id) || (roomData.player2 && roomData.player2.socketId === socket.id)){ //find the room with the same socket.id of players inside
                socket.to(roomId).emit('remove-piece', removedPieceId); // emit the reversed move to the opponent,
            }
        })
    })

    socket.on('change-player', () => {
        existingRooms.forEach((roomData, roomId) => {
            if((roomData.player1 && roomData.player1.socketId === socket.id) || (roomData.player2 && roomData.player2.socketId === socket.id)){ //find the room with the same socket.id of players inside
                socket.to(roomId).emit('change-player-opponent'); // emit the reversed move to the opponent,
            }
        })
    })
    
    socket.on('make-king', piece => {
        console.log(piece)
        existingRooms.forEach((roomData, roomId) => {
            if((roomData.player1 && roomData.player1.socketId === socket.id) || (roomData.player2 && roomData.player2.socketId === socket.id)){ //find the room with the same socket.id of players inside
                socket.to(roomId).emit('make-king', piece); // emit the reversed move to the opponent,
            }
        })
    })
 
 

   

    socket.on('disconnect', () => {
        console.log('A user disconnected');  
        existingRooms.forEach((roomData, roomId) => {
            console.log('roomdata',roomData, 'id',roomId)
            if (roomData.player1 && roomData.player1.socketId === socket.id) {
                socket.to(roomId).emit('opponent-disconnected');
                existingRooms.delete(roomId);
            } else if (roomData.player2 && roomData.player2.socketId === socket.id) {
                socket.to(roomId).emit('opponent-disconnected');
                existingRooms.delete(roomId);
            }
        });
        console.log(existingRooms)

    });
})
 

// instrument(io, { auth: false } )