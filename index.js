import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
const app= express();

const server = http.createServer(app);
  
const users=new Map();

const io = new Server(server,{cors:{origin:'*'}});
app.use(cors());
io.on('connection', (socket) => {
    console.log('A user connected',socket.id);
 
  socket.on('error',(error)=>
  {
    console.log('server side error',error)
  })

    let user={
      myId:socket.id,
      partnerId:null
    }
  
    
   
const pairUsers =(user,socket)=>
{
  const availableUsers=[...users].filter(([socketID,user])=>user.myId!=socket.id&&user.partnerId===null);
  console.log("availableusers ", availableUsers.length)
  const getRandomNumber=(n)=>
  {
    return Math.floor(Math.random()*n);
  }
  if(availableUsers.length>0)
  {
    let random=getRandomNumber(availableUsers.length)
  let partner=availableUsers[random]
  
  users.get(socket.id).partnerId=partner[0]
  users.get(partner[0]).partnerId=user.myId;
  console.log('partner found')
  //console.log(users);
  socket.emit('partner found',partner[1].myId)
  io.to(partner[0]).emit('save partner',socket.id);
  }
  else{
    console.log("waiting for connection");
  }
}     

socket.on('skipped',()=>
{
  try{
    
  let me=users.get(socket.id)
  io.to(me.partnerId).emit('skipped');
  console.log('done')
   users.get(me.partnerId).partnerId=null;
   users.delete(me.partnerId);

   me.partnerId=null;

  users.delete(socket.id);
 

  console.log(users)
  }
  catch(error)
  {
    console.log('error in ', socket.id)
  }
})
socket.on('gotTheVideo',()=>
{
  console.log("users")
  console.log(user)
  users.set(socket.id,user);
  console.log(users)
  user.partnerId=null;
    pairUsers(user,socket)

  
})

     




  
    socket.on('chat message', (msg) => {
     // console.log('Message:', msg);
      io.emit('chat message', msg);
    });
const socketData=socket.id;
    socket.on('offer',(data)=>
    {
      console.log(data.id)
      console.log("received offer ")
  
       io.to(data.id).emit('answer',data,socketData)
    })
    socket.on('candidate',({candidate})=>
    {
           
          let me=users.get(socket.id)
           io.to(me.partnerId).emit('candidates',candidate)
    })
    socket.on('sending answer',(data,socketData)=>
    {
      io.to(socketData).emit('receive answer',data)
    })
  

    socket.on('disconnect', () => {
      let me=users.get(socket.id)
      let other;
      if(!(me?.partnerId))
      {
      
      }
      else{
       other=users.get(me.partnerId)
       if(other){
         other.partnerId=null;
       }
      }
       users.delete(socket.id)
       console.log('A user disconnected');
      
     });
  });

app.use(express.json());
app.get('/',(req,res)=>
{
    res.send('hello');
}
)
const port=8080;
server.listen(port,() => {
    console.log(`listening to ${port}`);
})