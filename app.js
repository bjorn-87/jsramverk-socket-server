const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// var allMessages = [];

function applyZeros(date) {
    if (date <= 9) {
        return "0" + date;
    }
    return date;
};

function formatedDate() {
    let date = new Date();
    let formatedDate =  applyZeros(date.getHours()) + ":" +
                        applyZeros(date.getMinutes());

    return formatedDate
};

io.origins(['https://socket-client.bjos19.me:443'])
// io.origins(['http://localhost:3000'])

io.on('connection', function (socket) {
    console.info('User connected');

    socket.on('chat message', function (message) {
        let messages = "";

        // messages = `${formatedDate()} ${message.user}: ${message.message}`;
        messages = {
            time: formatedDate(),
            msg: message.message,
            user: message.user
        }

        // allMessages.push(messages);

        io.emit('chat message', messages);
    });

});

server.listen(8300);
