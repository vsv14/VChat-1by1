import React from 'react'
import {Typography, AppBar} from '@material-ui/core'
import { makeStyles } from '@material-ui/core'

import VideoPlayer from './components/VideoPlayer'
import Notifications from './components/Notifications'
import Options from './components/Options'



const useStyles = makeStyles(theme=>{
    return (
        {
            appBar: {
                
                margin: '20px 20px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '300px',
                border: '3px solid #252525',
                background:'#000',
            
                [theme.breakpoints.down('xs')]: {
                  width: '90%',
                },
              },
              image: {
                marginLeft: '15px',
              },
              wrapper: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              },
        }
    )
})

function App() {
    const classes = useStyles()



    return (
        <div >
            <div>
                <AppBar className={classes.appBar} position='static' color='inherit'>
                    <Typography style={{fontSize:'16pt', fontWeight:'900', color:'white'}} variant='h4' align='center' >videoChat</Typography>
                </AppBar>
            </div>


            <div className={classes.wrapper}>
                <VideoPlayer/>
                <Options>
                    <Notifications/>
                </Options>
            </div>            
        </div>
    )
}

export default App
