const app = require('express')()
const cluster = require('cluster')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const redis = require('socket.io-redis')

const express = require('express')
app.use(express.static("public"))
const numCPUs = require('os').cpus().length


const PORT = process.env.PORT || 8080
const HOST = '0.0.0.0'

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`)
  console.log(`Number of CPUs available: ${numCPUs}`)
}

app.get('/', (req, res) => {
  res.sendFile("index.html")
})

io.on('connection', (socket) => {
  socket.on('chat message', (message) => {
    io.emit('chat message', message)
  })
})

http.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)