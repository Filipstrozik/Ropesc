const IS_PROD = process.env.NODE_ENV === "production";
const URL = IS_PROD ? "https://fathomless-gorge-06353.herokuapp.com" : "http://localhost:5000";
const socket = io(URL);


// const socket = io('https://fathomless-gorge-06353.herokuapp.com/')

const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const selectionButtons = document.querySelectorAll('[data-selection]')

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
appendMessage(`${name} Dołączyłeś!`);
socket.emit('new-user', name)

selectionButtons.forEach(selectionButton => {
    selectionButton.addEventListener('click', e => {
        const selectionName = selectionButton.dataset.selection
        const selection = SELECTIONS.find(selection => selection.name === selectionName)
        makeSelection(selection)
    })
})

function makeSelection(selection){
    appendMessage(`Wybrales ${selection.emoji}`)
    socket.emit('send-selection', selection)
}

socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
    appendMessage(`${name} joined`)
})

socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`)
})

socket.on('clear-chat', () => {
    const divs = document.querySelectorAll('.msg')
    console.log('cleared chat')
    divs.forEach(e => {
        e.remove()
    });
    
})

messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`Ty: ${message}`)
    socket.emit('send-chat-message', message)
    messageInput.value = ''
})

function appendMessage(message) {
    const messageElement = document.createElement('div')
    messageElement.className = 'msg'
    messageElement.innerText = message
    messageContainer.append(messageElement)
}

