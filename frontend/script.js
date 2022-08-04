const socket = io('https://fathomless-gorge-06353.herokuapp.com/');
// const socket = io('https://localhost:3000');


const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const selectionButtons = document.querySelectorAll('[data-selection]')
const resetButton = document.getElementById('reset-button')

const SELECTIONS = [
    {
      name: 'rock',
      emoji: '✊',
      beats: 'scissors'
    },
    {
      name: 'paper',
      emoji: '✋',
      beats: 'rock'
    },
    {
      name: 'scissors',
      emoji: '✌',
      beats: 'paper'
    }
  ]

const name = prompt('Jak masz na imię?')
appendMessage(`${name} Dołączyłeś!`, "center");
socket.emit('new-user', name) // wyslanie imienia uzytkownika

selectionButtons.forEach(selectionButton => {
    selectionButton.addEventListener('click', e => {
        const selectionName = selectionButton.dataset.selection
        const selection = SELECTIONS.find(selection => selection.name === selectionName)
        makeSelection(selection)
        const buttons = document.querySelectorAll('.selection')
        buttons.forEach(btn => btn.style.pointerEvents = 'none')
    })
})

resetButton.addEventListener('click', e => {
    socket.emit('clear-chat')
})



function makeSelection(selection){
    appendMessage(`Wybrales ${selection.emoji}`, "center")
    socket.emit('send-selection', selection)
    //make selections disabled
}

socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`, "left")
})

socket.on('chat-notify', data => {
    appendMessage(`${data.name}: ${data.message}`, "center")
})

socket.on('user-connected', name => {
    appendMessage(`${name} joined`, "center")
})

socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`, "center")
})

socket.on('clear-user-chat', () => {
    clearChat()
})

messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`Ty: ${message}`, "right")
    socket.emit('send-chat-message', message)
    messageInput.value = ''
})

function appendMessage(message, position) {
    const messageElement = document.createElement('div')
    messageElement.className = 'msg'
    if(position === "right" ){
        messageElement.style.color = "#1e81b0";
        messageElement.style.textAlign = "right";
    }
    if(position === "center"){
        messageElement.style.color = "#cc0000";
        messageElement.style.textAlign = "center";
    }
    messageElement.innerText = message
    messageContainer.append(messageElement)
    move_down()
}

function move_down() {
    const El = document.getElementById('message-container')
    El.scrollTo({top: El.scrollHeight, behavior: 'smooth'});
  }

function clearChat() {
    const divs = document.querySelectorAll('.msg')
    console.log('cleared chat')
    divs.forEach(e => {
        e.remove()
    })
    const buttons = document.querySelectorAll('.selection')
    buttons.forEach(btn => btn.style.pointerEvents = 'auto');
}
