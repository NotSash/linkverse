const cloudinary = require('cloudinary').v2;

/**
 * Configure Cloudinary for image uploads
 * Supports profile pictures, background images, and OG images
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;