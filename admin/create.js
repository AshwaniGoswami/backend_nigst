const pool = require("../config/pool");


///////////////////////create announcement/////////////////////////////
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, description, url } = req.body;
    let photoUrl = null;
    if (req.file) {
      photoUrl = req.file.path;
    }
    const connection = await pool.connect();
    const insert = "INSERT INTO announcement (title, description, url, photo_path) VALUES ($1, $2, $3, $4)";
    const data = [title, description, url, photoUrl];
    const result = await connection.query(insert, data);
    res.send({
      message: "Successfully created"
    });
    await connection.release();
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Something went wrong!' });
  }
};

exports.archiveAnnouncement = async (req, res) => {
  try {
    const { id } = req.body
    const connection = await pool.connect()
    const insert = "INSERT INTO archive_announcement (title , description, url, photo_path, status, created_at) SELECT title , description, url, photo_path, status, created_at FROM announcement WHERE id=$1"
    const result = await connection.query(insert, [id])
    const deleteq = "DELETE FROM announcement WHERE id=$1"
    await connection.query(deleteq,[id])
    res.send({
      message:"successfully Archive"
    })
    await connection.release()
  } catch (error) {
    return res.status(500).send({ message: 'Something went wrong!' });
  }
}


exports.retrieveAnnouncement = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.body;
    const retrieve = `
      INSERT INTO announcement(title, description, url, photo_path, status, created_at) 
      SELECT title, description, url, photo_path, FALSE, created_at 
      FROM archive_announcement WHERE id=$1;
    `;
    await client.query(retrieve, [id]);
    const deleteData = "DELETE FROM archive_announcement WHERE id=$1";
    await client.query(deleteData, [id]);
    await client.query('COMMIT');
    res.send({ message: "Successfully restored" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.send({ message: "Something went wrong!" });
  } finally {
    client.release();
  }
};

exports.viewAnnouncements = async (req, res) => {
  try {
    const connection = await pool.connect();
    const query = "SELECT * FROM announcement";
    const result = await connection.query(query);
    res.send( { announcements: result.rows });
    await connection.release();
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Something went wrong!' });
  }
};





exports.assignSubjects = async (req, res) => {
  try {
    const connection = await pool.connect();
    const { facultyId, subjects } = req.body; 

    const check1 = 'SELECT * FROM faculty WHERE faculty_id = $1';
    const result1 = await connection.query(check1, [facultyId]);
    if (result1.rows.length === 0) {
      res.send({ message: 'Please select valid Faculty.' });
      return; 
    }

    for (const subject of subjects) {
      const check2 = 'SELECT * FROM assigned_subjects WHERE faculty_id = $1 AND subject_name = $2';
      const result2 = await connection.query(check2, [facultyId, subject]);
      if (result2.rows.length > 0) {
        continue; 
      }

      const data = [facultyId, subject];
      const insertQ = 'INSERT INTO assigned_subjects(faculty_id, subject_name) VALUES ($1, $2)';
      await connection.query(insertQ, data);
    }

    res.send({ message: 'Successfully assigned.' });
    await connection.release();
  } catch (error) {
    console.error(error);
    res.send({ message: 'Something went wrong!' });
  }
};
