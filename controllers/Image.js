const format = require('pg-format');
const pool = require("../config/pool");
const multer = require('multer');
const path = require('path');

const fs = require('fs');

const storage = multer.diskStorage
({
  destination: function (req, file, cb) 
  {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) 
  {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer
({
  storage: storage,
  limits: 
  {
    fileSize: 1024 * 1024 * 10 // 10MB limit
  },

  fileFilter: function (req, file, cb) 
  {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) 
    {
      const error = new Error("Wrong file type");
      error.code = "LIMIT_FILE_TYPES";
      return cb(error, false);
    }
    cb(null, true);
  }
});

exports.storeImage = (req, res) => 
{
  upload.single('image')(req, res, (err) => 
  {
    if (err) 
    {
      console.error(err);
      if (err.code === "LIMIT_FILE_TYPES") 
      {
        res.status(400).json({ error: 'Wrong file type' });
      } else if (err.code === "LIMIT_FILE_SIZE") 
      {
        res.status(400).json({ error: 'File too large' });
      } else 
      {
        res.status(500).json({ error: 'Error uploading image' });
      }
    } 
    else 
    {
      const file = req.file;
      const name = req.body.name;
      const description = req.body.description;
      const filePath = file.path;

      pool.query('INSERT INTO images (name, description, size, data, file_path) VALUES ($1, $2, $3, $4, $5)',
        [name, description, file.size, file.buffer, filePath], (err, result) => 
        {
          if (err) 
          {
            console.error(err);
            res.status(500).json({ error: 'Error inserting image into database' });
          } 
          else 
          {
            console.log('File saved to:', file.path);
            res.json({ message: 'Image uploaded successfully' });
          }
        });
    }
  });
};


// API TO REPLACE IMAGE VIA ID

exports.patchImage = async (req, res) => 
{
  try 
  {

    upload.single('image')(req, res, async (err) => 
    {
      // Handle file upload error
      if (err) 
      {
        return res.status(500).json({ error: 'Error uploading image' });
      }

      const file = req.file;
      let size, data, filePath;

      // Check if file was uploaded
      if (file) 
      {
        size = file.size;
        data = file.buffer;
        filePath = file.path;
      }
      const id = req.params.id;

      const name = req.body.imageName;
      const description = req.body.imageDescription;
      // const{imageName,imageDescription}=req.body
      
      // Get image from database
      const connection = await pool.connect();
      const result = await connection.query('SELECT * FROM images WHERE id = $1', [id]);
      
      // TO CHEK ERROR

      // console.log(req.body);
      // console.log({imagename:req.body.imageName})
      // console.log({imageDescription:req.body.imageDescription})
      
      if (result.rowCount === 0) 
      {
        res.send({ message: 'Nothing to display' });
      } 
      else 
      {
        const image = result.rows[0];

        // Set updatedName and updatedDescription based on request parameters
        let updatedName = name !== undefined && name !== '' ? name : image.name;
        let updatedDescription = description !== undefined && description !== '' ? description : image.description;


        // Update image in database
        const resu = await connection.query('UPDATE images SET name = $1, description = $2, size = $3, data = $4, file_path = $5 WHERE id = $6',
          [updatedName, updatedDescription, size || image.size, data || image.data, filePath || image.file_path, id]);
        if (resu.rowCount === 0) 
        {
          res.send('Not Found');
        }

        res.json({ message: 'Image replaced successfully' });
        await connection.release();
      }
    });
  } 
  catch (error) 
  {
    console.log(error);
    res.send({ message: 'Something went wrong' });
  }
};

// API TO VIEW AND DOWNLOAD IMAGES VIA ID

exports.getImageById = (req, res) => 
{
  const id = req.params.id;

  pool.query('SELECT * FROM images WHERE id = $1', [id], (err, result) => 
  {
    if (err) 
    {
      console.error(err);
      res.status(500).json({ error: 'Error retrieving image from database' });
    } 
    else if (result.rowCount === 0) 
    {
      res.status(404).json({ error: 'Image not found' });
    } 
    else 
    {
      const image = result.rows[0];
      res.set('Content-Type', 'image/jpeg');
      res.sendFile(path.join(__dirname, '..', image.file_path));
    }
  });
};

//API TO DELETE IMAGE VIA ID

exports.deleteImageById = (req, res) => 
{
  const id = req.params.id;

  pool.query('SELECT * FROM images WHERE id = $1', [id], (err, result) => 
  {
    if (err) 
    {
      console.error(err);
      res.status(500).json({ error: 'Error deleting image from database' });
    }
    else if (result.rowCount === 0) 
    {
      res.status(404).json({ error: 'Image not found' });
    }
    else 
    {
      const image = result.rows[0];
      const filePath = image.file_path;
      fs.unlink(filePath, (err) => 
      {
        if (err) 
        {
          console.error(err);
          res.status(500).json({ error: 'Error deleting image file' });
        } 
        else 
        {
          pool.query('DELETE FROM images WHERE id = $1', [id], (err, result) => 
          {
            if (err) 
            {
              console.error(err);
              res.status(500).json({ error: 'Error deleting image from database' });
            } 
            else 
            {
              res.json({ message: 'Image deleted successfully' });
            }
          });
        }
      });
    }
  });
};

// API TO CREATE ALBUMS AND STORE IMAGES IN DIFFRENT FOLDERS

