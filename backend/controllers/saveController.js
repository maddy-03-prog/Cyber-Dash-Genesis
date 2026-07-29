const GameSave = require('../models/GameSave');

exports.saveCloudData = async (req, res) => {
  try {
    const { saveData } = req.body;
    let save = await GameSave.findOne({ userId: req.user.id });

    if (save) {
      save.saveData = saveData;
      save.updatedAt = Date.now();
      await save.save();
    } else {
      save = await GameSave.create({ userId: req.user.id, saveData });
    }

    res.json({ success: true, message: 'Cloud save synced successfully', updatedAt: save.updatedAt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loadCloudData = async (req, res) => {
  try {
    const save = await GameSave.findOne({ userId: req.user.id });
    if (!save) {
      return res.status(404).json({ success: false, message: 'No cloud save found' });
    }
    res.json({ success: true, saveData: save.saveData, updatedAt: save.updatedAt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
