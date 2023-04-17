const pool = require("../config/pool")

const generateNumericValue = require("../generator/NumericId");



//////////////////////////////////old courses creation //////////////////////////////////
// exports.courseCreation = async (req, res) => {

//   try
//    { 
//     const client = await pool.connect()

//     const {course_category,name,course_capacity,date_comencement,date_completion, syllabus,fee,year,course_code,course_no,batch_no,duration, eligibility, course_paid, faculty_id} = req.body


//     const checkCourseExistsQuery ='SELECT * FROM courses WHERE course_no = $1 AND batch_no = $2'

//     const checkCourseExists = [course_no, batch_no]

//     const result = await client.query(checkCourseExistsQuery,checkCourseExists)


//     if (result.rows.length !== 0) 
//     {

//       return res.status(400).json({ message: 'This Course number and batch number already exists.' })

//     } 
//     else 
//     {

//       let course_id = generateShortId(6)

//       const checkCourseIdQuery = 'SELECT * from courses where course_id = $1'

//       let result1 = await client.query(checkCourseIdQuery, [course_id])


//       while (result1.rows.length !== 0) 
//       {

//         course_id = generateShortId(6)

//         result1 = await client.query(checkCourseIdExistsQuery, [course_id])

//       }
//      const secureCheck='SELECT * FROM faculty WHERE faculty_id=$1'
//      const finalRes=await client.query(secureCheck,[faculty_id])
//      if (finalRes.rows.length===0)
//       {

//       res.send({message:'You are Unauthorized to create the course.'})

//      }
//      else
//      {

//       const insertQuery ='INSERT INTO courses (course_category, name, course_capacity, date_comencement, date_completion,syllabus, fee, year, course_code, course_no, batch_no, course_id, duration, eligibility, course_paid, faculty_id ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)';


//       const values = [course_category,name,course_capacity,date_comencement,date_completion, syllabus,fee,year,course_code,course_no,batch_no,course_id, duration, eligibility, course_paid, faculty_id]


//       await client.query(insertQuery, values)


//       res.send('Course created successfully')

//      }
      

//       await client.release()
//     }

//   }
//    catch (err)
//     {

//     console.error(err)

//     res.status(500).json({ message: 'Error creating course' })

//   }
// }
////////////////////////////////////////////////////// duration calculate with  date_comencement,date_completion,//////////
// exports.courseCreation = async (req, res) => {
//   try {
//     const client = await pool.connect();

//     const {
//       course_category,
//       name,
//       course_capacity,
//       date_comencement,
//       date_completion,
//       syllabus,
//       fee,
//       year,
//       course_code,
//       course_no,
//       batch_no,
//       eligibility,
//       course_paid,
//       faculty_id,
//     } = req.body;

//     // Check if a course with the given course_no and batch_no already exists
//     const checkCourseExistsQuery =
//       'SELECT * FROM courses WHERE course_no = $1 AND batch_no = $2';
//     const checkCourseExists = [course_no, batch_no];
//     const result = await client.query(checkCourseExistsQuery, checkCourseExists);
//     if (result.rows.length !== 0) {
//       return res
//         .status(400)
//         .json({ message: 'This Course number and batch number already exists.' });
//     }

//     // Generate a unique course ID
//     let course_id = generateShortId(6);
//     const checkCourseIdQuery = 'SELECT * from courses where course_id = $1';
//     let result1 = await client.query(checkCourseIdQuery, [course_id]);
//     while (result1.rows.length !== 0) {
//       course_id = generateShortId(6);
//       result1 = await client.query(checkCourseIdExistsQuery, [course_id]);
//     }

//     // Check if the faculty_id exists
//     const secureCheck = 'SELECT * FROM faculty WHERE faculty_id=$1';
//     const finalRes = await client.query(secureCheck, [faculty_id]);
//     if (finalRes.rows.length === 0) {
//       res.send({ message: 'You are Unauthorized to create the course.' });
//     } else {
//       // Calculate the duration in weeks and days
//       const diffTime = Math.abs(new Date(date_completion) - new Date(date_comencement));
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//       const weeks = Math.floor(diffDays / 7);
//       const days = diffDays % 7;

//       // Construct the duration string in the format of weeks and days
//       const durationStr = `${weeks} weeks and ${days} days`;

//       // Insert the course into the database
//       const insertQuery =
//         'INSERT INTO courses (course_category, name, course_capacity, date_comencement, date_completion, syllabus, fee, year, course_code, course_no, batch_no, course_id, duration, eligibility, course_paid, faculty_id ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)';
//       const values = [
//         course_category,
//         name,
//         course_capacity,
//         date_comencement,
//         date_completion,
//         syllabus,
//         fee,
//         year,
//         course_code,
//         course_no,
//         batch_no,
//         course_id,
//         durationStr,
//         eligibility,
//         course_paid,
//         faculty_id,
//       ];
//       await client.query(insertQuery, values);

//       res.send('Course created successfully');
//     }

//     await client.release();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error creating course" });
//   }
// };



exports.courseCreation = async (req, res) => {

  try { 
    const client = await pool.connect()

    const { course_category, name, course_code, course_no, duration, eligibility, course_director,course_officer, course_duration_days, course_duration_weeks, faculty,mode,coursePaid } = req.body


  

      let course_id = generateNumericValue(6)
      const checkCourseIdQuery = 'SELECT * from courses where course_id = $1'
      let result1 = await client.query(checkCourseIdQuery, [course_id])

      while (result1.rows.length !== 0) {
        course_id = generateNumericValue(6)
        result1 = await client.query(checkCourseIdExistsQuery, [course_id])
      }
 
      const secureCheck = 'SELECT * FROM admin WHERE admin_id=$1'
      const finalRes = await client.query(secureCheck,[course_director])

      if (finalRes.rows.length === 0) {
        res.send({message:'You are Unauthorized to create the course.'})
      } else {

        // Split the duration string into weeks and days
        const durationParts = duration.split(' ')
        const durationWeeks = durationParts.includes('weeks') ? parseInt(durationParts[0]) : 0
        const durationDays = durationParts.includes('days') ? parseInt(durationParts[0]) : 0

        const insertQuery = 'INSERT INTO courses (course_category, name, course_code, course_no, course_id, duration, eligibility, course_duration_days, course_duration_weeks, course_director, course_officer, faculty,course_mode,course_paid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,$14)';

        const values = [course_category, name,  course_code, course_no,  course_id, duration, eligibility,course_duration_days, course_duration_weeks, course_director, course_officer, faculty, mode,coursePaid]

        await client.query(insertQuery, values)
        res.send('Course created successfully')
      }

      await client.release()
    

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error creating course' })
  }
}


///////////////////////////////////////////update course/////////////////////////////////////
exports.updateCourse=async(req,res)=>{

  try{

    const{course_category,name,course_capacity,date_comencement,date_completion, syllabus,fee,year,course_code,course_no,batch_no,duration, eligibility, course_paid, faculty_id,course_id}=req.body 

    if (!courseId) {

      res.status(400).send({message:'Please provide course to update'})
      return 

    }
    
    const connection=await pool.connect()

    const check001='SELECT * FROM courses WHERE course_id=$1'

    const result01= await connection.query(check001,[courseId])

    if (result01.rowCount===0) {

      res.status(404).send({message:'Invalid Credentials'})

    }
  
    else{
   
      const data=[course_category,name,course_capacity,date_comencement,date_completion, syllabus,fee,year,course_code,course_no,batch_no,duration, eligibility, course_paid, faculty_id,course_id]

      const updateQ='UPDATE courses SET course_category=$1,name=$2,course_capacity=$3,date_comencement=$4,date_completion=$5,syllabus=$6,fee=$7,year=$8,course_code=$9,course_no=$10,batch_no=$11,duration=$12, eligibility=$13 WHERE course_id=$14'

      const finalQ=await connection.query(updateQ,[...data,courseId])

      res.status(200).send({message:'Successfully Updated'})

    }
    await connection.release()

  } 
  catch (error)
   {

    console.error(error)

    res.status(500).send({message:'Something went wrong!.'})

  }
}

//////////////////////////////view course table/////////////////////////////////////////////
exports.viewCourses = async (req, res) => {
  try {

    const client = await pool.connect()

    const query =
      "SELECT * FROM courses ORDER BY name DESC"

    const result = await client.query(query)

    if(result.rowCount===0){

      res.status(404).send({message:'Nothing to display.'})

    }

    res.status(200).send({courses:result.rows})

   await client.release()


  } 
  catch (error) 
  {
      console.log(error)

      res.status(500).send({ error: "Something went wrong." })
    
  }
}

exports.filterCourse = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      courseCategory,
      facultyId,
      eligibility
    } = req.body; // assuming the data is sent in the request body

    const client = await pool.connect();

    let query = `
      SELECT *
      FROM courses
      WHERE 1 = 1
    `;

    if (startDate && endDate) {
      
      query += `AND date_comencement >= '${startDate}' 
                 AND date_completion <= '${endDate}'`;
    }

  
    if (courseCategory) {
      query += `AND course_category = '${courseCategory}'`;
    }

    if (facultyId) {
      query += `AND faculty_id = '${facultyId}'`;
    }

    if (eligibility) {
      query += `AND eligibility = '${eligibility}'`;
    }

    query += 'ORDER BY date_comencement ASC';

    const result = await client.query(query);

    if (result.rows.length === 0) {
      res.send({ message: "No courses found" });
    } else {
      res.send({ courses: result.rows });
    }

    client.release();
  } catch (err) {
    console.error(err);
    res.send({ message: "Something went wrong" });
  }
};

////////////////////////////update course status//////////////////////////////////
exports.updateCourseStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const { courseId, newStatus } = req.body;

    // Get the current course batch number
    const batchNumberQuery = `
      SELECT batch_no
      FROM courses
      WHERE course_id = $1
    `;
    const batchNumberResult = await client.query(batchNumberQuery, [courseId]);
    let currentBatchNo = parseInt(batchNumberResult.rows[0].batch_no);

    // Update the course status and batch no
    let updateQuery;
    if (newStatus === 'active') {
      updateQuery = `
        UPDATE courses
        SET course_status = $1::text, batch_no = $2
        WHERE course_id = $3
      `;
      await client.query(updateQuery, [newStatus, currentBatchNo + 1, courseId]);
    } else if (newStatus === 'cancelled') {
      currentBatchNo = currentBatchNo > 1 ? currentBatchNo - 1 : 1;
      updateQuery = ` 
        UPDATE courses 
        SET course_status = $1::text, batch_no = $2
        WHERE course_id = $3
      `;
      await client.query(updateQuery, [newStatus, currentBatchNo, courseId]);
    }
    else if (newStatus === 'postponed') {
      const MAX_DATE = '9999-01-01';
const updateQuery = `
  UPDATE courses
  SET course_status = $1::text, 
      batch_no = $2, 
      date_comencement = $3::date, 
      date_completion = $4::date
  WHERE course_id = $5;
`;
const batchNo = currentBatchNo - 1;

await client.query(updateQuery, [newStatus, batchNo, MAX_DATE, MAX_DATE, courseId]);
    } else {
      updateQuery = `
        UPDATE courses
        SET course_status = $1::text
        WHERE course_id = $2
      `;
      await client.query(updateQuery, [newStatus, courseId]);
    }

    await client.query('COMMIT');
    console.log(`Course ${courseId} status updated to ${newStatus}`);
    res.send({message:"successfully change status"})
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating course status:', err);
  } finally {
    client.release();
  }
};

///////////////////////change status of courses//////////////////
exports.changeCourseStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const { courseId, newStatus, runningDate } = req.body;

    // Get the current course batch number
    const batchNumberQuery = `
      SELECT batch_no
      FROM courses
      WHERE course_id = $1
    `;
    const batchNumberResult = await client.query(batchNumberQuery, [courseId]);
    const currentBatchNo = parseInt(batchNumberResult.rows[0].batch_no);

    // Update the course status and batch no based on new status
    let updateQuery, batchNo;
    switch (newStatus) {
      case 'cancelled':
        updateQuery = `
          DELETE FROM scheduled_courses
          WHERE course_id = $1;
          
          UPDATE courses
          SET course_status = $2::text, batch_no = $3
          WHERE course_id = $1;
        `;
        batchNo = currentBatchNo - 1;
        await client.query(updateQuery, [courseId, newStatus, batchNo]);
        break;

      case 'postponed':
        updateQuery = `
          UPDATE courses
          SET course_status = $1::text, batch_no = $2, date_commencement = NULL, date_completion = NULL
          WHERE course_id = $3;
        `;
        batchNo = currentBatchNo - 1;
        await client.query(updateQuery, [newStatus, batchNo, courseId]);
        break;

      case 'running':
        const currentDate = new Date().toISOString().slice(0, 10);
        if (currentDate >= runningDate) {
          updateQuery = `
            UPDATE courses
            SET course_status = $1::text, course_paid = true
            WHERE course_id = $2;
          `;
          await client.query(updateQuery, [newStatus, courseId]);
        } else {
          res.status(400).send({ message: 'Running date not reached yet.' });
        }
        break;

      case 'scheduled':
        updateQuery = `
          UPDATE courses
          SET course_status = $1::text, course_paid = false
          WHERE course_id = $2;
        `;
        await client.query(updateQuery, [newStatus, courseId]);
        break;

      default:
        res.status(400).send({ message: 'Invalid status provided.' });
        break;
    }

    await client.query('COMMIT');
    console.log(`Course ${courseId} status updated to ${newStatus}`);
    res.send({message:"successfully change status"})
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating course status:', err);
  } finally {
    client.release();
  }
};
//////////////////////////////////////////////course schedular//////////////////////////
exports.courseScheduler = async (req, res) => {
  try {
    const client = await pool.connect();
    var {
      name,
      course_capacity,
      date_comencement,
      date_completion,
      fee,
      course_status,
      batch_no,
      running_date,
    } = req.body;

    const currentDate = new Date();
    const runningDate = new Date(running_date);

    if (currentDate > runningDate) {
      course_status = 'active';
    } else{
    course_status = 'Created'
    }
    const course_scheduler_id = generateNumericValue(6);
    const checkCourseIdQuery =
      'SELECT * from course_scheduler where course_scheduler_id = $1';
    let result1 = await client.query(checkCourseIdQuery, [
      course_scheduler_id,
    ]);

    while (result1.rows.length !== 0) {
      course_scheduler_id = generateNumericValue(6);
      result1 = await client.query(checkCourseIdQuery, [course_scheduler_id]);
    }

    const insertQuery =
      'INSERT INTO course_scheduler (name, course_capacity, date_comencement, date_completion, fee, course_status, batch_no, running_date, course_scheduler_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
    const values = [
      name,
      course_capacity,
      date_comencement,
      date_completion,
      fee,
      course_status,
      batch_no,
      running_date,
      course_scheduler_id,
    ];

    await client.query(insertQuery, values);
    res.send('Course created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating course' });
  }
};
