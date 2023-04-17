// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: './faculty/',
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   },
// });

// function checkFileType(file, cb) {
//   const filetypes = /jpeg|jpg|png|gif/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     return cb('Error: Images Only!');
//   }
// }

// const uploadFacultyPhoto = multer({
//   storage: storage,
//   limits: { fileSize: 1000000 }, // 1 MB
//   fileFilter: function (req, file, cb) {
//     checkFileType(file, cb);
//   },
// }).single('photo');

// module.exports = { uploadFacultyPhoto };
const multer = require('multer');
const path = require('path');
const fs=require('fs')


// function createUploadMiddleware(destination) {
//   if (!fs.existsSync(destination)) {
//     fs.mkdirSync(destination, { recursive: true });
//   }

//   const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, destination);
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     },
//   });

//   function checkFileType(file, cb) {
//     const filetypes = /jpeg|jpg|png|gif/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       return cb('Error: Images Only!');
//     }
//   }

//   return function (req, res, next) {
//     const uploadType = req.query.uploadType || 'single'; // default to single upload
//     const uploadMethod = uploadType === 'single' ? 'single' : 'array';
//     const upload = multer({
//       storage: storage,
//       limits: { fileSize: 1000000 }, // 1 MB
//       fileFilter: function (req, file, cb) {
//         checkFileType(file, cb);
//       },
//     })[uploadMethod]('photo');

//     upload(req, res, function (err) {
//       if (err instanceof multer.MulterError) {
//         return res.status(500).json({ message: 'Multer Error: ' + err.message });
//       } else if (err) {
//         return res.status(500).json({ message: 'Error: ' + err });
//       }
//       next();
//     });
//   };
// }

// function createUploadMiddleware(destination) 
// {
//   if (!fs.existsSync(destination)) 
//     {
//       fs.mkdirSync(destination, { recursive: true });
//     }

//   const storage = multer.diskStorage  
//   ( 
//     {
      
//       destination: function (req, file, cb) 
//         {
//           cb(null, destination);
//         },
      
//         filename: function (req, file, cb) 
//           {
//             cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//           },
//   });

function createUploadMiddleware(destination) 
{
  if (!fs.existsSync(destination)) 
    {
      fs.mkdirSync(destination, { recursive: true });
    }

  const storage = multer.diskStorage  
  ( 
    {
      
      destination: function (req, file, cb) 
        {
          cb(null, destination);
        },
      
        filename: function(req, file, cb) {
          const now = new Date();
          const ext = path.extname(file.originalname);
          const date = now.toISOString().slice(0, 10);
          const time = now.toLocaleTimeString("en-US", { hour12: false });
      
          // check if name is provided, otherwise generate default name based on file type
          let name;
          if (req.body.name) 
          {
            name = req.body.name;
          } 
          else 
          {
            const mime = file.mimetype.split("/")[0];
            switch (mime) 
            {
              case "image":
                name = "image";
                break;
              
              case "video":
                name = "video";
                break;
              
              case "application":
                
              const subtype = file.mimetype.split("/")[1];  
                switch (subtype) 
                {
                  case "pdf":
                    name = "pdf";
                    break;
                  case "vnd.openxmlformats-officedocument.wordprocessingml.document":
                    name = "word";
                    break;
                  case "vnd.ms-powerpoint":
                    name = "powerpoint";
                    break;
                  case "vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                    name = "excel";
                    break;
                  default:
                    name = "file";
                    break;
                }
                break;
              
                default:
                  name = "file";
                break;
            }
          }
      
          const filename = `${name}-${date}-${time}${ext}`;
          cb(null, filename);
        }
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

module.exports = { uploadFacultyPhoto, uploadStudentPhoto,uploadAnnouncement,galleryUpload,videoUpload,pdfUpload,tenderpdf };
