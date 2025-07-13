import multer from "multer";
import path from "path";

// Simplified MIME types with clear comments
const allowedTypes = {
  images: ['image/svg+xml', 'image/jpeg', 'image/png'],
  models: [
    'model/gltf-binary',  // .glb files
    'application/octet-stream',  // Fallback for some GLB uploads
    'model/gltf+json'
  ]
};

const fileFilter = (req, file, cb) => {
  const acceptedTypes = [...allowedTypes.images, ...allowedTypes.models];
  
  if (acceptedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${acceptedTypes.join(', ')} are allowed`), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

export const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});