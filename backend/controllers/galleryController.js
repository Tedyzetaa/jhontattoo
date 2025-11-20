const { db, GALLERY_COLLECTION, CATEGORIES_COLLECTION } = require('../config/firebase');

// Get all tattoo works with optional filtering
const getAllWorks = async (req, res) => {
  try {
    const { category, style, limit = 20, page = 1 } = req.query;
    
    let query = db.collection(GALLERY_COLLECTION)
                 .where('published', '==', true)
                 .orderBy('createdAt', 'desc');

    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }
    if (style) {
      query = query.where('style', '==', style);
    }

    // Pagination
    const snapshot = await query.limit(parseInt(limit)).get();
    
    const works = [];
    snapshot.forEach(doc => {
      works.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: works,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: works.length
      }
    });
  } catch (error) {
    console.error('Error fetching works:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch works' 
    });
  }
};

// Get single work by ID
const getWorkById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection(GALLERY_COLLECTION).doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'Work not found' 
      });
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching work:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch work' 
    });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const snapshot = await db.collection(CATEGORIES_COLLECTION)
                           .where('active', '==', true)
                           .orderBy('name')
                           .get();
    
    const categories = [];
    snapshot.forEach(doc => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    });
  }
};

// Search works by tags or title
const searchWorks = async (req, res) => {
  try {
    const { q, tags } = req.query;
    
    let query = db.collection(GALLERY_COLLECTION)
                 .where('published', '==', true);

    // This is a simple implementation - Firestore has limitations on text search
    // For production, consider using Algolia or ElasticSearch
    const snapshot = await query.get();
    
    let works = [];
    snapshot.forEach(doc => {
      works.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Client-side filtering (basic implementation)
    if (q) {
      const searchTerm = q.toLowerCase();
      works = works.filter(work => 
        work.title?.toLowerCase().includes(searchTerm) ||
        work.description?.toLowerCase().includes(searchTerm) ||
        work.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      works = works.filter(work => 
        work.tags?.some(tag => tagArray.includes(tag.toLowerCase()))
      );
    }

    res.json({
      success: true,
      data: works,
      total: works.length
    });
  } catch (error) {
    console.error('Error searching works:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Search failed' 
    });
  }
};

module.exports = {
  getAllWorks,
  getWorkById,
  getCategories,
  searchWorks
};