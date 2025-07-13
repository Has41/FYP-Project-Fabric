
function designerOnly(req, res, next) {
    if (req.user.role !== "designer") {
        return res.status(403).json({ message: "Only admins can access this route" });
    }
    next();
}

export { designerOnly };