import mongoose from "mongoose";
import Video from "../models/Video.js";

const home = async (req, res) => { 
    const videos = await Video.find({});
    console.log(videos);
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

    const video = await Video.findById(id);
    if (!video) {
        res.status(404).send("Video not found");
        return;
    }
    return res.render("watch", {pageTitle: video.title, video});
};

const getEdit = async (req, res) => {
    const id = getValidIdOr404(req, res);
    if (!id) return;

    const video = await Video.findById(id);
    if (!video) {
        res.status(404).send("Video not found");
        return;
    }

    return res.render("edit", {pageTitle: `Editing: ${video.title}`, video});
};

const postEdit = async (req, res) => {
    const id = getValidIdOr404(req, res);   
    if (!id) return;

    const {title, description, hashtags} = req.body;

    const video = await Video.exists({_id: id});
    if (!video) {
        res.status(404).send("Video not found");
        return;
    }

    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: hashtags
        .split(",").map((word) => word.startsWith("#") ? word : `#${word}`)
        .filter((word) => word.length > 0)
        .map((word) => word.trim())
    });
    return res.redirect(`/videos/${id}`);
};

const getUpload = (req, res) => {
    return res.render("upload", {pageTitle: "Upload Video"});
};

const postUpload = async (req, res) => {
    const {title, description, hashtags} = req.body;
     // Two ways to create a video
    // const video = new Video({
    try{
        await Video.create({
            title,
            description,
            hashtags: hashtags
                .split(",")
                .map((word) => word.trim())
                .filter((word) => word.length > 0)
                .map((word) => (word.startsWith("#") ? word : `#${word}`))
        });
        return res.redirect("/");
    } catch (error) {
        return res.render("upload", {pageTitle: "Upload Video", errorMessage: error.message});
    }
};

const search = (req, res) => res.send("Search");

const deleteVideo = (req, res) => {
    const id = getValidIdOr404(req, res);
    if (!id) return;
    return res.send(`Delete Video #${id}`);
};

export { home, watch, getEdit, postEdit, search, getUpload, postUpload, deleteVideo };   