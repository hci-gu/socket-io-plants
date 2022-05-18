const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const http = require('http').Server(app)

app.get('/', (req, res) => res.send('hello'))

const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log('socket connected!')

  socket.on('value', (value) => {
    console.log('value', value)
  })
})

http.listen(4000)
