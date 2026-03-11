const join = (req, res) => res.send("Join");

const edit = (req, res) => res.send("Edit User");
const remove = (req, res) => res.send("Remove User");

export { join, edit, remove };