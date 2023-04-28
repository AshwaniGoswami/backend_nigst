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


    res.status(200).send(facultyWithPhotos)

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




exports.viewStudents = async (req, res) => {

  try {

    const client = await pool.connect()

    const { type } = req.body

    const check = 'SELECT * EXCEPT (id,reg_device_v1,created_at,updated_at) FROM users WHERE role=$1'

    const result = await client.query(check, [type])

    if (result.rows.length === 0) {

      res.status(404).send({ message: 'Nothing to show.' })

      client.release()

    }
    else {

      res.status(200).send({ students: result.rows })

      await client.release()

    }

  }
  catch (error) {

    console.error(error)

    res.status(500).send({ message: 'Something went wrong!.' })

  }
}


exports.viewAllStudents = async (req, res) => {

  try {

    const client = await pool.connect()

    const check = 'SELECT *  FROM users'

    const result = await client.query(check)

    if (result.rowCount === 0) {

      res.send({ message: 'Nothing to show!.' })

    }

    res.status(200).send({ students: result.rows })

    await client.release()

  }
  catch (error) {

    console.log(error)

    res.status(500).send({ message: 'Something went wrong!.' })


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

      res.status(404).send({ message: 'No matching records found.' })

      return

    }
    res.status(200).send(result.rows)

    await client.release()

  }
  catch (error) {

    console.error(error)

    res.status(500).send({ message: 'Internal server error.' })

  }
};



exports.viewAllCourses = async (req, res) => {

  try {

    const client = await pool.connect()

    const check = 'SELECT * EXCEPT(id) FROM courses'

    const result = await client.query(check)

    if (result.rowCount === 0) {

      res.send({ message: 'Nothing to Show!.' })


    }

    res.status(200).send({ courses: result.rows })

    await client.release()

  }
  catch (error) {

    console.error(error)

    res.status(500).send({ message: 'Something went wrong!.' })

  }
}

exports.viewAnnouncement = async (req, res) => {

  try {

    const client = await pool.connect()

    const check = "SELECT * FROM announcement"

    const result = await client.query(check)

    if (result.rowCount === 0) {

      res.status(404).send({
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

    res.status(500).send({
      message: "something went wrong."
    })

  }
}

exports.allFacultyDetail = async (req, res) => {

  try {

    const client = await pool.connect()


    const query1 = `
            SELECT faculty.first_name, faculty.middle_name, faculty.last_name, faculty.dob, faculty.phone, faculty.gender, faculty.email, faculty.admin_verified, faculty.education, faculty.designation, faculty.faculty_id, faculty.profile, faculty.created_on_date_time, faculty.updated_at TIMESTAMP, assigned_subjects.subject_name
            FROM faculty 
            INNER JOIN assigned_subjects 
            ON faculty.id = assigned_subjects.faculty_id
        `


    const result = await client.query(query1)

    res.status(200).send({ data: result.rows })

  }
  catch (error) {

    console.error(error)

    res.status(500).json({ message: 'Something went wrong.' })

  }
}


exports.viewFacultyName = async (req, res) => {

  try {

    const check = `SELECT id,name FROM faculty_name  WHERE name <> 'All'`

    const client = await pool.connect()

    const result = await client.query(check)

    if (result.rowCount === 0) {

      res.send({ message: 'Something went wrong.' })

    }

    res.status(200).send(result.rows)

    await client.release()

  }
  catch (error) {

    console.error(error)

    res.status(400).send({ message: 'Something went wrong.' })

  }
}

exports.viewFacultyWithAccess = async (req, res) => {

  try {

    const { access } = req.params

    const client = await pool.connect()

    const check = 'SELECT * FROM faculty WHERE status=$1'

    const result = await client.query(check, access)

    if (result.rowCount === 0) {

      res.status(404).send({ message: 'Nothing to Show!.' })

    }

    else {

      res.status(200).send({ data: result.rows })

    }

    await client.release()

  }
  catch (error) {

    console.error(error)

    res.status(500).send({ message: 'Internal Serve Error!.' })

  }
}


exports.viewFacultyMembersWithFaculty = async (req, res) => {

  try {

    const { faculty } = req.params

    const client = await pool.connect()

    const check = 'SELECT first_name as firstname,middle_name as middlename,last_name as lastname,faculty_id as facultyid FROM faculty where faculty=$1'

    const result = await client.query(check, [faculty])

    if (result.rowCount === 0) {

      res.status(404).send({ message: 'Nothing to Show!.' })

    }
    else {

      res.status(200).send({ data: result.rows })

    }

    await client.release()

  }
  catch (error) {

    console.error(error)

    res.status(500).send({ message: 'Internal Server Error!.' })

  }
}

exports.viewCourseByFaculty=async(req,res)=>{
  try {

    const {faculty}=req.params

    const check = `SELECT title, course_id, description, (course_duration_weeks || \' Weeks \' || course_duration_days || \' Days\') AS duration, course_code, course_category, course_no,course_officer,course_director,course_mode,course_type,to_char(created_at,'YYYY/MM/DD') as createdAt FROM courses WHERE faculty = $1`

const  client=await pool.connect()

const result=await client.query(check,[faculty])

if (result.rowCount===0) {

  return res.status(404).send({message:'Course Not Found!.'})

}

else{

  res.status(200).send({course:result.rows})

}

await client.release()

  } catch (error) {

    console.error(error)

    res.status(500).send({message:'Internal Server Error!.'})
    
  }
}