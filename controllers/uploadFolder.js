// const pool = require("../config/pool");
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs','fs-extra');
// const unzipper = require('unzipper');

// const storage = multer.diskStorage
// ({
//   destination: function (req, file, cb) 
//   {
//     const folderName = req.body.folder; // get folder name from request body
//     const folderPath = `uploads/${folderName}`; // generate folder path
//     if (!fs.existsSync(folderPath)) 
//     { // check if folder exists
//       fs.mkdirSync(folderPath, { recursive: true }); // create folder if it doesn't exist
//     }
//     cb(null, folderPath);
//   },
// });

// const upload = multer
// ({
//   storage: storage,
//   limits: 
//   {
//     fileSize: 1024 * 1024 * 100 // 100MB limit
//   },
  
//   fileFilter: function (req, file, cb) 
//   {
//     const fileExt = path.extname(file.originalname);
//     if (fileExt !== '.zip') 
//     {
//       cb(new Error('Only zip files are allowed'));
//     } 
//     else 
//     {
//       cb(null, true);
//     }
//   },
  
//   filename: function (req, file, cb) {
//     const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
//     const date = now.split(", ")[0].split("/").join("-");
//     const ext = path.extname(file.originalname);
//     const fileName = req.body.fileName;
//     const counter = ('0' + (req.app.get('imageCounter') + 1)).slice(-2);
//     req.app.set('imageCounter', req.app.get('imageCounter') + 1);
//     const filename = `${counter}-${fileName}-${date}-IST${ext}`;
//     cb(null, filename);
// }

// });

// // // THIS API UPLOADS ZIP FILES CONTAINING IMAGES TO A FOLDER OF OUR NAME ALS CAN TELL US HOW MANY IMAGES ARE THERE IN FOLDER AND WHAT IS THE SIZE OF THE FOLDER IN MB

// // exports.uploadFolder = (req, res) => 
// // {
// //   upload.single('folder')(req, res, (err) => 
// //     {        
// //       if (err) 
// //         {
// //           console.error(err);
          
// //           if (err.code === "LIMIT_FILE_SIZE") 
// //             {
// //               res.status(400).json({ error: 'File too large' });
// //             } 
          
// //             else 
// //             {
// //               res.status(500).json({ error: err.message });
// //             }
// //         } 
          
// //       else 
// //         {
// //           const folderName = req.body.folder;
// //           const zipFileName = req.file.originalname; // get the original name of the uploaded file
// //           const zipFolderName = zipFileName.split('.')[0]; // get the name of the zip file without the .zip extension
// //           const extractPath = `uploads/${folderName}/${zipFolderName}`;
          
// //           // OPENS AND USES UNZIPPER TO EXTRACT ZIPPED FILES

// //           fs.createReadStream(req.file.path)
// //           .pipe(unzipper.Extract({ path: extractPath }))
// //           .on('close', () => 
// //             {
// //               fs.unlinkSync(req.file.path);
// //               console.log('Folder extracted to:', extractPath); // THIS GIVES EXTRACTED PATH TO FILES
          
// //                 // Get size of extracted folder in MB
// //                 // If the folder contains subfolders, the getSize function will include the sizes of all the files in the subfolders as well. 
// //                 // If you want to exclude the sizes of files in subfolders, you can modify the getSize function to skip subfolders.

// //                 const folderSize = (getSize(`${extractPath}/${zipFolderName}`) / (1024 * 1024)).toFixed(2); // (1024 * 1024)).toFixed(2) THIS CONVERTS BYTES TO MB TO 2 DECIMAL POINTS
// //                 console.log(`Folder size: ${folderSize} MB`);
          
// //                 function getSize(folderPath) 
// //                   {
// //                     let totalSize = 0;
// //                     const files = fs.readdirSync(folderPath);
// //                     files.forEach((file) => 
// //                       {
// //                         const stats = fs.statSync(`${folderPath}/${file}`);
// //                         if (stats.isDirectory()) 
// //                           {
// //                             totalSize += getSize(`${folderPath}/${file}`);
// //                           } 
// //                         else 
// //                           {
// //                             totalSize += stats.size;
// //                           }
// //                       });
// //                       return totalSize;
// //                   }
          
// //                 // COUNT NUMBER OF FILES IN FOLDER

// //                 fs.readdir(`${extractPath}/${zipFolderName}`, (err, files) => 
// //                   {
// //                     if (err) 
// //                       {
// //                         console.error(err);
// //                         res.status(500).json({ error: 'Error counting files' });
// //                       } 
// //                       else 
// //                         {
// //                         const numFiles = files.length;
          
// //                         // DATABASE QUERY
                        
// //                         pool.query('INSERT INTO folder_data (name, folder_path, num_files, folder_size, created_at) VALUES ($1, $2, $3, $4, $5)', 
// //                         [folderName, extractPath, numFiles, folderSize, new Date()], (err, result) => 
// //                           {
// //                           if (err) 
// //                             {
// //                               console.error(err);
// //                               res.status(500).json({ error: 'Error adding folder data to database' });
// //                             } 
// //                           else 
// //                             {
// //                               res.json({ message: 'Folder uploaded and extracted successfully' });
// //                             }
// //                           });
// //                         }
// //                   });
// //                })
// //               .on('error', (err) => 
// //                 {
// //                   console.error(err);
// //                   res.status(500).json({ error: 'Error extracting folder' });
// //                 });
// //         }
// //     });
// // };
          

// exports.uploadFolder = (req, res) => 
// {
//   upload.single('folder')(req, res, (err) => 
//     {        
//       if (err) 
//         {
//           console.error(err);
          
//           if (err.code === "LIMIT_FILE_SIZE") 
//             {
//               res.status(400).json({ error: 'File too large' });
//             } 
          
//             else 
//             {
//               res.status(500).json({ error: err.message });
//             }
//         } 
          
//       else 
//         {
//           const folderName = req.body.folder;
//           const zipFileName = req.file.originalname; // get the original name of the uploaded file
//           const zipFolderName = zipFileName.split('.')[0]; // get the name of the zip file without the .zip extension
//           const extractPath = `uploads/${folderName}/${zipFolderName}`;
          
//           // OPENS AND USES UNZIPPER TO EXTRACT ZIPPED FILES

//           fs.createReadStream(req.file.path)
//           .pipe(unzipper.Extract({ path: extractPath }))
//           .on('close', () => 
//             {
//               fs.unlinkSync(req.file.path);
//               console.log('Folder extracted to:', extractPath); // THIS GIVES EXTRACTED PATH TO FILES
          
//                 // Get size of extracted folder in MB
//                 // If the folder contains subfolders, the getSize function will include the sizes of all the files in the subfolders as well. 
//                 // If you want to exclude the sizes of files in subfolders, you can modify the getSize function to skip subfolders.

//                 const folderSize = (getSize(`${extractPath}/${zipFolderName}`) / (1024 * 1024)).toFixed(2); // (1024 * 1024)).toFixed(2) THIS CONVERTS BYTES TO MB TO 2 DECIMAL POINTS
//                 console.log(`Folder size: ${folderSize} MB`);
          
//                 function getSize(folderPath) 
//                   {
//                     let totalSize = 0;
//                     const files = fs.readdirSync(folderPath);
//                     files.forEach((file) => 
//                       {
//                         const stats = fs.statSync(`${folderPath}/${file}`);
//                         if (stats.isDirectory()) 
//                           {
//                             totalSize += getSize(`${folderPath}/${file}`);
//                           } 
//                         else 
//                           {
//                             totalSize += stats.size;
//                           }
//                       });
//                       return totalSize;
//                   }
          
//                 // COUNT NUMBER OF FILES IN FOLDER

//                 fs.readdir(`${extractPath}/${zipFolderName}`, (err, files) => 
//                   {
//                     if (err) 
//                       {
//                         console.error(err);
//                         res.status(500).json({ error: 'Error counting files' });
//                       } 
//                       else 
//                         {
//                           const numFiles = files.length;
          
//                           // DATABASE QUERY
          
//                           pool.query('INSERT INTO folder_data (name, folder_path, num_files, folder_size, created_at) VALUES ($1, $2, $3, $4, $5)', 
//                           [folderName, extractPath, numFiles, folderSize, new Date()], (err, result) => 
//                             {
//                             if (err) 
//                               {
//                                 console.error(err);
//                                 res.status(500).json({ error: 'Error adding folder data to database' });
//                               } 
//                             else 
//                               {
//                                 console.log('Folder data added to database');
//                               }
//                             });
          
//                           // INSERT IMAGE DATA INTO images_fol_data TABLE
          
//                           files.forEach((file) => 
//                             {
//                               const filePath = `${extractPath}/${zipFolderName}/${file}`;
//                               const stats = fs.statSync(filePath);
//                               const imgSize = (stats.size / (1024 * 1024)).toFixed(2);
//                               pool.query('INSERT INTO images_fol_data (name, img_path, album_name, img_size, created_at) VALUES ($1, $2, $3, $4, $5)',
//                               [file, filePath, zipFolderName, imgSize, new Date()], (err, result) => 
//                                 {
//                                   if (err) 
//                                     {
//                                       console.error(err);
//                                       res.status(500).json({ error: 'Error adding image data to database' });
//                                     } 
//                                   else 
//                                     {
//                                       console.log(`Image ${file} uploaded and added to images_fol_data table`);
//                                     }
//                                 });
//                           });
        
//                         res.json({ message: 'Folder uploaded and extracted successfully' });
//                       }
//                   });
//               })
//             .on('error', (err) => 
//               {
//                 console.error(err);
//                 res.status(500).json({ error: 'Error extracting folder' });
//               });
//       }
//   });
// }  
