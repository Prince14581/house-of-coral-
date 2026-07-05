const Variant = require('../models/Variant');

exports.addVariant = async (req, res) => {
  try {
    const variant = await Variant.create({ ...req.body });
    res.status(201).json(variant);
  } catch (err) {
    res.status(400).json({ error: 'Variant creation failed' });
  }
};

exports.getVariantsByProduct = async (req, res) => {
  const { productId } = req.params;
  const variants = await Variant.find({ productId });
  res.status(200).json(variants);
};
