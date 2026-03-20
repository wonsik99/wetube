let videos = [
    {
        title: "First Video",
        rating: 5,
        comments: 10,
        createdAt: "2 minutes ago",
        views: 1,
        id: 1,
    },
    {
        title: "Second Video",
        rating: 4,
        comments: 10,
        createdAt: "2 minutes ago",
        views: 1000,
        id: 2,
    },
    {
        title: "Third Video",
        rating: 4,
        comments: 10,
        createdAt: "2 minutes ago",
        views: 574,
        id: 3,
    },
];

const trending = (req, res) => {
    
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

    const video = videos[id - 1];
    return res.render("watch", {pageTitle: `Watching ${video.title}`, video});
};

const getEdit = (req, res) => {
    const id = getValidIdOr404(req, res);
    if (!id) return;

    const video = videos[id - 1];
    return res.render("edit", {pageTitle: `Editing: ${video.title}`, video});
};

const postEdit = (req, res) => {
    const id = getValidIdOr404(req, res);   
    if (!id) return;

    const {title} = req.body;
    videos[id - 1].title = title;
    
    return res.redirect(`/videos/${id}`);
};

const getUpload = (req, res) => {
    return res.render("upload", {pageTitle: "Upload Video"});
};

const postUpload = (req, res) => {
    const {title} = req.body;
    const newVideo = {
        title,
        rating: 0,
        comments: 0,
        createdAt: new Date(),
        views: 0,
        id: videos.length + 1,
    };
    videos.push(newVideo);
    return res.redirect("/");
};


const search = (req, res) => res.send("Search");

const deleteVideo = (req, res) => {
    const id = getValidIdOr404(req, res);
    if (!id) return;
    return res.send(`Delete Video #${id}`);
};

export { trending, watch, getEdit, postEdit, search, getUpload, postUpload, deleteVideo };   