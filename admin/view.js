const pool = require("../config/pool")
const path = require('path')
const fs = require('fs');
const e = require("express");



exports.viewFaculty = async (req, res) => {

  try {

    const client = await pool.connect()

    const query = 'SELECT * FROM faculty'

    const result = await client.query(query)

    const facultyWithPhotos = await Promise.all(result.rows.map(async faculty => {

      const facultyWithPhoto = { ...faculty }

      if (faculty.photo_path) {

        const photoPath = path.join(__dirname, '..', faculty.photo_path)

        const photoBuffer = await fs.promises.readFile(photoPath)

        const photoBase64 = photoBuffer.toString('base64')

        facultyWithPhoto.photo = `data:image/png;base64,${photoBase64}`

      }

      return facultyWithPhoto

    }))


   return res.status(200).send(facultyWithPhotos)

    await client.release()

  }
  catch (error) {

    console.error(error)

    if (error instanceof pg.errors.DBError) {

     return res.status(500).send({ message: 'Error connecting to the database' })

    }
    else {

    return  res.status(500).send({ message: 'Something went wrong' })

    }
  }
};




exports.viewStudents = async (req, res) => {

  try {

    const client = await pool.connect()

    const { type } = req.body

    const check = 'SELECT * EXCEPT (id,reg_device_v1,created_at,updated_at) FROM users WHERE role=$1'

    const result = await client.query(check, [type])

    if (result.rows.length === 0) {

    return  res.status(404).send({ message: 'Nothing to show.' })

      client.release()

    }
    else {

    return  res.status(200).send({ students: result.rows })

      await client.release()

    }

  }
  catch (error) {

    console.error(error)

  return  res.status(500).send({ message: 'Something went wrong!.' })

  }
}


exports.viewAllStudents = async (req, res) => {

  try {

    const client = await pool.connect()

    const check = 'SELECT *  FROM users'

    const result = await client.query(check)

    if (result.rowCount === 0) {

    return  res.send({ message: 'Nothing to show!.' })

    }

   return res.status(200).send({ students: result.rows })

    await client.release()

  }
  catch (error) {

    console.log(error)

  return  res.status(500).send({ message: 'Something went wrong!.' })


  }
}

exports.organizationFilter = async (req, res) => {

  try {

    const { type, category } = req.query

    const client = await pool.connect()

    const params = []

    let query = 'SELECT * FROM organizations'


    if (type) {

      params.push(type)

      query += ' WHERE type = $1'

    }

    if (category) {

      if (params.length === 0) {

        query += ' WHERE'

      }
      else {

        query += ' AND'

      }

      params.push(category)

      query += ' category = $' + (params.length)

    }



    const result = await client.query(query, params)

    if (result.rowCount === 0) {

     return res.status(404).send({ message: 'No matching records found.' })

      return

    }
   return res.status(200).send(result.rows)

    await client.release()

  }
  catch (error) {

    console.error(error)

   return res.status(500).send({ message: 'Internal server error.' })

  }
};



exports.viewAllCourses = async (req, res) => {

  try {

    const client = await pool.connect()

    const check = 'SELECT * EXCEPT(id) FROM courses'

    const result = await client.query(check)

    if (result.rowCount === 0) {

    return  res.send({ message: 'Nothing to Show!.' })


    }

   return res.status(200).send({ courses: result.rows })

    await client.release()

  }
  catch (error) {

    console.error(error)

   return res.status(500).send({ message: 'Something went wrong!.' })

  }
}

exports.viewAnnouncement = async (req, res) => {

  try {

    const client = await pool.connect()

    const check = "SELECT * FROM announcement"

    const result = await client.query(check)

    if (result.rowCount === 0) {

     return res.status(404).send({
        message: "Nothing to show"
      })

      await client.release()

    }

    res.status(200).send(
      result.rows)

    await client.release()

  }
  catch (error) {

    console.error(error)

    return res.status(500).send({
      message: "something went wrong."
    })

  }
}

exports.allFacultyDetail = async (req, res) => {
  let client;
  try {
    client = await pool.connect();

    const query1 = `
      SELECT faculty.first_name, faculty.middle_name, faculty.last_name, faculty.dob, faculty.phone, faculty.gender, faculty.email, faculty.admin_verified, faculty.education, faculty.designation, faculty.faculty_id, faculty.profile, faculty.created_on_date_time, faculty.updated_at TIMESTAMP, assigned_subjects.subject_name
      FROM faculty 
      INNER JOIN assigned_subjects 
      ON faculty.id = assigned_subjects.faculty_id
    `;

    const result = await client.query(query1);

    return res.status(200).send({ data: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  } finally {
    if (client) {
      await client.release();
    }
  }
};



exports.viewFacultyName = async (req, res) => {
  let client
  try {
    const check = `SELECT id, name FROM faculty_name WHERE name <> 'NIGST'`;
     client = await pool.connect();
    const result = await client.query(check);
    if (result.rowCount === 0) {
      return res.send({ message: 'Something went wrong.' });
    }
    return res.status(200).send(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(400).send({ message: 'Something went wrong.' });
  } finally {
    if (client) {
    await  client.release();
    }
  }
};

exports.viewFacultyWithAccess = async (req, res) => {
  let client
  try {
    const { access } = req.params;
     client = await pool.connect();
    const check = 'SELECT * FROM faculty WHERE status = $1';
    const result = await client.query(check, [access]);
    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'Nothing to Show.' });
    } else {
      return res.status(200).send({ data: result.rows });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal Server Error.' });
  } finally {
    if (client) {
    await  client.release();
    }
  }
};



exports.viewFacultyMembersWithFaculty = async (req, res) => {
  let client
  try {
    const { faculty } = req.params;
     client = await pool.connect();
    const check = 'SELECT first_name as firstname, middle_name as middlename, last_name as lastname, faculty_id as facultyid FROM faculty WHERE faculty = $1';
    const result = await client.query(check, [faculty]);
    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'Nothing to Show.' });
    } else {
      return res.status(200).send({ data: result.rows });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal Server Error.' });
  } finally {
    if (client) {
    await  client.release();
    }
  }
};


exports.viewCourseByFaculty = async (req, res) => {
  let client
  try {
    const { faculty } = req.params;
    const check = `SELECT title, course_id, description, (course_duration_weeks || ' Weeks ' || course_duration_days || ' Days') AS duration, course_code, course_category, course_no, course_officer, course_director, course_mode, course_type, to_char(created_at, 'YYYY/MM/DD') as createdAt FROM courses WHERE faculty = $1`;
     client = await pool.connect();
    const result = await client.query(check, [faculty]);
    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'Course Not Found.' });
    } else {
      return res.status(200).send({ course: result.rows });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal Server Error.' });
  } finally {
    if (client) {
     await client.release();
    }
  }
};



exports.viewAllEnrollment = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const check = `SELECT DISTINCT e.course_paid_status, e.enrolment_status, e.enrolment_date, e.enrolment_id, s.name, s.date_completion, s.running_date, s.course_status, s.currency || ' ' || s.fee AS fee, e.nigst_approval as nigstapproval FROM enrolment e LEFT JOIN course_scheduler s ON e.scheduling_id = s.course_scheduler_id;`;
    const result = await client.query(check);
    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'No records found.' });
    } else {
      return res.status(200).send({ data: result.rows });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal Server Error.' });
  } finally {
    if (client) {
    await  client.release();
    }
  }
};


exports.viewAllCancelEnrollment = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const check = `SELECT DISTINCT e.course_paid_status, e.enrolment_status, e.enrolment_date, e.enrolment_id, s.name, s.date_completion, s.running_date, s.course_status, s.currency || ' ' || s.fee AS fee, e.nigst_approval as nigstapproval, e.cancel_date as cancelDate FROM archive_enroll e LEFT JOIN course_scheduler s ON e.scheduling_id = s.course_scheduler_id;`;
    const result = await client.query(check);
    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'No records found.' });
    } else {
      return res.status(200).send({ data: result.rows });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal Server Error.' });
  } finally {
    if (client) {
   await   client.release();
    }
  }
};
