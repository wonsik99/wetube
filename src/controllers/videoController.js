import mongoose from "mongoose";
import User from "../models/User.js";
import Video from "../models/Video.js";
import Comment from "../models/Comment.js";

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

  const video = await Video.findById(id).populate("owner").populate({
    path: "comments",
    populate: {
      path: "owner",
    },
  });
  if (!video) {
    res.status(404).send("Video not found");
    return;
  }
  return res.render("watch", { pageTitle: video.title, video });
};

const getEdit = async (req, res) => {
  const id = getValidIdOr404(req, res);
  const {
    user: { _id },
  } = req.session;
  if (!id) return;

  const video = await Video.findById(id);
  if (!video) {
    res.status(404).send("Video not found");
    return;
  }

  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authorized");
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
  const { video, thumbnail } = req.files;
  const { title, description, hashtags } = req.body;
  // Two ways to create a video
  // const video = new Video({
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].path,
      thumbnailUrl: thumbnail[0].path,
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
  if (!video) {
    return res
      .sendStatus(404)
      .json({ success: false, message: "Video not found" });
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  if (!user?._id) {
    return res.sendStatus(401);
  }

  if (!text?.trim()) {
    return res.sendStatus(400);
  }

  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text: text.trim(),
    owner: user._id,
    video: id,
  });

  await User.findByIdAndUpdate(user._id, {
    $push: { comments: comment._id },
  });
  await Video.findByIdAndUpdate(id, {
    $push: { comments: comment._id },
  });

  return res.status(201).json({
    success: true,
    newComment: {
      _id: comment._id,
      text: comment.text,
      createdAt: comment.createdAt,
      likesCount: 0,
      liked: false,
      owner: {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    },
  });
};

const deleteComment = async (req, res) => {
  const {
    session: { user },
    params: { id },
  } = req;

  if (!user?._id) {
    return res.sendStatus(401);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.sendStatus(404);
  }

  const comment = await Comment.findById(id);
  if (!comment) {
    return res.sendStatus(404);
  }

  if (String(comment.owner) !== String(user._id)) {
    return res.sendStatus(403);
  }

  await Comment.findByIdAndDelete(id);
  await User.findByIdAndUpdate(user._id, {
    $pull: { comments: comment._id },
  });
  await Video.findByIdAndUpdate(comment.video, {
    $pull: { comments: comment._id },
  });

  return res.sendStatus(200);
};

const likeComment = async (req, res) => {
  const {
    session: { user },
    params: { id },
  } = req;

  if (!user?._id) {
    return res.sendStatus(401);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.sendStatus(404);
  }

  const comment = await Comment.findByIdAndUpdate(
    id,
    { $addToSet: { likes: user._id } },
    { new: true },
  );
  if (!comment) {
    return res.sendStatus(404);
  }

  return res.status(200).json({
    success: true,
    liked: true,
    likesCount: comment.likes.length,
  });
};

const unlikeComment = async (req, res) => {
  const {
    session: { user },
    params: { id },
  } = req;

  if (!user?._id) {
    return res.sendStatus(401);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.sendStatus(404);
  }

  const comment = await Comment.findByIdAndUpdate(
    id,
    { $pull: { likes: user._id } },
    { new: true },
  );
  if (!comment) {
    return res.sendStatus(404);
  }

  return res.status(200).json({
    success: true,
    liked: false,
    likesCount: comment.likes.length,
  });
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
  createComment,
  deleteComment,
  likeComment,
  unlikeComment,
};
