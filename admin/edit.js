const pool = require("../config/pool");
const fs = require('fs')



exports.updateAdminVerificationStatus = async (req, res) => {
  let client
  try {
    const { email, status } = req.body;

    client = await pool.connect();

    // Check if user with email exists
    const checkQuery = 'SELECT * FROM users WHERE email = $1';
    const result = await client.query(checkQuery, [email]);

    if (result.rowCount === 0) {
      res.status(404).send({ message: 'User not found' });
      return;
    }

    // Update admin_verified status of user
    const updateQuery = 'UPDATE users SET admin_verified = $1 WHERE email = $2';
    await client.query(updateQuery, [status, email]);

   return res.status(200).send({ message: 'Admin verification status updated successfully' });
  } catch (error) {
    console.error(error);
   return res.status(500).send({ message: 'Something went wrong' });
  } finally {
    if (client) {
      await client.release();
    }
  }
};



exports.loginAccess = async (req, res) => {
  let client
  try {
    const { access, email } = req.body;
    client = await pool.connect();
    const check = 'SELECT * FROM faculty WHERE email=$1';
    const result = await client.query(check, [email]);
    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'Nothing to show!.' });
    } else {
      const updation = 'UPDATE faculty SET admin_verified= $1 WHERE email=$2';
      const data = [access, email];
      await client.query(updation, data);
      return res.status(200).send({ message: 'Access Changed!.' });
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


exports.activeInactive = async (req, res) => {
  let client
  try {
    const { change, email } = req.body;
    client = await pool.connect();
    const check = 'SELECT * FROM faculty WHERE email=$1';
    const result = await client.query(check, [email]);
    if (result.rowCount === 0) {
     return res.status(404).send({ message: 'Nothing to show!.' });
    } else {
      const updation = 'UPDATE faculty SET status= $1 WHERE email=$2';
      const data = [change, email];
      await client.query(updation, data);
     return res.status(200).send({ message: 'Access Changed!.' });
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




exports.updateScheduling = async (req, res) => {
  let client;

  try {
    const { status, batch, courseID, newStatus, newRunningDate, newComencementDate, newCompletionDate } = req.body;
    const check = 'SELECT * FROM course_scheduler WHERE course_status=$1 AND batch_no=$2 AND course_id=$3';
    const data = [status, batch, courseID];
    const data1 = [newStatus, status, batch, courseID];

    client = await pool.connect();
    const result = await client.query(check, data);

    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'Record Not Exists!.' });
    } else {
      const statusCheck = result.rows[0].course_status;

      switch (statusCheck) {
        case 'running':
          if (newStatus === 'completed') {
            const updateCompleted = 'UPDATE course_scheduler SET course_status=$1 WHERE course_status=$2 AND batch_no=$3 AND course_id=$4';
            await client.query(updateCompleted, [newStatus, statusCheck, batch, courseID]);
            return res.status(200).send({ message: 'Successfully Changed.' });
          } else {
            return res.send({ message: `Can't change running status to ${newStatus}` });
          }
          break;
        case 'completed':
          return res.send({ message: "It can't be changed" });
          break;
        case 'created':
          if (newStatus === 'canceled') {
            return res.send({ message: 'This feature not implemented yet.' });
          } else if (newStatus === 'postponed') {
            const newDate01 = '9999/02/03';
            const updateCreatedP = 'UPDATE course_scheduler SET course_status=$1,date_comencement=$2,date_completion=$3,running_date=$4 WHERE course_status=$5 AND batch_no=$6 AND course_id=$7';
            const dataS = [newStatus, newDate01, newDate01, newDate01, statusCheck, batch, courseID];
            await client.query(updateCreatedP, dataS);
            return res.status(200).send({ message: 'Successfully Changed!.' });
          } else if (newStatus === 'scheduled') {
            const updateCreatedS = 'UPDATE course_scheduler SET course_status=$1 WHERE course_status=$2 AND batch_no=$3 AND course_id=$4';
            await client.query(updateCreatedS, data1);
            return res.status(200).send({ message: 'Successfully Changed!.' });
          } else {
           return res.send({ message: 'Not Allowed To Change' });
          }
          break;
        case 'scheduled':
          if (newStatus === 'running') {
            const update01 = 'UPDATE course_scheduler SET course_status=$1 WHERE course_status=$2 AND batch_no=$3 AND course_id=$4';
            await client.query(update01, data1);
            return res.status(200).send({ message: 'Successfully Changed!.' });
          } else if (newStatus === 'canceled') {
            return res.send({ message: 'This feature not implemented yet.' });
          } else if (newStatus === 'postponed') {
            const newDate = '9999/02/03';
            const update02 = 'UPDATE course_scheduler SET course_status=$1,date_comencement=$2,date_completion=$3,running_date=$4 WHERE course_status=$5 AND batch_no=$6 AND course_id=$7';
            const dataS = [newStatus, newDate, newDate, newDate, statusCheck, batch, courseID];
            await client.query(update02, dataS);
            return res.status(200).send({ message: 'Successfully Changed!.' });
          } else {
            return res.send({ message: 'Not allowed to update this course to completed or created' });
          }
          break;
        case 'postponed':
          if (newStatus === 'created') {
            if (!newCompletionDate || !newComencementDate || !newRunningDate) {
              return res.status(400).send({ message: 'newCompletionDate, newComencementDate, and newRunningDate are required.' });
            }
            const updatePostponedC = 'UPDATE course_scheduler SET course_status=$1,date_comencement=$2,date_completion=$3,running_date=$4 WHERE course_status=$5 AND batch_no=$6 AND course_id=$7';
            const dataS1 = [newStatus, newComencementDate, newCompletionDate, newRunningDate, statusCheck, batch, courseID];
            await client.query(updatePostponedC, dataS1);
            return res.status(200).send({ message: 'Successfully Changed!.' });
          } else if (newStatus === 'canceled') {
            return res.send({ message: 'This feature not implemented yet.' });
          } else {
            return res.send({ message: 'You are not allowed to change to this status' });
          }
          break;
        default:
         return res.send({ message: 'Something went wrong!.' });
          break;
      }
    }
  } catch (error) {
    console.error(error);
   return res.status(500).send({ message: 'Internal Server Error!.' });
  } finally {
    if (client) {
      await client.release();
    }
  }
};
