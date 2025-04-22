const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Track usernames
let userCount = 0;
const userNames = {}; // socket.id => username

// Socket.IO logic
io.on("connection", (socket) => {
  // Assign a new username like User1, User2...
  userCount++;
  const username = `User${userCount}`;
  userNames[socket.id] = username;

  console.log(`${username} connected`);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);

    // Notify others in the room
    socket.to(roomId).emit("receiveMessage", {
      userId: "System",
      message: `${userNames[socket.id]} joined the chat.`, // Use the username here
    });
  });

  socket.on("sendMessage", ({ roomId, message }) => {
    io.to(roomId).emit("receiveMessage", {
      userId: userNames[socket.id], // Display the username, not the socket id
      message,
    });
  });

  socket.on("disconnect", () => {
    console.log(`${userNames[socket.id]} disconnected`);
    delete userNames[socket.id];
  });
});

http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
