import Video from "../models/Video.js";

const home = async (req, res) => { 
    const videos = await Video.find({});
    return res.render("home", { pageTitle: "Home", videos });
};

const getValidIdOr404 = (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
        res.status(404).send("Video not found");
        return null;
    }
    return id;
};

const watch = (req, res) => {
    const id = getValidIdOr404(req, res);
    if (!id) return;

    return res.render("watch", {pageTitle: `Watching ${video.title}`});
};

const getEdit = (req, res) => {
    const id = getValidIdOr404(req, res);
    if (!id) return;

    return res.render("edit", {pageTitle: `Editing: ${video.title}`});
};

const postEdit = (req, res) => {
    const id = getValidIdOr404(req, res);   
    if (!id) return;

    const {title} = req.body;
    
    return res.redirect(`/videos/${id}`);
};

const getUpload = (req, res) => {
    return res.render("upload", {pageTitle: "Upload Video"});
};

const postUpload = (req, res) => {
    const {title} = req.body;
   
    return res.redirect("/");
};


const search = (req, res) => res.send("Search");

const deleteVideo = (req, res) => {
    const id = getValidIdOr404(req, res);
    if (!id) return;
    return res.send(`Delete Video #${id}`);
};

export { home, watch, getEdit, postEdit, search, getUpload, postUpload, deleteVideo };   