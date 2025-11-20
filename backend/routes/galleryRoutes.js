const express = require('express');
const {
  getAllWorks,
  getWorkById,
  getCategories,
  searchWorks
} = require('../controllers/galleryController');

const router = express.Router();

// Public routes
router.get('/works', getAllWorks);
router.get('/works/:id', getWorkById);
router.get('/categories', getCategories);
router.get('/search', searchWorks);

module.exports = router;