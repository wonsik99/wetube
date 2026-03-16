const join = (req, res) => res.send("Join");
const edit = (req, res) => res.send("Edit User");
const remove = (req, res) => res.send("Remove User");
const login = (req, res) => res.send("Login");
const see = (req, res) => res.send("See User");
const logout = (req, res) => res.send("Logout");

export { join, edit, remove, login, see, logout };