// controllers/stageController.js
exports.getStreamStatus = (req, res) => {
    res.status(200).json({ message: "Stage is live and ready for broadcast." });
};
