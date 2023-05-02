const pool = require("../config/pool");
const fs = require('fs')



exports.updateStudentDetails = async (req, res) => {

  try {

    const client = await pool.connect()

    const { first_name, middle_name, last_name, dob, phone, gender, email } = req.body

    const checkQuery = 'SELECT * FROM users WHERE email = $1'

    const result = await client.query(checkQuery, [email])

    if (result.rowCount === 0) {

      res.status(404).send({ message: 'User does not exist' })

      await client.release()

      return

    }


    const updateQuery =
      'UPDATE users SET first_name=$1, middle_name=$2, last_name=$3, dob=$4, phone=$5, gender=$6,  WHERE email=$7';
    await client.query(updateQuery, [fname, mname, lname, dob, phone, gender, email])



    res.status(200).send({ message: 'User details updated successfully' })

    await client.release()

  }
  catch (error) {

    console.error(error)

    if (error instanceof pg.errors.DBError) {

      res.status(500).send({ message: 'Error connecting to the database' })

    }
    else {

      res.status(500).send({ message: 'Something went wrong' })

    }
  }
}



exports.updateFacultyDetails = async (req, res) => {

  try {

    const client = await pool.connect()

    const { first_name, middle_name, last_name, dob, gender, email } = req.body

    const checkQuery = 'SELECT * FROM faculty WHERE email = $1'

    const checkResult = await client.query(checkQuery, [email])

    if (checkResult.rows.length === 0) {

      res.status(404).send({ message: 'Faculty not found' })

      await client.release()

      return

    }

    let filePath = checkResult.rows[0].photo_path

    if (req.file && req.file.path) {

      // add new photo if it does not exist
      const existingPhotoPath = checkResult.rows[0]?.photo_path

      if (existingPhotoPath) {

        fs.unlinkSync(existingPhotoPath)

      }

      const tempFilePath = req.file.path

      const fileName = req.file.filename

      filePath = `./faculty/${fileName}`


      fs.renameSync(tempFilePath, filePath)

    }

    const updatedFirstName = first_name || checkResult.rows[0].first_name

    const updatedMiddleName = middle_name || checkResult.rows[0].middle_name

    const updatedLastName = last_name || checkResult.rows[0].last_name

    const updatedDOB = dob || checkResult.rows[0].dob

    const updatedGender = gender || checkResult.rows[0].gender


    const data = [updatedFirstName, updatedMiddleName, updatedLastName, updatedDOB, updatedGender, filePath, email]

    const updateQuery =
      'UPDATE faculty SET first_name=$1, middle_name=$2, last_name=$3, dob=$4,  gender=$5, photo_path=$6 WHERE email=$7';
    await client.query(updateQuery, data)


    res.status(200).send({ message: 'Faculty details updated successfully' })


    await client.release()

  }
  catch (error) {

    console.error(error)

    if (error instanceof pg.errors.DBError) {

      res.status(500).send({ message: 'Error connecting to the database' })

    }
    else {

      res.status(500).send({ message: 'Something went wrong' })

    }
  }
};


exports.updateAdminVerificationStatus = async (req, res) => {

  const { email, status } = req.body;

  try {
    const client = await pool.connect()

    // Check if user with email exists
    const checkQuery = 'SELECT * FROM users WHERE email = $1'

    const result = await client.query(checkQuery, [email])

    if (result.rowCount === 0) {

      res.status(404).send({ message: 'User not found' })

      await client.release()

      return

    }

    // Update admin_verified status of user
    const updateQuery = 'UPDATE users SET admin_verified = $1 WHERE email = $2'

    const updateResult = await client.query(updateQuery, [status, email])


    res.status(200).send({ message: 'Admin verification status updated successfully' })

    await client.release()

  }
  catch (error) {

    console.error(error)

    res.status(500).send({ message: 'Something went wrong' })

  }
}


exports.loginAccess = async (req, res) => {

  try {

    const { access, email } = req.body

    const client = await pool.connect()

    const check = 'SELECT * FROM faculty WHERE email=$1'

    const result = await client.query(check, [email])

    if (result.rowCount === 0) {

      res.status(404).send({ message: 'Nothing to show!.' })

    }
    else {

      const updation = 'UPDATE faculty SET admin_verified= $1 WHERE email=$2'

      const data = [access, email]

      await client.query(updation, data)

      res.status(200).send({ message: 'Access Changed!.' })

    }

    await client.release()

  }
  catch (error) {

    console.error(error)

    res.status(500).send({ message: 'Internal Server Error.' })

  }
}
exports.activeInactive = async (req, res) => {

  try {

    const { change, email } = req.body

    const client = await pool.connect()

    const check = 'SELECT * FROM faculty WHERE email=$1'

    const result = await client.query(check, [email])

    if (result.rowCount === 0) {

      res.status(404).send({ message: 'Nothing to show!.' })

    }
    else {

      const updation = 'UPDATE faculty SET status= $1 WHERE email=$2'

      const data = [change, email]

      await client.query(updation, data)

      res.status(200).send({ message: 'Access Changed!.' })

    }

    await client.release()

  }
  catch (error) {

    console.error(error)

    res.status(500).send({ message: 'Internal Server Error.' })

  }
}



exports.updateScheduling = async (req, res) => {
  try {

    const { status, batch, courseID,newStatus,newRunningDate,newComencementDate,newCompletionDate } = req.body

    const check = 'SELECT * FROM course_scheduler WHERE course_status=$1 AND batch_no=$2 AND course_id=$3'

    const data = [status, batch, courseID]

    const data1=[newStatus,status,batch,courseID]

    const client = await pool.connect()

    const result = await client.query(check, data)


    if (result.rowCount === 0) {

      return res.status(404).send({ message: 'Record Not Exists!.' })

    } 
    else {

      const statusCheck = result.rows[0].course_status

      switch (statusCheck) {

        case 'running':

          if (newStatus === 'completed') {

            const updateCompleted = 'UPDATE course_scheduler SET course_status=$1 WHERE course_status=$2 AND batch_no=$3 AND course_id=$4'

            await client.query(updateCompleted, [newStatus, statusCheck, batch, courseID])

            return   res.status(200).send({ message: 'Successfully Changed.' })

          } 
          else {

            return   res.send({ message: `Can't change running status to ${newStatus}` })

          }
          break

        case 'completed':

          return  res.send({ message: 'It can\'t be changed' })

          break

        case 'created':

          if (newStatus==='canceled') {

            return  res.send({message:'This feature not implemented yet.'})


          }
          else if (newStatus==='postponed') {

            const newDate01='9999/02/03'

              const updateCreatedP='UPDATE course_scheduler SET course_status=$1,date_comencement=$2,date_completion=$3,running_date=$4 WHERE course_status=$5 AND batch_no=$6 AND course_id=$7'

              const dataS=[newStatus,newDate01,newDate01,newDate01,statusCheck,batch,courseID]

              await client.query(updateCreatedP,dataS)

              return  res.status(200).send({message:'Successfully Changed!.'})

          }
          else if (newStatus==='scheduled') {

            const updateCreatedS='UPDATE course_scheduler SET course_status=$1 WHERE course_status=$2 AND batch_no=$3 AND course_id=$4'

            await client.query(updateCreatedS,data1)

            return  res.status(200).send({message:'Successfully Changed!.'})

          }
          else{
            res.send({message:'Not Allowed To Change'})
          }
          break

        case 'scheduled':

             if (newStatus==='running') {

              const update01='UPDATE course_scheduler SET course_status=$1 WHERE course_status=$2 AND batch_no=$3 AND course_id=$4'

              await client.query(update01,data1)

              return  res.status(200).send({message:'Successfully Changed!.'})

             }

             else if(newStatus==='canceled'){

              return   res.send({message:'This feature not implemented yet.'})

             }
             else if (newStatus==='postponed') {
              
              const newDate='9999/02/03'

              const update02='UPDATE course_scheduler SET course_status=$1,date_comencement=$2,date_completion=$3,running_date=$4 WHERE course_status=$5 AND batch_no=$6 AND course_id=$7'

              const dataS=[newStatus,newDate,newDate,newDate,statusCheck,batch,courseID]

              await client.query(update02,dataS)

              return  res.status(200).send({message:'Successfully Changed!.'})

             }
             else{

              return  res.send({message:'Not allowed to update this course to completed or created'})

             }
        break

        case 'postponed':

        if (newStatus==='created') {

          if (!req.body.newCompletionDate || !req.body.newComencementDate || !req.body.newRunningDate) {

            return res.status(400).send({message: 'newCompletionDate, newComencementDate, and newRunningDate are required.'

          })
        }
          const updatePostponedC='UPDATE course_scheduler SET course_status=$1,date_comencement=$2,date_completion=$3,running_date=$4 WHERE course_status=$5 AND batch_no=$6 AND course_id=$7'

          const dataS1=[newStatus,newComencementDate,newCompletionDate,newRunningDate,statusCheck,batch,courseID]

          await client.query(updatePostponedC,dataS1)

          return  res.status(200).send({message:'Successfully Changed!.'})

        }
        else if (newStatus==='canceled') {

          return res.send({message:'This feature not implemented yet.'})

        }
        else  {

          return  res.send({message:'You are not allowed to change to this status'})

        }
        break

        default:
          res.send({message:'Something went wrong!.'})
          break
      }
    }

    await client.release()

  } 
  catch (error) {

    console.error(error)

    res.status(500).send({ message: 'Internal Server Error!.' })
    
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
