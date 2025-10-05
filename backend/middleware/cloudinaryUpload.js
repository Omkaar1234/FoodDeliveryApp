// backend/middleware/cloudinaryUpload.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'YumExpress_Restaurants', // Folder name in your Cloudinary account
        allowed_formats: ['jpeg', 'png', 'jpg'],
        // Set public_id based on original file name or date
        public_id: (req, file) => file.originalname + '-' + Date.now(), 
    },
});

// Configure the upload middleware
const upload = multer({ storage: storage });

export default upload;