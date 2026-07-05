const Media = require('../models/Media');

exports.uploadMedia = async (req, res) => {
  try {
    const { targetId, targetType, url, isPrimary } = req.body;
    
    // If primary, ensure no other primary exists for this target
    if (isPrimary) {
      await Media.updateMany({ targetId, targetType }, { isPrimary: false });
    }

    const media = await Media.create({
      ownerId: req.user.userId,
      targetId,
      targetType,
      url,
      isPrimary
    });
    
    res.status(201).json(media);
  } catch (err) {
    res.status(400).json({ error: 'Media upload failed' });
  }
};
