import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
const app= express();

const server = http.createServer(app);
  
const users=new Map();
console.log(users.size)
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
      partnerId:null,
    }
    users.set(socket.id,user)
    console.log(users.size)
   
const pairUsers =(user,socket)=>
{
  const availableUsers=[...users].filter(([socketID,user])=>user.myId!=socket.id&&user.partnerId===null);
  const getRandomNumber=(n)=>
  {
    return Math.floor(Math.random()*n);
  }
  if(availableUsers.length>0)
  {
    let random=getRandomNumber(availableUsers.length)
  let partner=availableUsers[random]
  // user.partnerId=partner.myId;
  // partner.partnerId=user.myId;
  users.get(socket.id).partnerId=partner[0]
  users.get(partner[0]).partnerId=user.myId;
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
  io.to(me.partnerId).emit('skipped')
  users.get(me.partnerId).partnerId=null;
  me.partnerId=null;
  }
  catch(error)
  {
    console.log('error in ', socket.id)
  }
})
socket.on('gotTheVideo',()=>
{
  pairUsers(user,socket)
})
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
const socketData=socket.id;
    socket.on('offer',(data)=>
    {
       io.to(data.id).emit('answer',data,socketData)
    })
    socket.on('candidate',({candidate,partnerId})=>
    {
           
           io.to(partnerId).emit('candidates',candidate)
    })
    socket.on('sending answer',(data,socketData)=>
    {
      io.to(socketData).emit('receive answer',data)
    })
  
    socket.on('disconnect', () => {
     let me=users.get(socket.id)
     let other;
     if(!(me.partnerId))
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