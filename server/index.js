const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const redis = require('socket.io-redis')
const port = process.env.PORT || 8080
const serverName = process.env.NAME || 'Unknown'

io.adapter(redis({ host: 'redis', port: 6379 }))

server.listen(port, function () {
  console.log(`Server listening at port ${port}`)
  console.log(`Server ${serverName} starter`)
});

app.use(express.static("public"))
// Routing
app.get('/', (req, res) => {
  res.sendFile("index.html")
})

// Chatroom

const numUsers = 0;

io.on('connection', function (socket) {
  socket.emit('my-name-is', serverName)

  const addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('chat message', (message) => {
    io.emit('chat message', message)
  })
})