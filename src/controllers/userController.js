import User from "../models/User.js";
import bcrypt from "bcrypt";

const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

const postJoin = async (req, res) => {
  const { name, email, username, password, password2, location } = req.body;

  const pageTitle = "Join";
  if (password !== password2) {
    return res
      .status(400)
      .render("join", { pageTitle, errorMessage: "Passwords do not match" });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res
      .status(400)
      .render("join", {
        pageTitle,
        errorMessage: "Username/email already exists",
      });
  }

  try {
    await User.create({
      name,
      email,
      username,
      password,
      location,
    });

    return res.redirect("/login");
  } catch (error) {
    return res
      .status(400)
      .render("join", { pageTitle, errorMessage: error._message });
  }
};

const getLogin = (req, res) => res.render("login", { pageTitle: "Login" });

const postLogin = async (req, res) => {
  const pageTitle = "Login";
  const { username, password } = req.body;

  //check user exists
  const user = await User.findOne({ username });
  if (!user) {
    return res
      .status(400)
      .render("login", {
        pageTitle,
        errorMessage: "An account with this username does not exist.",
      });
  }

  //check password
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res
      .status(400)
      .render("login", {
        pageTitle,
        errorMessage: "Wrong password.",
      });
  }

  //login
  req.session.loggedIn = true;
  req.session.user = user;
  
  return res.redirect("/");
};

const edit = (req, res) => res.send("Edit User");
const remove = (req, res) => res.send("Remove User");
const see = (req, res) => res.send("See User");
const logout = (req, res) => res.send("Logout");

export { getJoin, postJoin, getLogin, postLogin, edit, remove, see, logout };
