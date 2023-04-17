const pool = require("../config/pool");
const fs = require('fs');
const path = require('path');

// const videoDirectory = path.join(__dirname, '../videos');

// if (!fs.existsSync(videoDirectory)) {
//   fs.mkdirSync(videoDirectory);
// }

// exports.storeVideos = async (req, res) => {
//   try {
//     if (!req.files || !req.files.video) {
//       return res.status(400).json({ message: 'No video file provided.' });
//     }

//     const fileData = req.files.video;
//     const { name, description } = req.body;
//     const { originalname, mimetype, size } = fileData;
//     const createdAt = new Date();

//     const filePath = path.join(videoDirectory, originalname);
//     const stream = fs.createWriteStream(filePath);
//     stream.on('error', (err) => {
//       console.error(err);
//       res.status(500).send('Server Error');
//     });
//     stream.on('close', async () => {
//       try {
//         const result = await pool.query(
//           'INSERT INTO videos (name, description, file_path, file_size, mime_type, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
//           [name, description, filePath, size, mimetype, createdAt]
//         );
//         res.json({
//           id: result.rows[0].id,
//           name,
//           description,
//           file_path: filePath,
//           file_size: size,
//           mime_type: mimetype,
//           created_at: createdAt,
//         });
//       } catch (err) {
//         console.error(err);
//         res.status(500).send('Server Error');
//       }
//     });
//     fileData.pipe(stream);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// };
const videoDirectory = path.join(__dirname, '../videos');

if (!fs.existsSync(videoDirectory)) {
  fs.mkdirSync(videoDirectory);
}

exports.storeVideos = async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'No video file provided.' });
    }

    const fileData = req.files.video;
    const { name, description } = req.body;
    const { originalname, size } = fileData;
    const createdAt = new Date();

    const extension = path.extname(originalname);
    const timestamp = Date.now().toString();
    const fileName = `${timestamp}${extension}`;
    const filePath = path.join(videoDirectory, fileName);

    const stream = fs.createWriteStream(filePath);
    stream.on('error', (err) => {
      console.error(err);
      res.status(500).send('Server Error');
    });
    stream.on('close', async () => {
      try {
        const result = await pool.query(
          'INSERT INTO videos (name, description, file_path, created_at) VALUES ($1, $2, $3, $4) RETURNING id',
          [name, description, filePath, createdAt]
        );
        res.json({
          id: result.rows[0].id,
          name,
          description,
          file_path: filePath,
          created_at: createdAt,
        });
      } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
      }
    });
    fileData.pipe(stream);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};




// exports.uploadVideo = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { category } = req.body;
//     const file = req.files['video'][0]; 

//     const timestamp = Date.now();
//     const filename = `video_${timestamp}${path.extname(file.originalname)}`;

//     const filepath = `./Videos/${filename}`;
   
//     const fileStream = fs.createWriteStream(filepath);
//     fileStream.on('error', function (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Error saving file to server' });
//     });
//     fileStream.on('finish', async function () {
//       const insertQ = 'INSERT INTO vidGallery (category_name, name, path) VALUES ($1, $2, $3) RETURNING path';
//       const insertedRow = await client.query(insertQ, [category, filename, filepath]);

//       const data = {
//         categoryName: category,
//         path: insertedRow.rows[0].path,
//       };

//       res.json({ message: 'Video uploaded successfully!', data });
//     });
//     const readStream = fs.createReadStream(file.path);
//     readStream.pipe(fileStream);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Something went wrong.' });
//   } finally {
//     client.release();
//   }
// };

exports.uploadVideo = async (req, res) => {
  const client = await pool.connect();
  try {
    const { category } = req.body;
    const file = req.files['video'][0]; 

    const timestamp = Date.now();
    const filename = `video_${timestamp}${path.extname(file.originalname)}`;

    const filepath = `./Videos/${filename}`;
   
    const fileStream = fs.createWriteStream(filepath);
    fileStream.on('error', function (err) {
      console.error(err);
      res.status(500).json({ message: 'Error saving file to server' });
    });
    fileStream.on('finish', async function () {
      try {
        const insertQ = 'INSERT INTO vidGallery (category_name, name, path) VALUES ($1, $2, $3) RETURNING path';
        const insertedRow = await client.query(insertQ, [category, filename, filepath]);

        const data = {
          categoryName: category,
          path: insertedRow.rows[0].path,
        };

        res.json({ message: 'Video uploaded successfully!', data });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong.' });
      } finally {
        client.release();
      }
    });
    const readStream = fs.createReadStream(file.path);
    readStream.pipe(fileStream);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
