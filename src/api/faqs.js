const express = require('express');
const monk = require('monk');
const Joi = require('joi');

const db = monk(process.env.MONGO_URI);
const faqs = db.get('faqs');

const schema = Joi.object({
  question: Joi.string().trim().required(),
  answer: Joi.string().trim().required(),
  video_url: Joi.string().uri(),
});

const router = express.Router();

// Read all
router.get('/', async (req, res) => {
  const items = await faqs.find({});
  res.json(items);
});

// Read One
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  const item = await faqs.findOne({
    _id: id,
  });
  if (!item) return next();
  return res.json(item);
});

// Create One
router.post('/', async (req, res) => {
  const value = await schema.validateAsync(req.body);
  const inserted = await faqs.insert(value);
  res.json(inserted);
});

// Update One
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const value = await schema.validateAsync(req.body);
    await faqs.findOne({
      _id: id,
    });

    const updated = await faqs.update(
      {
        _id: id,
      },
      {
        $set: value,
      }
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete One
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await faqs.remove({ _id: id });
    res.status(200).send('Success');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
