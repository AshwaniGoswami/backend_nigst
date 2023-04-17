const pool = require("../config/pool")
const path=require('path')
const fs=require('fs')

exports.viewFaculty = async (req, res) => {
    try {
      const client = await pool.connect();
  
      const query = 'SELECT * FROM faculty';
      const result = await client.query(query);
  
      const facultyWithPhotos = await Promise.all(result.rows.map(async faculty => {
        const facultyWithPhoto = { ...faculty };
  
        if (faculty.photo_path) {

          const photoPath = path.join(__dirname, '..', faculty.photo_path);
          const photoBuffer = await fs.promises.readFile(photoPath);
          const photoBase64 = photoBuffer.toString('base64');
          facultyWithPhoto.photo = `data:image/png;base64,${photoBase64}`;
        }
  
        return facultyWithPhoto;
      }));
  
      res.status(200).send(facultyWithPhotos);
  
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
  



exports.viewStudents = async (req, res) => {

    try {

        const client = await pool.connect()

        const { type } = req.body

        const check = 'SELECT * EXCEPT (id,reg_device_v1,created_at,updated_at) FROM users WHERE role=$1'

        const result = await client.query(check, [type])

        if (result.rows.length === 0)
         {

            res.send({ message: 'Nothing to show.' })

            client.release()

        }
        else
         {

            res.send({ students: result.rows })

            await client.release()

        }

    }
     catch (error) 
     {

        res.send({ message: 'Something went wrong!.' })

    }
}


exports.viewAllStudents = async (req, res) => {

    try {

        const client = await pool.connect()

        const check = 'SELECT *  FROM users'

        const result = await client.query(check)

        if (result.rowCount === 0) 
        {

            res.send({ message: 'Nothing to show!.' })

        }

        res.send({ students: result.rows })

        await client.release()

    } 
    catch (error)
     {
console.log(error)
        res.send({ message: 'Something went wrong!.' })

    }
}




exports.viewAllCourses = async (req, res) => {

    try {

        const client = await pool.connect()

        const check = 'SELECT * EXCEPT(id) FROM courses'

        const result = await client.query(check)

        if (result.rowCount === 0)
         {

            res.send({ message: 'Nothing to Show!.' })


        }

        res.send({ courses: result.rows })

        await client.release()

    } 
    catch (error)
     {

        res.send({ message: 'Something went wrong!.' })

    }
}

exports.viewAnnouncement = async (req, res) => {

    try 
    {

        const client = await pool.connect()

        const check = "SELECT * FROM announcement"

        const result = await client.query(check)

        if (result.rowCount === 0) 
        {

            res.send({
                message: "Nothing to show"
            })

            await client.release()

        }

        res.send(
            result.rows)

        await client.release()

    } 
    catch (error) 
    {
        
        res.send({
            message: "something went wrong."
        })
        
    }
}

exports.allFacultyDetail = async (req, res) => {
    try {
        const client = await pool.connect();

        const query1 = `
            SELECT faculty.first_name, faculty.middle_name, faculty.last_name, faculty.dob, faculty.phone, faculty.gender, faculty.email, faculty.admin_verified, faculty.education, faculty.designation, faculty.faculty_id, faculty.profile, faculty.created_on_date_time, faculty.updated_at TIMESTAMP, assigned_subjects.subject_name
            FROM faculty 
            INNER JOIN assigned_subjects 
            ON faculty.id = assigned_subjects.faculty_id
        `;

        const result = await client.query(query1);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong.' });
    }
};
