const pool = require("../config/pool")
const sendMail = require("../mailing_Service/mailconfig")



exports.Enrol = async (req, res) => {
  try {
    const { studentId, courseId } = req.body

    const enrol = await pool.connect()

    const checkStu = 'SELECT * FROM users WHERE student_id=$1'

    const studentExists = await enrol.query(checkStu, [studentId])

    const checkCourse = 'SELECT * FROM courses WHERE course_id=$1 AND course_status = $2'

    const courseExists = await enrol.query(checkCourse, [courseId, 'Active'])


    if (studentExists.rowCount === 0) 
    {

      return res.status(400).send({ error: 'Student does not exist' })

    }

    if (courseExists.rowCount === 0) 
    {

      return res.status(400).send({ error: 'Course does not exist or is not currently active' })

    }

    const doubleCheck = 'SELECT * FROM enrolment WHERE student_id=$1 AND course_id=$2'

    const enrolmentExists = await enrol.query(doubleCheck, [studentId, courseId])


    if (enrolmentExists.rowCount !== 0) 
    {

      return res.status(400).send({ error: 'Student is already enroled in this course' })

    }

    let enrolmentStatus = 'Pending'

    const checkCourseCategory = 'SELECT course_category FROM courses WHERE course_id = $1'

    const courseCategory = await enrol.query(checkCourseCategory, [courseId])


    if (courseCategory.rows[0].course_category === 'free')
     {

      enrolmentStatus = 'Active'

    }

    const populate = 'INSERT INTO enrolment (student_id, course_id, enrolment_status) VALUES ($1, $2, $3)'

    await enrol.query(populate, [studentId, courseId, enrolmentStatus])


    res.status(201).send({ message: 'Student enroled in the course' })

    await enrol.release()

  }
  catch (error) {

    res.status(500).send({ error: 'something went wrong!' })

  }
};







exports.GetEnroledCourses = async (req, res) => {
  try {
    const { studentId } = req.params
    const enrol = await pool.connect()
    const checkStu = 'SELECT * FROM users WHERE student_id=$1'
    const studentExists = await enrol.query(checkStu, [studentId])

    if (studentExists.rowCount === 0) {
      return res.status(400).send({ error: 'Student does not exist' })
    }


    const courses = 'SELECT c.course_code AS code, name AS name, enrolment_status AS status FROM courses c JOIN enrolment e ON c.course_code = e.course_code WHERE student_id = $1';

    const enroledCourses = await enrol.query(courses, [studentId])

    if (enroledCourses.rowCount === 0) {
      return res.status(400).send({ error: 'Student is not enroled in any courses' })
    }

    res.status(200).send({ courses: enroledCourses.rows })
    await enrol.release()
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: 'something went wrong!' })
  }
}
