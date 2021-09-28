const activeUsers = [];

export const addUser = ({ room, username, avatar, userId, id }) => {
  const user = { room, username, avatar, id, userId };
  //   console.log(id);
  activeUsers.unshift(user);
  return user;
};

export const getCurrentUser = (id) =>
  activeUsers.find((user) => user.id === id);

export const userLeave = (id) => {
  const index = activeUsers.findIndex((user) => user.id === id);
  //   console.log(activeUsers[0].id);
  if (index !== -1) {
    return activeUsers.splice(index, 1)[0];
  }
};
export const getAllUsers = (room) =>
  activeUsers.filter((user) => user.room === room);
