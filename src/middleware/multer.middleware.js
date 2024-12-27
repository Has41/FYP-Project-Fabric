import multer from "multer";

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/svg+xml', 
    'image/jpeg', 
    'image/png', 
    'model/gltf-binary' // MIME type for .glb files
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only SVG, JPG, PNG, and GLB files are allowed!"), false); // Reject the file
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-';
    cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
  }
});

export const upload = multer({ storage, fileFilter });
