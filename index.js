const express = require('express')
const https = require('https')
const cors = require('cors')
const fs = require('fs')
const path = require('path')



const app = express()
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const server = https.createServer({
    key: fs.readFileSync('./ssl/server.key'),
    cert: fs.readFileSync('./ssl/server.cert')
  }, app)



var whitelist = ['https://192.168.0.101:5000', 'http://localhost:3000', 'localhost:3000', 'https://localhost:5000', undefined]
var corsOptions = {
  origin: function (origin, callback) {
      console.log(origin)
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const io = require('socket.io')(server,
    // { cors: {...corsOptions, methods: ['GET', 'POST']}}
    {
        cors: {    origin: whitelist,    methods: ["GET", "POST"]  }
    }
)



const PORT = process.env.PORT || 5000


app.use(express.static(path.join(__dirname, 'client/build')))

app.use(cors(corsOptions))

app.get('/', (req, res)=>{
    res.sendFile(path.resolve(__dirname, 'client/build', 'index.html'))
})

app.get('/getUsers', (req, res)=>{    
    
    res.json({...Array.from(io.sockets.adapter.sids.keys())})
})

io.on('connect', socket =>{
    socket.emit('msg', socket.id)

    socket.on('log', (msg)=> {
        console.log('Log massege: ', msg)
    })

    socket.on('calluser', ({ userToCall, signalData, from, name })=> {
        io.to(userToCall).emit('calluser', {signal: signalData, from, name})
    })

    socket.on('answercall', (data)=> {
        io.to(data.to).emit('callaccepted', data.signal)
    })
    
    socket.on('disconnect', ()=> {
        socket.broadcast.emit('callended')
    })
})



server.listen(PORT, ()=> console.log('Server running...'))