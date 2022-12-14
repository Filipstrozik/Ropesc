const io = require('socket.io')();
// const io = require('socket.io')(3000);


const users = new Map()
var decisions = [] 
var noOfUsers = 0


io.on('connection', socket => {
    socket.on('new-user', name => {
        users[socket.id] = name
        users.set(socket.id, name)
        noOfUsers+=1
        console.log(`new user: ${name}, ${socket.id}`)
        socket.broadcast.emit('user-connected', name)
    })


    socket.on('send-chat-message', message => {
        console.log(`message: ${message}, name:${users.get(socket.id)}`)
        socket.broadcast.emit('chat-message', {message: message, name:users.get(socket.id)})
    })

    socket.on('clear-chat', () => {
        console.log('reset request...')
        resetDecisions()
        //better not to clear user chat only decisions
        io.emit('clear-user-chat')
    })

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users.get(socket.id))
        users.delete(socket.id)
        noOfUsers-=1
    })

    socket.on('send-selection', selection =>{
        var newDecision = {
            id: socket.id,
            selection: selection,
            win: false
        }
        decisions.push(newDecision);
        console.log('pushing new selection to decisions...')
        console.log(newDecision)
        console.log(` users: ${users.size}, decisions: ${decisions.length} `)
        if(users.size ===  decisions.length){
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
                    io.emit('chat-notify', {message: `${decisions.at(i).selection.emoji} Wygra??/a`, name:users[decisions.at(i).id]})//do
                    console.log('won:')
                    console.log(decisions.at(i)) 
                } else {
                    io.emit('chat-notify', {message: `${decisions.at(i).selection.emoji} Przegra??/a`, name:users[decisions.at(i).id]})//do
                    console.log('lost: ')
                    console.log(decisions.at(i)) 
                }
            }
            //doperio jak zostan?? pokazane wyniki to:
            //zablokuj wybieranie selekcji
            //pokaz przycisk "next round" albo cos
            //podobnie jak w przypadku selekcji, czekkaj az wszyscy dadz?? next round i dopiero wtedty wyczysc czat i w????cz selekcje
            delay(5000).then(() => io.emit('clear-chat'));
            resetDecisions()
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

function resetDecisions() {
    decisions = [];
}


io.listen(process.env.PORT || 3000);
