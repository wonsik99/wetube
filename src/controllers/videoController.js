const trending = (req, res) => res.render("home", { pageTitle: "Home" });

const getValidIdOr404 = (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
        res.status(404).send("Video not found");
        return null;
    }
    return id;
};

const see = (req, res) => {
    const id = getValidIdOr404(req, res);
    if (!id) return;
    return res.render("watch");
};

const edit = (req, res) => {
    const id = getValidIdOr404(req, res);
    if (!id) return;
    return res.render("edit");
};

const search = (req, res) => res.send("Search");
const upload = (req, res) => res.send("Upload Video");

const deleteVideo = (req, res) => {
    const id = getValidIdOr404(req, res);
    if (!id) return;
    return res.send(`Delete Video #${id}`);
};

export { trending, see, edit, search, upload, deleteVideo };   