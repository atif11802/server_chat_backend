const users = []; // array of users

const addUser = ({ id, name, room }) => {
	const existUser = users.find(
		(user) => user.room === room && user.name === name
	);

	if (existUser) {
		return { error: "Username is taken" };
	}

	const user = { id, name, room };
	users.push(user);
	return { user };
};

const getUser = (id) => users.find((user) => user.id === id);

const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);

	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
};
const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, getUser, removeUser, getUsersInRoom };
