const io = require('socket.io')({
    cors: {
        credentials: true,
        origin: "https://chic-eclair-d591d6.netlify.app/"
    },
});


// const io = require('socket.io')({
//     cors: {
//         origin: "*"
//     },
// });

const users = {}
var decisions = [] // lista obiektow typu seleckja 
var noOfUsers = 0


io.on('connection', socket => {
    socket.on('new-user', name => {
        users[socket.id] = name
        noOfUsers+=1
        socket.broadcast.emit('user-connected', name)
    })
    // console.log('new user')
    // socket.emit('chat-message', 'Hello World')
    socket.on('send-chat-message', message => {
        socket.broadcast.emit('chat-message', {message: message, name:users[socket.id]})
    })
    socket.on('disconnect',() => {
        socket.broadcast.emit('user-disconnected', users[socket.id])
        delete users[socket.id]
        noOfUsers-=1
    })
    socket.on('send-selection', selection =>{
        // decisions[socket.id] = selection
        var newDecision = {
            id: socket.id,
            selection: selection,
            win: false
        }
        decisions.push(newDecision);
        if(noOfUsers === decisions.length){
            console.log('Sprawdzam!')
            for(var i = 0; i < decisions.length; i++){
                for(var j = i+1; j < decisions.length; j++){
                    var one = isWinner(decisions.at(i).selection, decisions.at(j).selection)
                    if(one){
                        decisions.at(i).win = true;
                        // console.log(decisions.at(i))
                    }
                    var sec = isWinner(decisions.at(j).selection, decisions.at(i).selection)
                    if(sec){
                        decisions.at(j).win = true;
                        // console.log(decisions.at(j))
                    }
                    // console.log(one)
                    // console.log(sec)
                }
            }
            for(var i = 0; i<decisions.length; i++){
                if(decisions.at(i).win){
                    io.emit('chat-message', {message: `${decisions.at(i).selection.emoji} Wygrał/a`, name:users[decisions.at(i).id]})//do
                    console.log(decisions.at(i)) 
                } else {
                    io.emit('chat-message', {message: `${decisions.at(i).selection.emoji} Przegrał/a`, name:users[decisions.at(i).id]})//do
                }

            }
            delay(5000).then(() => io.emit('clear-chat'));
            decisions = []
        } else {
            socket.broadcast.emit('chat-message', {message: 'is ready!', name:users[socket.id]})
        }
        
    })
})




function isWinner(selection, opponentSelection){
    return selection.beats === opponentSelection.name;
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

io.listen(process.env.PORT || 3000);