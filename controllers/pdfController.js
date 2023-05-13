// const format = require('pg-format');
// const pool = require("../config/pool");
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// //API TO UPLOAD PDF FILES

// exports.pdf_Upload = async (req, res) => 
// {

//   try 
//     {
//       const file = req.files.pdf;
//       const name = req.body.name;
//       const description = req.body.description;
//       const client = await pool.connect()
//       const query1 = 'INSERT INTO pdf_details (name, description, size, file_path, file_type) VALUES ($1, $2, $3, $4, $5)'
//       const data=[name, description, file[0].size, file[0].path, 'application/pdf']
      
//       console.log(`pdf uploaded at:${file[0].path}`)
      
//       await client.query(query1,data)
      
//       res.send({message:'Successfully upload'})
    
//       await client.release()
//     } 
  
//   catch (error) 
//     {
//       console.error(error);
//       res.send({ message: 'Something went wrong' });
//     }
// };


// //API TO DISPLAY/DOWNLOAD PDF FILES


// exports.getpdf = async (req, res) => 
// {
//    try 
//     {
//       const id = req.params.id;
//       const client = await pool.connect();
//       const query1 = 'SELECT file_path FROM pdf_details WHERE id = $1';
//       const data = [id];
//       const result = await client.query(query1, data);
//       const filePath = result.rows[0].file_path;
//       const absolutePath = path.resolve(filePath); // resolve the relative path to absolute path
//       res.sendFile(absolutePath);
//       await client.release();
//     } 
  
//   catch (error) 
//     {
//       console.error(error);
//       res.send({ message: 'Something went wrong' });
//     }
// };




