const express = require('express');
const multer = require('multer');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const {
  createWork,
  updateWork,
  deleteWork,
  uploadImages,
  getAdminWorks,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/adminController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// All admin routes require authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Admin gallery management
router.get('/works', getAdminWorks);
router.post('/works', createWork);
router.put('/works/:id', updateWork);
router.delete('/works/:id', deleteWork);

// Image upload
router.post('/upload', upload.array('images', 10), uploadImages);

// Categories management (COMENTE ESTAS LINHA TEMPORARIAMENTE SE AINDA DER ERRO)
// router.get('/categories', getAdminCategories);
// router.post('/categories', createCategory);
// router.put('/categories/:id', updateCategory);
// router.delete('/categories/:id', deleteCategory);

module.exports = router;