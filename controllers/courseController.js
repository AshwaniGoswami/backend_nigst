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

exports.course_scheduling = async (req, res) => {
  try {

    const { courseName, courseID, courseCapacity, dateCommencement, dateCompletion, currency, fees, runningDate } = req.body

    const client = await pool.connect()

    var batch = 1

    const check = 'SELECT * FROM course_scheduler WHERE course_id=$1 ORDER BY id ASC'

    const result = await client.query(check, [courseID])

    var generateid = generateNumericValue(6)

    const check1 = 'SELECT * FROM course_scheduler WHERE course_scheduler_id=$1'

    var result1 = await client.query(check1, [generateid])

    while (result1.rowCount > 0) {

      var result1 = await client.query(check1, [generateid])

    }
    if (result.rows.length > 0) {

      const lastStatus = result.rows[result.rows.length - 1].course_status

      const lastBatchNumber = result.rows[result.rows.length - 1].batch_no

      const lastRunningDate = result.rows[result.rows.length - 1].running_date

      const lastCommencementDate = result.rows[result.rows.length - 1].date_comencement

      const lastCompletionDate = result.rows[result.rows.length - 1].date_completion

      if (lastStatus === 'completed' || lastStatus === 'running' || lastStatus === 'scheduled') {

        batch = parseInt(lastBatchNumber) + 1

        if (runningDate >= dateCommencement && runningDate <= dateCompletion) {

          const data = [courseName, courseID, courseCapacity, dateCommencement, dateCompletion, currency, fees, runningDate, batch, generateid]

          const feed = 'INSERT INTO course_scheduler(name,course_id,course_capacity,date_comencement,date_completion,currency,fee,running_date,batch_no,course_scheduler_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) '

          await client.query(feed, data)

          res.status(201).send({ message: 'Course Scheduled Successfully.' })

        }

         else {

          res.send({ message: 'Running date is not between commencement and completion dates.' })

        }

      }
      else if (lastStatus === 'postponed') {

        res.send({ message: 'There is already a postponed course!.' })

      } 
      else {

        res.send({ message: 'You cant create new course when there is a course for scheduling!.' })

      }
    }
     else {

      const insert = 'INSERT INTO course_scheduler(name,course_id,course_capacity,date_comencement,date_completion,currency,fee,running_date,batch_no,course_scheduler_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)'

      if (runningDate >= dateCommencement && runningDate <= dateCompletion) {

        await client.query(insert, [courseName, courseID, courseCapacity, dateCommencement, dateCompletion, currency, fees, runningDate, batch, generateid])

        res.status(200).send({ message: 'New course Scheduled.' })

      } 
      else {

        res.send({ message: 'Running date is not between commencement and completion dates.' })
        
      }
    }

    await client.release()

  } catch (error) {

    console.error(error)

    res.status(500).send({ message: 'Internal Server Error!.' })

  }
};

exports.viewScheduledCourses = async (req, res) => {
  try {
    const check = `SELECT name as title, course_capacity as coursecapacity,to_char(date_comencement,'YYYY/MM/DD') as datecomencement, to_char(date_completion,'YYYY/MM/DD') as datecompletion,currency,fee, batch_no as batch, course_status as status, to_char(running_date,'YYYY/MM/DD') as runningdate,to_char(scheduled_at, 'YYYY/MM/DD') as schedulingdate,course_scheduler_id as scheduling_id,course_id as courseid FROM course_scheduler ORDER BY name ASC, batch_no ASC`;
    const client = await pool.connect();
    const result = await client.query(check);
    if (result.rowCount === 0) {
      res.status(404).send({ message: 'No records found' });
    } else {
      res.status(200).send({ data: result.rows });
    }
    await client.release();
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error!.' });
  }
};


exports.courseCreation = async (req, res) => {

  try { 

    var { courseCategory, title, courseCode, courseNo,  eligibility, courseDirector,courseOfficer, courseDurationInDays, courseDurationInWeeks, faculty,mode,type,description } = req.body

courseDirector='Head of Faculty '+faculty

    const client = await pool.connect()

      let course_id = generateNumericValue(6)

      const checkCourseIdQuery = 'SELECT * from courses where course_id = $1'

      let result1 = await client.query(checkCourseIdQuery, [course_id])

      while (result1.rows.length !== 0) {

        course_id = generateNumericValue(6)

        result1 = await client.query(checkCourseIdExistsQuery, [course_id])

      }
 

        const insertQuery = 'INSERT INTO courses (course_category, title, course_code, course_no, course_id,  eligibility, course_duration_days, course_duration_weeks, course_director, course_officer, faculty,course_mode,course_type,description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,$14)';

        const values = [courseCategory, title, courseCode, courseNo,course_id,  eligibility,courseDurationInDays,courseDurationInWeeks,courseDirector,courseOfficer,faculty,mode,type,description ]

        await client.query(insertQuery, values)

        res.status(201).send('Course created successfully')
  

      await client.release()
    

  }

  catch (err) {

    console.error(err)
  
    if (err.code === '23505') {

      res.status(409).json({ message: 'This course already exists.' })

    } 
    else if (err.code === '23502') { 
      
      res.status(400).json({ message: 'Missing required field.' })

    } 
    else {

      res.status(500).json({ message: 'Something went wrong!' })

    }
  }
  
}


/////////////////////////////////////////update course/////////////////////////////////////

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

    
    const query = 'SELECT  c.course_category, c.course_code, c.course_no, c.title, c.description, c.course_mode, c.course_duration_weeks, c.course_duration_days, c.eligibility, c.course_type, c.course_director, c.faculty, TO_CHAR(c.created_at::date, \'YYYY-MM-DD\') AS created_at, CONCAT(f.first_name, \' \', COALESCE(f.middle_name, \'\'), \' \', f.last_name) AS courseOfficer FROM courses c JOIN faculty f ON c.course_officer = f.faculty_id'

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
    } = req.body

    const client = await pool.connect()

    let query = `
      SELECT *
      FROM courses
      WHERE 1 = 1
    `

    if (startDate && endDate) {
      
      query += `AND date_comencement >= '${startDate}' 
                 AND date_completion <= '${endDate}'`
    }

  
    if (courseCategory) {

      query += `AND course_category = '${courseCategory}'`

    }

    if (facultyId) {

      query += `AND faculty_id = '${facultyId}'`

    }

    if (eligibility) {

      query += `AND eligibility = '${eligibility}'`

    }

    query += 'ORDER BY date_comencement ASC'

    const result = await client.query(query)

    if (result.rows.length === 0) {

      res.send({ message: "No courses found" })

    } 
    else {

      res.send({ courses: result.rows })

    }

    client.release()

  } 
  catch (err) {

    console.error(err)

    res.send({ message: "Something went wrong" })

  }
}

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
// exports.courseScheduler = async (req, res) => {
//   try {
//     const client = await pool.connect();
//     var {
//       name,
//       course_capacity,
//       date_comencement,
//       date_completion,
//       fee,
//       course_status,
//       batch_no,
//       running_date,
//     } = req.body;

//     const currentDate = new Date();
//     const runningDate = new Date(running_date);

//     if (currentDate > runningDate) {
//       course_status = 'active';
//     } else{
//     course_status = 'Created'
//     }
//     const course_scheduler_id = generateNumericValue(6);
//     const checkCourseIdQuery =
//       'SELECT * from course_scheduler where course_scheduler_id = $1';
//     let result1 = await client.query(checkCourseIdQuery, [
//       course_scheduler_id,
//     ]);

//     while (result1.rows.length !== 0) {
//       course_scheduler_id = generateNumericValue(6);
//       result1 = await client.query(checkCourseIdQuery, [course_scheduler_id]);
//     }

//     const insertQuery =
//       'INSERT INTO course_scheduler (name, course_capacity, date_comencement, date_completion, fee, course_status, batch_no, running_date, course_scheduler_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
//     const values = [
//       name,
//       course_capacity,
//       date_comencement,
//       date_completion,
//       fee,
//       course_status,
//       batch_no,
//       running_date,
//       course_scheduler_id,
//     ];

//     await client.query(insertQuery, values);
//     res.send('Course created successfully');
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error creating course' });
//   }
// };

exports.sendCourseCodeNo = async (req, res) => {
  try {
    const client = await pool.connect();
    const check = 'SELECT DISTINCT course_code, course_no FROM courses';
    const result = await client.query(check);
    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'Not Found!' });
    } else {
      const data = result.rows.map(row => {
        return { course_code: row.course_code, course_no: row.course_no };
      });
      return res.status(200).send({ data });
    }
    await client.release();
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error!' });
  }
};


exports.takeCodeNo=async(req,res)=>{
  try {
    const {code,no,type}=req.params
    const data=[code,no,type]
    const connection=await pool.connect()
    const check='SELECT course_id as courseid,title as coursename,description from courses WHERE course_code=$1 AND course_no=$2 AND course_category=$3 '
    const result=await connection.query(check,data)
    if (result.rowCount===0) {
      return res.status(404).send({message:'No Course Found!.'})
    }
    else{
      return res.status(200).send({course:result.rows})
    }
     await connection.release()
  } catch (error) {
    console.error(error)
    res.status(500).send({message:'Internal Server Error!.'})
  }
}


exports.sendBatchAndInfo = async (req, res) => {
  try {
    const { courseID } = req.params;
    const connection = await pool.connect();
    const check = 'SELECT course_scheduler_id as schedulingid, batch_no as batch, date_comencement as commencementdate, date_completion as completiondate FROM course_scheduler WHERE course_id=$1 AND course_status IN ($2, $3)';
    const data = [courseID, "created", "scheduled"];
    const result = await connection.query(check, data);
    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'No Course Found!' });
    } else {
      return res.status(200).send({ course: result.rows });
    }
    await connection.release();
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error!.' });
  }
};
