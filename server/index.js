const express = require('express')
const app = express()
// One node.js -server is created with Express
const server = require('http').createServer(app)
// Socket.Io is attached to the web-server
const io = require('socket.io')(server)
const redis = require('socket.io-redis')
// In case there is no port set as the environment variable, 8080 will be used as a fallback
const port = process.env.PORT || 8080
// Each server is set an individual name for logging purposes
const serverName = process.env.NAME || 'Unknown'

// Setting up the RedisAdapter, so that messages can be relied between different server-nodes
io.adapter(redis({ host: 'redis', port: 6379 }))

server.listen(port, () => {
  console.log(`Server ${serverName} started`)
  console.log(`${serverName} listening at port ${port}`)
});

// Use the files in the public-folder (CSS, HTML, JS)
app.use(express.static("public"))

// Set the index.html to be found at "/"
app.get('/', (req, res) => {
  res.sendFile("index.html")
})


let amountOfUsers = 0

// Actions done by clients in the chat
io.on('connection', function (socket) {
  socket.emit('serverName', serverName)

  let addedUser = false

  // when a client send a new message, it will broadcasted to all rooms (to all clients)
  socket.on('chat message', (message) => {
    // we tell the client to execute 'chat message'
    socket.broadcast.emit('chat message', {
      username: socket.username,
      message: message
    })
  })

  // when a new client joins, this will be executed
  socket.on('new user', (username) => {
    if (addedUser) return

    // we store the username in the socket session for this client
    socket.username = username
    amountOfUsers = amountOfUsers + 1
    addedUser = true
    socket.emit('login', {
      amountOfUsers: amountOfUsers
    })
    console.log(socket.username + ' joined the chat')

    // broadcast to all rooms (all clients) that a user has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      amountOfUsers: amountOfUsers
    })
  })

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    console.log(socket.username + ' left the chat')
    if (addedUser) {
      amountOfUsers = amountOfUsers - 1

      // Tells the other clients that someone left the chat
      socket.broadcast.emit('user left', {
        username: socket.username,
        amountOfUsers: amountOfUsers
      })
    }
  })
})