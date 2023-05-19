const { Client } = require("pg");
const pool = require("../config/pool");
const generateNumericValue = require("../generator/NumericId");



exports.departments = async (req, res) => {
  let connection;
  try {
    // Extract the required data from the request body
    connection = await pool.connect();
    const { organization, type, category, department, ministry , email, phone } = req.body;

    // Check if organization already exists in the database
    const checkOrgResult = await pool.query(`SELECT id FROM organizations WHERE organization = $1`, [organization]);
    if (checkOrgResult.rows.length > 0) {
      return res.status(400).send({
        message: `Duplicate organization found`
      });
    }

    // Insert the new department into the database
    const insertResult = await pool.query(
      `INSERT INTO organizations (organization, type, category, department, ministry, email, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [organization, type, category, department, ministry, email, phone]
    );

    return res.send({
      message: "Successfully created"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Something went wrong!' });
  } finally {
    if (connection) {
    await  connection.release();
    }
  }
};



exports.viewAllOrganizations = async (req, res) => {
  let connection;
  try {
    connection = await pool.connect();
    const result = await connection.query('SELECT * FROM organizations');
    return res.send(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Something went wrong!' });
  } finally {
    if (connection) {
     await connection.release();
    }
  }
};




exports.viewOrganizations = async (req, res) => {
  let connection;
  try {
    connection = await pool.connect();
    const result = await connection.query('SELECT organization FROM organizations');
    return res.send(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Something went wrong!' });
  } finally {
    if (connection) {
    await  connection.release();
    }
  }
};



exports.organizationCourseAssi = async (req, res) => {

  let connection;

  try {

    connection = await pool.connect();

    const { organization, courseid, code, courseNo, batch, schedulingID, commencement, completition } = req.body;

    const checkFacultyExistsQuery = 'SELECT * from organization_course_assi WHERE course_id = $1 AND organization_name = $2';

    const checkCourseExists = [courseid, organization];

    const result = await connection.query(checkFacultyExistsQuery, checkCourseExists);

    if (result.rows.length !== 0) {

      return res.status(400).json({ message: `This course already assigned to ${organization}` });

    }
    else {

      let organization_course_id = generateNumericValue(7);

      const checkOrganizationIdQuery = 'SELECT * FROM organization_course_assi WHERE organization_course_id = $1';

      let result1 = await connection.query(checkOrganizationIdQuery, [organization_course_id]);


      while (result1.rows.length !== 0) {

        organization_course_id = generateNumericValue(7);

        result1 = await connection.query(checkOrganizationIdQuery, [organization_course_id]);

      }

      const insertQuery = 'INSERT INTO organization_course_assi(organization_name, course_id, code, batch_no, course_no, scheduling_id, date_commencement, date_completion, organization_course_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';

      const values = [organization, courseid, code, batch, courseNo, schedulingID, commencement, completition, organization_course_id];

      await connection.query(insertQuery, values);

      return res.status(201).send('Organization Courses Creation Successfully');

    }

  }
   catch (err) {

    console.error(err);

    return res.status(500).json({ message: 'Error creating organization' });

  } 
  finally {

    if (connection) {

      await connection.release();

    }
  }
};




exports.otherCategory = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const query = `SELECT category FROM organizations WHERE type=$1`;
    const result = await client.query(query, ['Other']);
    if (result.rows.length === 0) {
      return res.send({ message: "Nothing To Show" });
    }
    return res.send({ organizations: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error!.' });
  } finally {
    if (client) {
    await  client.release();
    }
  }
};


exports.courseAssi = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const query = `SELECT organization FROM organizations`;
    const result = await client.query(query);
    if (result.rows.length === 0) {
      return res.send({ message: "Nothing To Show" });
    }
    return res.send({ organization: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating organization' });
  } finally {
    if (client) {
    await  client.release();
    }
  }
};


exports.idAssi = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const query = `SELECT course_id FROM courses`;
    const result = await client.query(query);
    if (result.rows.length === 0) {
      return res.send({ message: "Nothing To Show" });
    }
    return res.send({ courses: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating organization' });
  } finally {
    if (client) {
    await  client.release();
    }
  }
};



exports.departAssi = async (req, res) => {
  let client;
  try {
    const { org_name, courseId, des } = req.body;
    const query = 'INSERT INTO org_assi(organization_name, course_id, des) VALUES($1, $2, $3)';
    const values = [org_name, courseId, des];
    client = await pool.connect();
    await client.query(query, values);
    return res.status(200).json({ message: 'Successfully created' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating organization' });
  } finally {
    if (client) {
    await  client.release();
    }
  }
};



exports.viewdepartAssi = async (req, res) => {
  let connection
  try {
     connection = await pool.connect();
    const result = await connection.query('SELECT * FROM org_assi');
   return res.send(result.rows);
  } catch (error) {
    console.error(error);
   return res.status(500).send({ message: 'Something went wrong!' });
  }
  finally {
    if (connection) {
    await  connection.release();
    }
  }
};