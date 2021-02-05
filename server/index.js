const express =require("express")
const http=require("http")
const socketio=require("socket.io")
const router=require("./router.js")
const app=express()
const cors=require("cors")
const {addUser,removeUser,getUser,getUsersInROom} =require('./users.js')


const server=http.createServer(app)
const io=socketio(server)
app.use(cors())

io.on("connection",(socket)=>{
  socket.on("join",({name,room},callback)=>{
    const {error,user}=addUser({id:socket.id,name,room})

    if(error) callback(error)

    socket.emit("message",{user:"admin",text:`${user.name},welcome to the room ${user.room}`})
    socket.broadcast.to(user.room).emit("message",{user:'admin',text:`${user.name} joined the chat!`})
    io.to(user.room).emit("roomData",{room:user.room,users:getUsersInROom(user.room)})
   
    socket.join(user.room)
    callback()
  })
  socket.on("sendMessage",(message,callback)=>{
    const user=getUser(socket.id)
    io.to(user.room).emit("message",{user:user.name,text:message})
    io.to(user.room).emit("roomData",{room:user.room,users:getUsersInROom(user.room)})
    callback()
  })

  socket.on("disconnect",()=>{
    const user=removeUser(socket.id)

    if(user){
      io.to(user.room).emit("message",{user:"admin",text:`${user.name} left the chat.`})
    }
  })
})
app.use(router)




const PORT=process.env.PORT||5000
server.listen(PORT,()=>console.log(`server runing on ${PORT}`))