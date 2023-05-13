// const pool = require("../config/pool");
// const path = require('path');
// const fs = require('fs');
// const { promisify } = require('util');
// const readFile = promisify(fs.readFile);





// exports.uploadPhoto = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { category } = req.body;
//     const file = req.file;
//     const insertQ = 'INSERT INTO album (category_name, name, path) VALUES ($1, $2, $3) RETURNING path';
//     const insertedRow = await client.query(insertQ, [category, file.filename, file.path]);

//     const data = {
//       categoryName: category,
//       path: insertedRow.rows[0].path,
//     };

//     res.json({ message: 'Photo uploaded successfully!', data });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Something went wrong.' });
//   } finally {
//     client.release();
//   }
// };


// exports.getPhotosByCategory = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { category } = req.params;

//     const selectQ = 'SELECT * FROM album WHERE category_name = $1';
//     const result = await client.query(selectQ, [category]);

//     const photos = await Promise.all(result.rows.map(async (row) => {
//       const filePath = path.join(__dirname, '..', row.path);
//       const data = await readFile(filePath);
//       const base64Data = data.toString('base64');
//       return {
//         id: row.id,
//         fileName: row.file_name,
//         image: base64Data,
//       };
//     }));

//     res.json({ photos });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Something went wrong.' });
//   } finally {
//     client.release();
//   }
// }