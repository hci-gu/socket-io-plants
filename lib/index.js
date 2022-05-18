const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const http = require('http').Server(app)

let values = {}
app.get('/', (_, res) => res.send('hello'))
app.get('/values', (_, res) => {
  res.send({
    ...values,
  })
})
app.post('/values/:id', (req, res) => {
  values[req.params.id] = req.body.value
  res.send(values)
})
app.delete('/values/:id', (req, res) => {
  delete values[req.params.id]
  res.send(values)
})

const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

let sockets = {}
io.on('connection', (socket) => {
  console.log('socket connected!')
  sockets[socket.id] = socket

  socket.on('value', ({ id, value }) => {
    if (!values[id]) {
      values[id] = {
        id,
        value,
        listeners: [],
      }
    } else {
      values[id].value = value
    }
    values[id].listeners.forEach((socketId) => {
      if (sockets[socketId]) {
        sockets[socketId].emit('value', value)
      }
    })
    console.log('value', value)
  })

  socket.on('listen', ({ id }) => {
    if (values[id]) {
      values[id].listeners.push(socket.id)
    }
  })

  socket.on('disconnect', () => {
    console.log('socket disconnected!')
    Object.keys(values).forEach((id) => {
      const value = values[id]
      value.listeners = value.listeners.filter(
        (socketId) => socketId !== socket.id
      )
    })
    delete sockets[socket.id]
  })
})

http.listen(4000)
