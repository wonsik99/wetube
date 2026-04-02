import User from "../models/User.js";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
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

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
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

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const pageTitle = "Edit Profile";
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;

  const currentUser = await User.findById(_id);

  // check username
  if (username !== currentUser.username) {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).render("edit-profile", {
        pageTitle,
        errorMessage: "Username already exists",
      });
    }
  }

  // check email
  if (email !== currentUser.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render("edit-profile", {
        pageTitle,
        errorMessage: "Email already exists",
      });
    }
  }

  // update user
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        name,
        email,
        username,
        location,
        avatarUrl: file ? file.path : avatarUrl,
      },
      { new: true },
    );
    req.session.user = updatedUser;
    return res.redirect("/users/edit");
  } catch (error) {
    if (error.code === 11000) {
      const field = error.keyPattern?.username
        ? "Username"
        : error.keyPattern?.email
          ? "Email"
          : "Field";
      return res.status(400).render("edit-profile", {
        pageTitle,
        errorMessage: `${field} already exists`,
      });
    }
    throw error;
  }
};

export const remove = (req, res) => res.send("Remove User");
export const see = (req, res) => res.send("See User");

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
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

export const finishGithubLogin = async (req, res) => {
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

export const getChangePassword = (req, res) => {
  if (req.session.user?.socialOnly) {
    return res.redirect("/");
  }
  return res.render("change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;

  // check old password
  const ok = await bcrypt.compare(oldPassword, password);
  if (!ok) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "Old password is incorrect",
    });
  }

  // check new password
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "Passwords do not match",
    });
  }

  // update password
  const user = await User.findById(_id);
  user.password = newPassword;
  await user.save();
  req.session.user = user;

  // send notification
  return res.redirect("/users/logout");
};
