const multer = require('multer');
const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     // const ext = path.extname(file.originalname).toLowerCase();
//     // const fileName = file.originalname.toLowerCase().split(' ').join('-') + '-' + Date.now() + ext;
//     // cb(null, fileName);
//     cb(null, Date.now() + '-' + file.originalname); // Nom unique pour chaque fichier

//   }
// });

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, uniqueSuffix + path.extname(file.originalname));
  },
})

 

const upload = multer({ storage:storage });

module.exports = { upload };
