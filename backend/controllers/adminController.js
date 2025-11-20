const { db, bucket, GALLERY_COLLECTION, CATEGORIES_COLLECTION } = require('../config/firebase');

// Upload images to Firebase Storage
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No files uploaded' 
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const filename = `tattoos/${Date.now()}-${file.originalname}`;
      const fileUpload = bucket.file(filename);

      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (error) => {
          reject(error);
        });

        blobStream.on('finish', async () => {
          // Make the file public
          await fileUpload.makePublic();
          
          // Get public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
          
          resolve({
            originalName: file.originalname,
            filename: filename,
            url: publicUrl,
            size: file.size,
            contentType: file.mimetype
          });
        });

        blobStream.end(file.buffer);
      });
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} files`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Upload failed' 
    });
  }
};

// Create new tattoo work
const createWork = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      style,
      tags,
      images,
      published = false
    } = req.body;

    // Validation
    if (!title || !images || images.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and at least one image are required' 
      });
    }

    const workData = {
      title,
      description: description || '',
      category,
      style: style || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',') : []),
      images: Array.isArray(images) ? images : [images],
      published: Boolean(published),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.uid
    };

    const docRef = await db.collection(GALLERY_COLLECTION).add(workData);

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...workData
      },
      message: 'Work created successfully'
    });
  } catch (error) {
    console.error('Create work error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create work' 
    });
  }
};

// Update tattoo work
const updateWork = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Don't allow updating these fields
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.createdBy;

    updateData.updatedAt = new Date().toISOString();

    await db.collection(GALLERY_COLLECTION).doc(id).update(updateData);

    // Get updated document
    const doc = await db.collection(GALLERY_COLLECTION).doc(id).get();

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      },
      message: 'Work updated successfully'
    });
  } catch (error) {
    console.error('Update work error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update work' 
    });
  }
};

// Delete tattoo work
const deleteWork = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(GALLERY_COLLECTION).doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'Work not found' 
      });
    }

    // Optional: Delete associated images from storage
    const workData = doc.data();
    if (workData.images && Array.isArray(workData.images)) {
      const deletePromises = workData.images.map(async (imageUrl) => {
        try {
          // Extract filename from URL and delete from storage
          const filename = imageUrl.split('/').pop();
          if (filename) {
            await bucket.file(`tattoos/${filename}`).delete();
          }
        } catch (storageError) {
          console.warn('Failed to delete image from storage:', storageError);
          // Continue even if image deletion fails
        }
      });
      await Promise.allSettled(deletePromises);
    }

    await db.collection(GALLERY_COLLECTION).doc(id).delete();

    res.json({
      success: true,
      message: 'Work deleted successfully'
    });
  } catch (error) {
    console.error('Delete work error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete work' 
    });
  }
};

// Get all works for admin (including unpublished)
const getAdminWorks = async (req, res) => {
  try {
    const snapshot = await db.collection(GALLERY_COLLECTION)
                           .orderBy('createdAt', 'desc')
                           .get();
    
    const works = [];
    snapshot.forEach(doc => {
      works.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: works
    });
  } catch (error) {
    console.error('Error fetching admin works:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch works' 
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, active = true } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category name is required' 
      });
    }

    const categoryData = {
      name,
      description: description || '',
      active: Boolean(active),
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid
    };

    const docRef = await db.collection(CATEGORIES_COLLECTION).add(categoryData);

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...categoryData
      },
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create category' 
    });
  }
};


// [...] (o resto do código que já existe)

// Categories management - ADICIONE ESTAS FUNÇÕES
const getAdminCategories = async (req, res) => {
  try {
    const snapshot = await db.collection(CATEGORIES_COLLECTION)
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

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (typeof active !== 'undefined') updateData.active = Boolean(active);

    updateData.updatedAt = new Date().toISOString();

    await db.collection(CATEGORIES_COLLECTION).doc(id).update(updateData);

    const doc = await db.collection(CATEGORIES_COLLECTION).doc(id).get();

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      },
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update category' 
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection(CATEGORIES_COLLECTION).doc(id).delete();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete category' 
    });
  }
};

// CERTIFIQUE-SE DE EXPORTAR TODAS AS FUNÇÕES NO FINAL:
module.exports = {
  uploadImages,
  createWork,
  updateWork,
  deleteWork,
  getAdminWorks,
  getAdminCategories,    // ADICIONE ESTA LINHA
  createCategory,        // ADICIONE ESTA LINHA
  updateCategory,        // ADICIONE ESTA LINHA
  deleteCategory         // ADICIONE ESTA LINHA
};