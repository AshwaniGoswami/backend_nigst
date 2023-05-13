const pool = require("../config/pool");
const generateNumericValue = require("../generator/NumericId");
const sendMail = require("../mailing_Service/mailconfig")


// exports.Enrol = async (req, res) => {
//   var client;
//   try {
//     client = await pool.connect();

//     const { studentId, scheduleId } = req.body;

//     await client.query('BEGIN');

//     const checkStu = 'SELECT * FROM users WHERE student_id=$1';

//     const studentExists = await client.query(checkStu, [studentId]);

//     if (studentExists.rowCount === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).send({ error: 'Student does not exist' });
//     }

//     const checkCourse = 'SELECT * FROM course_scheduler WHERE course_scheduler_id=$1 AND course_status IN ($2, $3)';

//     const courseExists = await client.query(checkCourse, [scheduleId, 'scheduled', 'running']);

//     if (courseExists.rowCount === 0) {
//       await client.query('ROLLBACK');
//       return res.status(400).send({ error: 'Course does not exist or is not currently active' });
//     }

//     const checkEnrollmentExists = 'SELECT * FROM enrolment WHERE student_id=$1 AND scheduling_id=$2';

//     const enrolmentExists = await client.query(checkEnrollmentExists, [studentId, scheduleId]);

//     if (enrolmentExists.rowCount === 0) {
//       const enrollId = 'E-' + generateNumericValue(8);
//       const checkFee = 'SELECT fee,course_capacity FROM course_scheduler WHERE course_scheduler_id=$1';
//       const feeResult = await client.query(checkFee, [scheduleId]);
//       let feePaid = false;

//       if (feeResult.rows[0].fee === '0') {
//         feePaid = true;
//       }

//       const countQuery = 'SELECT COUNT(*) AS count FROM enrolment WHERE scheduling_id=$1';
//       const countResult = await client.query(countQuery, [scheduleId]);

//       let EnrollStatus;

//       if (countResult.rows[0].count >= feeResult.rows[0].course_capacity) {
//         EnrollStatus = 'waiting';
//       } else {
//         EnrollStatus = 'requested';
//       }

//       const populateEnrollment = 'INSERT INTO enrolment (student_id, scheduling_id, enrolment_status, course_paid_status, enrolment_id) VALUES ($1, $2, $3, $4, $5)';
//       await client.query(populateEnrollment, [studentId, scheduleId, EnrollStatus, feePaid, enrollId]);

//       await client.query('COMMIT');
//       res.status(201).send({ message: 'Student enrolled in the course' });
//     } else {
//       const enrollmentId = enrolmentExists.rows[0].enrolment_id;
//       const enrollmentStatus = enrolmentExists.rows[0].enrolment_status;

//       if (enrollmentStatus === 'completed' || enrollmentStatus === 'cancelled') {
//         await client.query('ROLLBACK');
//         return res.status(400).send({ error: 'Student cannot cancel enrollment as it has already been completed or cancelled.' });
//       }

//       const cancelEnrollment = 'UPDATE enrolment SET enrolment_status = $1 WHERE enrolment_id = $2';
//       await client.query(cancelEnrollment, ['cancelled', enrollmentId]);

//       await client.query('COMMIT');
//       res.status(200).send({ message: 'Student enrollment has been cancelled.' });
//     }
//   } catch (error) {
//     console.error(error);
//     await client.query('ROLLBACK');
//     res.status(500).send({ message: 'Internal Server Error!' });
//   } finally {
//     client.release();
// }
// } 

exports.Enrol = async (req, res) => {
  let client 
  try {
    client = await pool.connect()

    const { studentId, scheduleId } = req.body

    await client.query('BEGIN')

    const checkStu = 'SELECT * FROM users WHERE student_id=$1'

    const studentExists = await client.query(checkStu, [studentId])


    if (studentExists.rowCount === 0) {

      await client.query('ROLLBACK')

      return res.status(404).send({ error: 'Student does not exist' })

    }

    const checkCourse = 'SELECT * FROM course_scheduler WHERE course_scheduler_id=$1 AND course_status = $2'

    const courseExists = await client.query(checkCourse, [scheduleId, 'scheduled'])


    if (courseExists.rowCount === 0) {

      await client.query('ROLLBACK')

      return res.status(400).send({ error: 'Course does not exist or is not currently active' })

    }

    let enrollId = 'E-' + generateNumericValue(8)


    const checkEnrollment = 'SELECT * FROM enrolment WHERE enrolment_id=$1'

    let result = await client.query(checkEnrollment, [enrollId])


    while (result.rowCount > 0) {

      enrollId = 'E-' + generateNumericValue(8)

      result = await client.query(checkEnrollment, [enrollId])

    }

    const checkEnrollmentExists = 'SELECT * FROM enrolment WHERE student_id=$1 AND scheduling_id=$2'

    const enrolmentExists = await client.query(checkEnrollmentExists, [studentId, scheduleId])


    if (enrolmentExists.rowCount !== 0) {

      await client.query('ROLLBACK')

      return res.status(400).send({ error: 'Student is already enrolled in this course' })

    }

    const checkFee = 'SELECT fee,course_capacity FROM course_scheduler WHERE course_scheduler_id=$1'

    const feeResult = await client.query(checkFee, [scheduleId])

    
    let feePaid = false

    if (feeResult.rows[0].fee === '0') {

      feePaid = true

    }
    
    const countQuery = 'SELECT COUNT(*) AS count FROM enrolment WHERE scheduling_id=$1'

    const countResult = await client.query(countQuery, [scheduleId])

    
    let EnrollStatus

    if (countResult.rows[0].count >= feeResult.rows[0].course_capacity) {

      EnrollStatus = 'waiting'

    } 
    else {

      EnrollStatus = 'requested'

    }
    
    const populateEnrollment = 'INSERT INTO enrolment (student_id, scheduling_id, enrolment_status, course_paid_status, enrolment_id) VALUES ($1, $2, $3, $4, $5)'

    await client.query(populateEnrollment, [studentId, scheduleId, EnrollStatus, feePaid, enrollId])


    await client.query('COMMIT')

   return res.status(201).send({ message: 'Student enrolled in the course' })

  } 
  catch (error) {

    console.error(error)

    await client.query('ROLLBACK')

  return res.status(500).send({ message: 'Internal Server Error!' })

  } 
  finally {

   await client.release()

  }
};





exports.GetEnrolledCourses = async (req, res) => {

  try {

    const { studentId } = req.params

    const enrol = await pool.connect()

    const checkStu = 'SELECT * FROM users WHERE student_id=$1'

    const studentExists = await enrol.query(checkStu, [studentId])

    if (studentExists.rowCount === 0) {

      return res.status(400).send({ error: 'Student does not exist' })

    }

    const courses = `SELECT e.scheduling_id FROM enrolment e WHERE e.student_id = $1 `

    const enrolledSchedulingIds = await enrol.query(courses, [studentId])

    if (enrolledSchedulingIds.rowCount === 0) {

      return res.status(400).send({ error: 'Student is not enrolled in any courses' })

    }

    const schedulingIds = enrolledSchedulingIds.rows.map(row => row.scheduling_id)

    const courseDetails = `
    SELECT cs.name as course_name , cs.running_date as runningDate, cs.date_completion as completionDate, cs.fee, e.enrolment_status as enrollStatus, e.enrolment_id as enrollmentId,e.enrolment_date as dateEnrollment
    FROM course_scheduler cs
    JOIN enrolment e ON e.scheduling_id = cs.course_scheduler_id
    WHERE e.student_id = $1 AND cs.course_scheduler_id = ANY($2)
    `

    const enrolledCourses = await enrol.query(courseDetails, [studentId, schedulingIds])

   return res.status(200).send({ courses: enrolledCourses.rows })

    await enrol.release()

  } 

  catch (error) {

    console.error(error)

  return  res.status(500).send({ error: 'Something went wrong!' })

  }
  
}


exports.CancelEnrollment = async (req, res) => {

  let client

  try {

    client = await pool.connect()


    const { enrollmentId } = req.params


    await client.query('BEGIN')


    const checkEnrollment = 'SELECT * FROM enrolment WHERE enrolment_id=$1'


    const enrollmentExists = await client.query(checkEnrollment, [enrollmentId])


    if (enrollmentExists.rowCount === 0) {

      await client.query('ROLLBACK')
      
      return res.status(404).send({ error: 'Enrollment does not exist' })

    }

    const scheId=enrollmentExists.rows[0].scheduling_id

const check='SELECT course_status,running_date,date_completion from course_scheduler WHERE course_scheduler_id=$1 '

    const enrollmentStatus = await client.query(check,[scheId])


    if (enrollmentStatus.rowCount===0) {

      await client.query('ROLLBACK')

      return res.status(400).send({ error: 'Course Not Exists..' })

    }

    else{

      if (enrollmentStatus.rows[0].course_status === 'completed'|| enrollmentStatus.rows[0].course_status==='running' ) {

        await client.query('ROLLBACK')

        return res.status(400).send({ error: 'Cannot cancel enrollment for a course that is already running or completed.' })

      }

      
      const enrollmentValues = [
        enrollmentExists.rows[0].student_id,
        enrollmentExists.rows[0].scheduling_id,
        'canceled',
        enrollmentExists.rows[0].course_paid_status,
        enrollmentExists.rows[0].enrolment_id
      ]

      const cancelEnrollment = 'DELETE FROM enrolment WHERE enrolment_id=$1'

  
      await client.query(cancelEnrollment, [enrollmentId])

  
      const createEnrollmentCopy = 'INSERT INTO archive_enroll (student_id, scheduling_id, enrolment_status, course_paid_status, enrolment_id, cancel_date) VALUES ($1, $2, $3, $4, $5, $6)'

  
      await client.query(createEnrollmentCopy, [...enrollmentValues, new Date()])

  
      await client.query('COMMIT')

  
    return  res.status(200).send({ message: 'Enrollment cancelled successfully' })

    }
   
  }

  catch (error) {

    console.error(error)

    await client.query('ROLLBACK')

  return res.status(500).send({ message: 'Internal Server Error!' })

  }
  finally {

   await client.release()

  }
}

exports.reEnroll = async (req, res) => {
  let connection

  try {

    const { enrollmentID } = req.params

    const check = 'SELECT * FROM archive_enroll WHERE enrolment_id=$1'

    connection = await pool.connect()

    const result = await connection.query(check, [enrollmentID])

    if (result.rowCount === 0) {

      return res.status(404).send({ error: 'Not Found!' })

    }

    const newId = result.rows[0].student_id
    const newScheId = result.rows[0].scheduling_id

    await connection.query('BEGIN')

    const checkStu = 'SELECT * FROM users WHERE student_id=$1'

    const studentExists = await connection.query(checkStu, [newId])

    if (studentExists.rowCount === 0) {

      await connection.query('ROLLBACK')

      return res.status(404).send({ error: 'Student does not exist' })

    }

    const checkCourse = 'SELECT * FROM course_scheduler WHERE course_scheduler_id=$1 AND course_status = $2'

    const courseExists = await connection.query(checkCourse, [newScheId, 'scheduled'])

    if (courseExists.rowCount === 0) {

      await connection.query('ROLLBACK')

      return res.status(400).send({ error: 'Course does not exist or is not currently active' })

    }

    let enrollId = 'E-' + generateNumericValue(8)

    const checkEnrollment = 'SELECT * FROM enrolment WHERE enrolment_id=$1'

    let result1 = await connection.query(checkEnrollment, [enrollId])

    while (result1.rowCount > 0) {

      enrollId = 'E-' + generateNumericValue(8)

      result1 = await connection.query(checkEnrollment, [enrollId])

    }

    const checkEnrollmentExists = 'SELECT * FROM enrolment WHERE student_id=$1 AND scheduling_id=$2'

    const enrolmentExists = await connection.query(checkEnrollmentExists, [newId, newScheId])

    if (enrolmentExists.rowCount !== 0) {

      await connection.query('ROLLBACK')

      return res.status(400).send({ error: 'Student is already enrolled in this course' })

    }

    const checkFee = 'SELECT fee,course_capacity FROM course_scheduler WHERE course_scheduler_id=$1'

    const feeResult = await connection.query(checkFee, [newScheId])

    let feePaid = false

    if (feeResult.rows[0].fee === '0') {

      feePaid = true

    }

    const countQuery = 'SELECT COUNT(*) AS count FROM enrolment WHERE scheduling_id=$1'

    const countResult = await connection.query(countQuery, [newScheId])

    let EnrollStatus

    if (countResult.rows[0].count >= feeResult.rows[0].course_capacity) {

      EnrollStatus = 'waiting'

    } 
    else {

      EnrollStatus = 'requested'

    }

    const populateEnrollment = 'INSERT INTO enrolment (student_id, scheduling_id, enrolment_status, course_paid_status, enrolment_id) VALUES ($1, $2, $3, $4, $5)'

    await connection.query(populateEnrollment, [newId, newScheId, EnrollStatus, feePaid, enrollId])
    
    const cancelEnrollment = 'DELETE FROM archive_enroll WHERE enrolment_id=$1'

      await connection.query(cancelEnrollment, [enrollmentID])

    await connection.query('COMMIT')

   return res.status(201).send({ message: 'Student ReEnrolled in the course' })

  } 
  catch (error) {

    console.error(error)

    return res.status(500).send({})

  } 
  finally{

    await connection.release()

  }
}


exports.viewEnrollmentOfStudent=async(req,res)=>{

  try {
    
    const {studentID}=req.params

    const connection=await pool.connect()

    const check = `
    SELECT e.course_paid_status, e.enrolment_status, to_char(e.enrolment_date, 'YYYY/MM/DD') AS completion, e.enrolment_id, s.name, s.date_completion, s.running_date, s.course_status, s.currency || ' ' || s.fee AS fee  FROM enrolment e  LEFT JOIN course_scheduler s ON e.scheduling_id = s.course_scheduler_id  WHERE e.student_id = $1; `
  
   
     const result=await connection.query(check,[studentID])

     if (result.rowCount===0) {

      return res.status(404).send({message:'No Records Found!.'})

     }
     else{

      return res.status(200).send({data:result.rows})

     }

     await connection.release()

  } 

  catch (error) {

    console.error(error)

    return res.status(500).send({message:'Internal Server Error!.'})

  }
}


exports.viewCanceledEnrollmentOfStudent=async(req,res)=>{
  
  try {
    
    const {studentID}=req.params

    const connection=await pool.connect()

    const check=`SELECT DISTINCT e.course_paid_status, e.enrolment_status, e.enrolment_date, e.enrolment_id, s.name, s.date_completion, s.running_date, s.course_status, s.currency || ' ' || s.fee AS fee,e.cancel_date as cancelled_date FROM archive_enroll e LEFT JOIN course_scheduler s ON e.scheduling_id = s.course_scheduler_id WHERE e.student_id = $1;`
   
     const result=await connection.query(check,[studentID])

     if (result.rowCount===0) {

      return res.status(404).send({message:'No Records Found!.'})

     }
     else{

      return res.status(200).send({data:result.rows})

     }

     await connection.release()

  } 

  catch (error) {

    console.error(error)

    return res.status(500).send({message:'Internal Server Error!.'})

  }
}

exports.viewCoursesForEnrollment=async(req,res)=>{
  try {
    const {name}=req.params
    // const check= 'SELECT u.student_id, oca.course_id, oca.code, oca.course_no, oca.batch_no, oca.scheduling_id, oca.date_commencement, oca.date_completion FROM users u JOIN organization_course_assi oca ON u.organization = oca.organization_name'
// const check='SELECT u.organization, u.student_id, oca.course_id, oca.code, oca.course_no, oca.batch_no, oca.scheduling_id, oca.date_commencement, oca.date_completion, s.course_status FROM users u JOIN organization_course_assi oca ON u.organization = oca.organization_name JOIN course_scheduler s ON oca.scheduling_id = s.course_scheduler_id WHERE s.course_status = $1 AND u.organization = $2 ORDER BY u.organization'
const check='SELECT u.organization, u.student_id, oca.course_id, oca.code, oca.course_no, oca.batch_no, oca.scheduling_id, oca.date_commencement, oca.date_completion, s.course_status FROM users u JOIN organization_course_assi oca ON u.organization = oca.organization_name JOIN course_scheduler s ON oca.scheduling_id = s.course_scheduler_id WHERE  u.organization = $1 ORDER BY u.organization'
const client= await pool.connect()
const result=await client.query(check,[name])
if (result.rowCount===0) {
  return res.status(404).send({message:'No Records Found!.'})
}
else{
  return res.status(200).send({course:result.rows})
}
await client.release()
  } catch (error) {
    console.error(error)
    return res.status(500).send({message:'Internal Server Error!.'})
  }
}