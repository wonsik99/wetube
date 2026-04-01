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
    return res.status(400).render("join", {
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
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exist.",
    });
  }

  //check password
  const ok = user.socialOnly
    ? true
    : await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password.",
    });
  }

  //login
  req.session.loggedIn = true;
  req.session.user = user;

  return res.redirect("/");
};

const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
const postEdit = (req, res) => {
    return res.redner("edit-profile");
};

const remove = (req, res) => res.send("Remove User");
const see = (req, res) => res.send("See User");

const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};

const startGithubLogin = (req, res) => {
  const baseUrl = `https://github.com/login/oauth/authorize`;
  const config = {
    client_id: process.env.GITHUB_CLIENT_ID,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

const finishGithubLogin = async (req, res) => {
  const baseUrl = `https://github.com/login/oauth/access_token`;
  const config = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    //acess api
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();

    const email = emailData.find((email) => email.primary && email.verified);
    if (!email) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: email.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name ? userData.name : "Unknown",
        username: userData.login,
        email: email.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
  edit,
  remove,
  see,
  logout,
  startGithubLogin,
  finishGithubLogin,
};
