// const format = require('pg-format');
// const pool = require("../config/pool");
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const storage = multer.diskStorage
// ({
//   destination: function (req, file, cb) 
//   {
//     const folderName = req.body.folder; // get folder name from request body
//     const folderPath = `uploads/${folderName}`; // generate folder path
//     if (!fs.existsSync(folderPath)) 
//     // check if folder exists
//     { 
//       fs.mkdirSync(folderPath, { recursive: true }); // create folder if it doesn't exist
//     }
//     cb(null, folderPath);
//   },
  
//   filename: function (req, file, cb) 
//   {
//     // Get the current date in IST
//     const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
//     // Extract the date from the timestamp
//     const date = now.split(", ")[0].split("/").join("-");
//     // Extract the file extension
//     const ext = path.extname(file.originalname);
//     // Get the value of the file name column from the request object
//     const fileName = req.body.fileName;
//     // Construct the filename using the file type, date, file name column value and extension
//     const filename = `${fileName}-${date}-IST${ext}`;
//     cb(null, filename);
//   }

// });

// const upload = multer
// ({
//   storage: storage,
//   limits: 
//   {
//     fileSize: 1024 * 1024 * 10 // 10MB limit
//   },
//   fileFilter: function (req, file, cb) 
//   {
//     const allowedTypes = ["image/jpeg", "image/png"];
//     if (!allowedTypes.includes(file.mimetype)) 
//     {
//       const error = new Error("Wrong file type");
//       error.code = "LIMIT_FILE_TYPES";
//       return cb(error, false);
//     }
//     cb(null, true);
//   }
// });

// // API TO STORE IMAGES ACOORDING TO ALBUM WHERE ALBUM NAME IS FOLDER NAME

// exports.upNewFolimg = (req, res) =>
// {
//   upload.single('image')(req, res, (err) => 
//   {
//     if (err) 
//     {
//       console.error(err);
//       if (err.code === "LIMIT_FILE_TYPES") 
//       {
//         res.status(400).json({ error: 'Wrong file type' });
//       } 
//       else if (err.code === "LIMIT_FILE_SIZE") 
//       {
//         res.status(400).json({ error: 'File too large' });
//       } 
//       else 
//       {
//         res.status(500).json({ error: 'Error uploading image' });
//       }
//     } 
//     else 
//     {
//       const file = req.file;
//       const name = req.body.name;
//       const description = req.body.description;
//       const folder = req.body.folder;
//       const album = req.body.album; // added album name from request body

//       pool.query('INSERT INTO newFolImg (name, description, size, data, file_path, album) VALUES ($1, $2, $3, $4, $5, $6)',
//         [name, description, file.size, file.buffer, file.path, album], (err, result) => 
//         {
//           if (err) 
//           {
//             console.error(err);
//             res.status(500).json({ error: 'Error inserting image into database' });
//           } 
//           else 
//           {
//             console.log('File saved to:', file.path);
//             res.json({ message: 'Image uploaded successfully' });
//           }
//         });
//     }
//   });
// };

// // API TO GET ALL FOLDER IMAGES

// exports.getNewFolUpimg = async (req, res) => {
//     const albumName = req.params.albumName;
//     try {
//       const { rows } = await pool.query('SELECT id, name, description, file_path, uploaded_at FROM newFolImg WHERE album=$1', [albumName]);
//       const images = await Promise.all(rows.map(async row => {
//         const filePath = path.join(__dirname, '..', row.file_path);
//         const data = await new Promise((resolve, reject) => {
//           fs.readFile(filePath, { encoding: 'base64' }, (err, data) => {
//             if (err) {
//               reject(err);
//             } else {
//               resolve(data);
//             }
//           });
//         });
//         return { id: row.id, name: row.name, description: row.description, uploaded_at: row.uploaded_at, data };
//       }));
//       res.json({ images });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Error retrieving images' });
//     }
//   };
  
  
  
// //API TO DELETE IMAGE VIA ID

// exports.delNewFolUpimg = (req, res) => 
// {
//   const id = req.params.id;

//   pool.query('SELECT * FROM newFolImg WHERE id = $1', [id], (err, result) => 
//   {
//     if (err) 
//     {
//       console.error(err);
//       res.status(500).json({ error: 'Error deleting image from database' });
//     }
//     else if (result.rowCount === 0) 
//     {
//       res.status(404).json({ error: 'Image not found' });
//     }
//     else 
//     {
//       const image = result.rows[0];
//       const filePath = image.file_path;
//       fs.unlink(filePath, (err) => 
//       {
//         if (err) 
//         {
//           console.error(err);
//           res.status(500).json({ error: 'Error deleting image file' });
//         } 
//         else 
//         {
//           pool.query('DELETE FROM newFolImg WHERE id = $1', [id], (err, result) => 
//           {
//             if (err) 
//             {
//               console.error(err);
//               res.status(500).json({ error: 'Error deleting image from database' });
//             } 
//             else 
//             {
//               res.json({ message: 'Image deleted successfully' });
//             }
//           });
//         }
//       });
//     }
//   });
// };

// // API TO VIEW SINGLE IMAGE IN FOLDER

// exports.thumbnail = async (req, res) => {
//     const albumName = req.params.albumName;
//     try {
//       const { rows } = await pool.query('SELECT * FROM newFolImg WHERE album=$1', [albumName]);
//       if (rows.length > 0) {
//         const row = rows[0];
//         const filePath = path.join(__dirname, '..', row.file_path); // construct full file path
//         const data = await new Promise((resolve, reject) => {
//           fs.readFile(filePath, { encoding: 'base64' }, (err, data) => {
//             if (err) {
//               reject(err);
//             } else {
//               resolve(data);
//             }
//           });
//         });
//         res.json({ 
//           album: row.album,
//           uploaded_at: row.uploaded_at,
//           images: [{ 
//             id: row.id, 
//             name: row.name, 
//             description: row.description, 
//             data 
//           }]
//         });
//       } else {
//         res.status(404).json({ error: 'No images found for album' });
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Error retrieving images' });
//     }
//   };
 
  
// // API TO SHOW ALL THE FIRST IMAGES OF FOLDER
// // IT SHOWS IMAGES GIVEN DELETED BUT CODE IS LESS DURABLE BUT FAST

// // exports.alltup = async (req, res) => 
// // {
// //     try 
// //     {
// //       const { rows } = await pool.query('SELECT album, MIN(uploaded_at) as uploaded_at, ARRAY_AGG(file_path) as file_paths FROM newFolImg GROUP BY album');
// //       const images = await Promise.all(rows.map(async row => 
// //         {
// //         const filePath = path.join(__dirname, '..', row.file_paths[0]); // construct full file path for first image in album
// //         const data = await new Promise((resolve, reject) => 
// //         {
// //           fs.readFile(filePath, { encoding: 'base64' }, (err, data) => 
// //           {
// //             if (err) 
// //             {
// //               reject(err);
// //             } 
// //             else 
// //             {
// //               resolve(data);
// //             }
// //           });
// //         });
        
// //         return {
// //           album: row.album,
// //           uploaded_at: row.uploaded_at,
// //           data,
// //         };
// //       }));
// //       res.json({ images });
// //     } 
    
// //     catch (error) 
// //     {
// //       console.error(error);
// //       res.status(500).json({ error: 'Error retrieving images' });
// //     }
// //   };

// // // API TO SHOW FISRT IMAGE OF ALL ALBUMS EVEN IF FILE IS DELETED 
// // // THIS MORE DURABLE BUT SLOW

// // exports.alltup = async (req, res) => 
// // {
// //   try 
// //   {
// //     const { rows } = await pool.query
// //     (`
// //       SELECT 
// //         nf.album, 
// //         MIN(nf.uploaded_at) AS uploaded_at, 
// //         ARRAY_AGG(nf.file_path) AS file_paths 
// //       FROM 
// //         (SELECT DISTINCT album FROM newFolImg) AS a 
// //       LEFT JOIN 
// //         newFolImg AS nf 
// //       ON 
// //         nf.album = a.album 
// //       GROUP BY 
// //         nf.album
// //     `);
// //     const images = await Promise.all(rows.map(async row => 
// //       {
// //       const filePath = row.file_paths[0] ? path.join(__dirname, '..', row.file_paths[0]) : null;
// //       if (!filePath) return null;
// //       const data = await new Promise((resolve, reject) => 
// //       {
// //         fs.readFile(filePath, { encoding: 'base64' }, (err, data) => 
// //         {
// //           if (err) 
// //           {
// //             reject(err);
// //           } 
// //           else 
// //           {
// //             resolve(data);
// //           }
// //         });
// //       });
// //       return {
// //         album: row.album,
// //         uploaded_at: row.uploaded_at,
// //         data,
// //       };
// //     }));
// //     res.json({ images: images.filter(img => img) });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ error: 'Error retrieving images' });
// //   }
// // };


// // API TO SHOW ALL THE FIRST IMAGES OF FOLDER
// // IT SHOWS IMAGES FIRST IMAGE OF FOLDER EVEN IF SOMEONE DELETES THE IMAGE IN FOLDER MAUALLY OR IF FROM DATABASE

// exports.alltup = async (req, res) => 
// {
//   try 
//   {
//     const { rows } = await pool.query('SELECT album, MIN(uploaded_at) as uploaded_at, ARRAY_AGG(file_path) as file_paths FROM newFolImg GROUP BY album');
//     const images = await Promise.all(rows.map(async row => 
//       {
//       const filePath = path.join(__dirname, '..', row.file_paths[0]); // construct full file path for first image in album
//       if (fs.existsSync(filePath)) 
//       {
//         const data = await new Promise((resolve, reject) => 
//         {
//           fs.readFile(filePath, { encoding: 'base64' }, (err, data) => 
//           {
//             if (err) 
//             {
//               reject(err);
//             } 
//             else 
//             {
//               resolve(data);
//             }
//           });
//         });
        
//         return {
//           album: row.album,
//           uploaded_at: row.uploaded_at,
//           data,
//         };
//       } 
//       else 
//       {
//         // If file does not exist, remove path from array of file paths for album
//         const file_paths = row.file_paths.filter(path => fs.existsSync(path));
//         return {
//           album: row.album,
//           uploaded_at: row.uploaded_at,
//           data: null,
//           file_paths,
//         };
//       }
//     }));
//     res.json({ images });
//   } 
//   catch (error) 
//   {
//     console.error(error);
//     res.status(500).json({ error: 'Error retrieving images' });
//   }
// };
