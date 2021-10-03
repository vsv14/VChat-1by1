import React, { createContext, useState, useRef, useEffect } from 'react'
import { io } from 'socket.io-client'
import Peer from 'simple-peer'



const SocketContext = createContext();

// const socket = io('http://localhost:5000');
const socket = io('https://192.168.0.101:5000')


const ContextProvider = ({ children }) => {
    const [stream, setStream] = useState()
    const [me, setMe] = useState('')
    const [call, setCall] = useState({})
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState('');


    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();


    
    useEffect(()=>{

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream)
                

                myVideo.current.srcObject = currentStream
        })

      socket.on('msg', id =>{
        
          setMe(id)

          socket.emit('log', `Connect user: id ${id}`)
        })

      socket.on('calluser', ({from, name: callerName, signal})=>{
        socket.emit('log', `Call user me: id ${me} | from: id ${from}`)
        setCall({ isReceivingCall: true, from, name: callerName, signal });
      })
    }, [])

    const answerCall = () => {
        setCallAccepted(true);

        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on('signal', (data) => {
            socket.emit('log', `answerCall (Peer Signal) me: id ${me} | from: id ${call.from}`) 
            socket.emit('answercall', { signal: data, to: call.from }); 
        });

        peer.on('stream', (currentStream) => {
            socket.emit('log', `answerCall (Peer Stream) me: id ${me} | from: id ${call.from}`)
            userVideo.current.srcObject = currentStream;
        });

        socket.emit('log', `answerCall Peer.signal(call.from)`) 
        peer.signal(call.signal);

        connectionRef.current = peer;
    }

    const callUser = (id) => {
        const peer = new Peer({ initiator: true, trickle: false, stream });
        socket.emit('log', `callUser me: id ${me} calling to ${id}`)

        peer.on('signal', (data) => {
            socket.emit('log', `callUser (Peer.signal) me: id ${me} calling to ${id}`)
            socket.emit('calluser', { userToCall: id, signalData: data, from: me, name })
        })

        peer.on('stream', (currentStream) => {
            socket.emit('log', `callUser (Peer.stream) me: id ${me} calling to ${id}`)
            userVideo.current.srcObject = currentStream
        });

        socket.on('callaccepted', (signal) => {
            socket.emit('log', `callUser (callAccepted) me: id ${me} calling to ${id}`) 
            setCallAccepted(true)

            peer.signal(signal)
        })

        connectionRef.current = peer
    } 

    const leaveCall = () => {
        setCallEnded(true)

        connectionRef.current.destroy()

        window.location.reload()
    }

    return (
        <SocketContext.Provider value={{
          call,
          callAccepted,
          myVideo,
          userVideo,
          stream,
          name,
          setName,
          callEnded,
          me,
          callUser,
          leaveCall,
          answerCall,
        }}
        >
          {children}
        </SocketContext.Provider>
      )
}



export { ContextProvider, SocketContext }