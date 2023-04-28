const multer = require('multer');
const path = require('path');
const fs=require('fs')




function createUploadMiddleware(destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
  });

  function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|mp4|mov|pdf|files/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
  
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      return cb('Error: Images, Videos, and PDFs Only!');
    }
  }
  

  return function (req, res, next) {
    const uploadType = req.query.uploadType || 'single'; 
    const uploadMethod = uploadType === 'single' ? 'single' : 'array';
    const upload = multer({
      storage: storage,
      limits: { fileSize: 1024 * 1024 * 500 }, 
      fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
      },
    }).fields([{ name: 'photo', maxCount: 1 }, { name: 'video', maxCount: 1 },{ name: 'pdf', maxCount: 1 },{name:'file',maxCount:1}]);

    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ message: 'Multer Error: ' + err.message });
      } else if (err) {
        return res.status(500).json({ message: 'Error: ' + err });
      }
      next();
    });
  };
}


// const uploadFacultyPhoto = createUploadMiddleware('./faculty/');
const uploadFacultyPhoto = createUploadMiddleware('./Images/faculty/');
const uploadStudentPhoto = createUploadMiddleware('./student/');
const uploadAnnouncement = createUploadMiddleware('./announcement/');
const galleryUpload= createUploadMiddleware('./Images/gallery/')
const videoUpload=createUploadMiddleware('./Videos/')
const pdfUpload=createUploadMiddleware('./pdf/')
const tenderpdf=createUploadMiddleware('./tender/')
const corrigendum=createUploadMiddleware('./tender/corrigendum/')

module.exports = { uploadFacultyPhoto, uploadStudentPhoto,uploadAnnouncement,galleryUpload,videoUpload,pdfUpload,tenderpdf,corrigendum };
