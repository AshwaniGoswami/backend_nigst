const pool = require("../config/pool");
const fs=require('fs')



exports.updateStudentDetails = async (req, res) => {
  try {
    const client = await pool.connect();

    const { first_name, middle_name, last_name, dob, phone, gender, email } = req.body;

    const checkQuery = 'SELECT * FROM users WHERE email = $1';
    const result = await client.query(checkQuery, [email]);

    if (result.rowCount === 0) {
      res.send({ message: 'User does not exist' });
      await client.release();
      return;
    }


    const updateQuery =
      'UPDATE users SET first_name=$1, middle_name=$2, last_name=$3, dob=$4, phone=$5, gender=$6,  WHERE email=$7';
    await client.query(updateQuery, [fname, mname, lname, dob, phone, gender, email]);



    res.status(200).send({ message: 'User details updated successfully' });

    await client.release();
  } catch (error) {
    console.error(error);
    if (error instanceof pg.errors.DBError) {
      res.status(500).send({ message: 'Error connecting to the database' });
    } else {
      res.status(500).send({ message: 'Something went wrong' });
    }
  }
}



exports.updateFacultyDetails = async (req, res) => {
  try {
    const client = await pool.connect();

    const { first_name, middle_name, last_name, dob, gender, email } = req.body;

    const checkQuery = 'SELECT * FROM faculty WHERE email = $1';
    const checkResult = await client.query(checkQuery, [email]);

    if (checkResult.rows.length === 0) {
      res.status(404).send({ message: 'Faculty not found' });
      await client.release();
      return;
    }

    let filePath = checkResult.rows[0].photo_path;
    if (req.file && req.file.path) {
      // add new photo if it does not exist
      const existingPhotoPath = checkResult.rows[0]?.photo_path;
      if (existingPhotoPath) {
        fs.unlinkSync(existingPhotoPath);
      }

      const tempFilePath = req.file.path;
      const fileName = req.file.filename;
      filePath = `./faculty/${fileName}`;

      fs.renameSync(tempFilePath, filePath);
    }

    const updatedFirstName = first_name || checkResult.rows[0].first_name;
    const updatedMiddleName = middle_name || checkResult.rows[0].middle_name;
    const updatedLastName = last_name || checkResult.rows[0].last_name;
    const updatedDOB = dob || checkResult.rows[0].dob;
    const updatedGender = gender || checkResult.rows[0].gender;

    const data = [updatedFirstName, updatedMiddleName, updatedLastName, updatedDOB, updatedGender, filePath, email];
    const updateQuery =
      'UPDATE faculty SET first_name=$1, middle_name=$2, last_name=$3, dob=$4,  gender=$5, photo_path=$6 WHERE email=$7';
    await client.query(updateQuery, data);

    res.status(200).send({ message: 'Faculty details updated successfully' });

    await client.release();
  } catch (error) {
    console.error(error);
    if (error instanceof pg.errors.DBError) {
      res.status(500).send({ message: 'Error connecting to the database' });
    } else {
      res.status(500).send({ message: 'Something went wrong' });
    }
  }
};


exports.updateAdminVerificationStatus = async (req, res) => {
  const { email, status } = req.body;

  try {
    const client = await pool.connect();

    // Check if user with email exists
    const checkQuery = 'SELECT * FROM users WHERE email = $1';
    const result = await client.query(checkQuery, [email]);
    if (result.rowCount === 0) {
      res.status(404).send({ message: 'User not found' });
      await client.release();
      return;
    }

    // Update admin_verified status of user
    const updateQuery = 'UPDATE users SET admin_verified = $1 WHERE email = $2';
    const updateResult = await client.query(updateQuery, [status, email]);

    res.status(200).send({ message: 'Admin verification status updated successfully' });
    await client.release();
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Something went wrong' });
  }
}

// exports.updateFacultyDetails = async (req, res) => {
//   try {
//     const client = await pool.connect();

//     const { first_name, middle_name, last_name, dob, phone, gender, email } = req.body;
// console.log(req.body)
// console.log(req.files)
//     const checkQuery = 'SELECT * FROM faculty WHERE email = $1';
//     const checkResult = await client.query(checkQuery, [email]);

//     if (checkResult.rows.length === 0) {
//       res.status(404).send({ message: 'Faculty not found' });
//       return;
//     }

//     let filePath = null;

//     if (req.files && req.files.photo) {
//       // Delete existing photo if present
//       const existingPhotoPath = checkResult.rows[0]?.photo_path;
//       if (existingPhotoPath) {
//         fs.unlinkSync(existingPhotoPath);
//       }

//       // Save uploaded photo to disk
//       const file = req.files.photo;
//       filePath = `./faculty/${file.name}`;
//       const fileStream = fs.createWriteStream(filePath);
//       fileStream.on('error', (err) => {
//         console.error(err);
//         res.status(500).send({ message: 'Error saving photo' });
//         return;
//       });
//       fileStream.on('finish', async () => {
//         // Update database with new faculty details and photo path
//         const data = [first_name, middle_name, last_name, dob, phone, gender, filePath, email];
//         const updateQuery =
//           'UPDATE faculty SET first_name=$1, middle_name=$2, last_name=$3, dob=$4, phone=$5, gender=$6, photo_path=$7 WHERE email=$8';
//         await client.query(updateQuery, data);

//         res.status(200).send({ message: 'Faculty details updated successfully' });

//         await client.release();
//       });
//       file.pipe(fileStream);
//     } else {
//       // Update database with new faculty details (without photo path)
//       const data = [first_name, middle_name, last_name, dob, phone, gender, email];
//       const updateQuery =
//         'UPDATE faculty SET first_name=$1, middle_name=$2, last_name=$3, dob=$4, phone=$5, gender=$6 WHERE email=$7';
//       await client.query(updateQuery, data);

//       res.status(200).send({ message: 'Faculty details updated successfully' });

//       await client.release();
//     }
//   } catch (error) {
//     console.error(error);
//     if (error instanceof pg.errors.DBError) {
//       res.status(500).send({ message: 'Error connecting to the database' });
//     } else {
//       res.status(500).send({ message: 'Something went wrong' });
//     }
//   }
// };
