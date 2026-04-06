const express = require("express");
const path = require("path");
const http = require("http");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Proper server setup
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

const socketConnected = new Set();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ Add user
  socketConnected.add(socket.id);
  io.emit("client-total", socketConnected.size);

  // ✅ Message
  socket.on("message", (data) => {
    socket.broadcast.emit("chat-message", data);
  });

  // ✅ Typing
  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });

  // ✅ Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    socketConnected.delete(socket.id);

    // ❗ FIX: emit inside disconnect
    io.emit("client-total", socketConnected.size);
  });
});

// ✅ Start server
server.listen(PORT, () => {
  console.log("Server is running on Port", PORT);
});
