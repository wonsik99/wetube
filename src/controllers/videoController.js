import mongoose from "mongoose";
import User from "../models/User.js";
import Video from "../models/Video.js";

const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};

const getValidIdOr404 = (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).send("Video not found");
    return null;
  }
  return id;
};

const watch = async (req, res) => {
  const id = getValidIdOr404(req, res);
  if (!id) return;

  const video = await Video.findById(id).populate("owner");
  if (!video) {
    res.status(404).send("Video not found");
    return;
  }
  return res.render("watch", { pageTitle: video.title, video });
};

const getEdit = async (req, res) => {
  const id = getValidIdOr404(req, res);
  const {user: {_id}} = req.session;
  if (!id) return;

  const video = await Video.findById(id);
  if (!video) {
    res.status(404).send("Video not found");
    return;
  }

  if (String(video.owner) !== String(_id)) {
    res.status(403).send("Forbidden");
    return redirect("/");
  }
  return res.render("edit", { pageTitle: `Editing: ${video.title}`, video });
};

const postEdit = async (req, res) => {
  const id = getValidIdOr404(req, res);
  if (!id) return;

  const { title, description, hashtags } = req.body;

  const video = await Video.exists({ _id: id });
  if (!video) {
    res.status(404).send("Video not found");
    return;
  }

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { file } = req;
  const { title, description, hashtags } = req.body;
  // Two ways to create a video
  // const video = new Video({
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: file.path,
      hashtags: Video.formatHashtags(hashtags),
      owner: _id,
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    await user.save();
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error.message,
    });
  }
};

const deleteVideo = async (req, res) => {
  const id = getValidIdOr404(req, res);
  if (!id) return;
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: keyword,
        $options: "i",
      },
    }).populate("owner");
  }
  return res.render("search", {
    pageTitle: "Search",
    videos,
    keyword: keyword || "",
  });
};

const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if(!video) {
    return res.sendStatus(404).json({ success: false, message: "Video not found" });
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export {
  home,
  watch,
  getEdit,
  postEdit,
  search,
  getUpload,
  postUpload,
  deleteVideo,
  registerView,
};
