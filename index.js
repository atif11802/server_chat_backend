const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
var macaddress = require("macaddress");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
	},
});
const cors = require("cors");
const { addUser, getUser, removeUser, getUsersInRoom } = require("./users");

app.get("/", (req, res) => {
	macaddress.all().then(function (all) {
		console.log(JSON.stringify(all, null, 2));
		res.send(JSON.stringify(all, null, 2));
	});
});

app.use(cors());

io.on("connection", (client) => {
	console.log("Client connected...");

	client.on("join", ({ name, room }, callback) => {
		const { error, user } = addUser({ id: client.id, name, room });

		if (error) {
			return callback(error);
		}

		client.join(user.room);
		client.broadcast.to(user.room).emit("message", {
			user: "admin",
			text: `${user.name} has joined!`,
		});

		client.emit("message", {
			user: "admin",
			text: `${user.name}, welcome to ${user.room}`,
		});

		client.on("typing", (name) => {
			client.broadcast.to(user.room).emit("typing", {
				name,
			});
		});

		client
			.to(user.room)
			.emit("roomData", { room: user.room, users: getUsersInRoom(user.room) });
	});

	client.on("sendMessage", (message, callback) => {
		const user = getUser(client.id);

		io.to(user.room).emit("message", { user: user.name, text: message });
		callback();
	});

	client.on("disconnect", () => {
		const removedUser = removeUser(client.id);

		if (removedUser) {
			client.to(removedUser.room).emit("message", {
				user: "admin",
				text: `${removedUser.name} has left.`,
			});
			client.to(removeUser.room).emit("roomData", {
				room: removeUser.room,
				users: getUsersInRoom(removedUser.room),
			});
		}
	});
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
