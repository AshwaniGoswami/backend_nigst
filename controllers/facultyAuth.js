const sendMail = require("../mailing_Service/mailconfig");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const transporter = require('../mailing_Service/mailconfig');
const pool = require("../config/pool");
const generateNumericValue = require("../generator/NumericId");
const generatePassword = require('generate-password');

exports.facultyCreation = async (req, res) => {
  let client;
  try {
    const {
      first_name,
      middle_name,
      last_name,
      dob,
      phone,
      gender,
      email,
      education,
      designation,
      profile,
      faculty,
      loginAccess
    } = req.body;

    client = await pool.connect();

    const checkEmailQuery = 'SELECT * FROM faculty WHERE email=$1';
    const resultEmail = await client.query(checkEmailQuery, [email]);

    if (resultEmail.rowCount > 0) {
      res.status(400).send({ error: 'Faculty already exists' });
      return;
    }

    let facultyId = 'T-NIGST' + generateNumericValue(8);

    const query2 = 'SELECT * FROM faculty WHERE faculty_id = $1';
    let result2 = await client.query(query2, [facultyId]);

    while (result2.rowCount !== 0) {
      facultyId = 'T-NIGST' + generateNumericValue(8);
      result2 = await client.query(query2, [facultyId]);
    }

    const password = generatePassword.generate({
      length: 10,
      numbers: true,
      symbols: true,
      uppercase: true,
      excludeSimilarCharacters: true,
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    await client.query('BEGIN');

    const data = [
      first_name,
      middle_name,
      last_name,
      dob,
      phone,
      gender,
      email,
      education,
      designation,
      profile,
      faculty,
      loginAccess,
      facultyId,
    ];

    const insertFacultyQuery =
      'INSERT INTO faculty(first_name,middle_name,last_name,dob,phone,gender,email,education,designation,profile,faculty,admin_verified,faculty_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)';

    await client.query(insertFacultyQuery, data);

    const insertPasswordQuery ='INSERT INTO faculty_passwords(faculty_email,password) VALUES($1,$2)';
    await client.query(insertPasswordQuery, [email, hashedPass]);

    await client.query('COMMIT');

    res.status(200).send({ message: 'Successfully Created', password: password });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.send({ message: 'Something went wrong' });
  } finally {
    if (client) {
      client.release();
    }
  }
};




exports.facultyPassForgot = async (req, res) => {
  let connection;
  try {
    const { email } = req.body;

    connection = await pool.connect();

    const checkQuery = 'SELECT * FROM faculty WHERE email=$1';
    const result1 = await connection.query(checkQuery, [email]);

    const checkQuery2 = 'SELECT * FROM faculty_passwords WHERE faculty_email=$1';
    const result2 = await connection.query(checkQuery2, [email]);

    if (result1.rows.length === 0 || result2.rowCount === 0) {
      return res.send({ message: 'User not found!' });
    } else {
      const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '30m' });
      const resetURL = `${process.env.URL_FRONT}#/password/${resetToken}`;

      const updateQuery = 'UPDATE faculty_passwords SET reset_token=$1 WHERE faculty_email=$2';
      const updateData = [resetToken, email];
      await connection.query(updateQuery, updateData);

      sendMail(
        `${email}`,
        'Password-reset',
        `<p>You requested for password reset</p><h5>Click on this <a href=${resetURL}>link</a> to reset password</h5>`
      );

      return res.send({ message: 'Reset Token sent to email' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal Server Error!' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};




exports.facultyLogin = async (req, res) => {

  let client

  try {

    const { email, password } = req.body

    client = await pool.connect()


    const userQuery = 'SELECT * FROM faculty WHERE email = $1'

    const userResult = await client.query(userQuery, [email])


    if (userResult.rows.length === 0) {

      return res.status(404).send('User not exists!')

    }

    const user = userResult.rows[0]

    if (!user.admin_verified) {

      return res.status(401).json({ message: 'User not verified' })

    }

    const facultyEmail = user.email

    const passwordQuery = 'SELECT * FROM faculty_passwords WHERE faculty_email = $1'

    const passwordResult = await client.query(passwordQuery, [facultyEmail])


    if (passwordResult.rows.length === 0) {

      return res.status(401).json({ message: 'Invalid email or password' })

    }

    const storedPassword = passwordResult.rows[0].password

    const passwordMatch = await bcrypt.compare(password, storedPassword)


    if (!passwordMatch) {

      return res.status(401).json({ message: 'Invalid email or password' })

    }

    const tokenPayload = { id: user.email }

    const tokenOptions = { expiresIn: '1h' }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, tokenOptions)


    return res.status(200).json({ token, type: user.faculty })

  } 
  catch (error) {

    console.error(error)

    return res.status(500).send('Internal Server Error!')
    
  } 
  finally {

    await client.release()

  }
}


exports.fPassReset = async (req, res) => {
  let client;
  try {
    const { password, resetToken } = req.body;

    if (!password || !resetToken) {
      return res.status(400).json({ message: 'Password and reset token are required.' });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const email = decoded.email;

    client = await pool.connect();

    const query = 'SELECT * FROM faculty_passwords WHERE faculty_email = $1';
    const result = await client.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User does not exist.' });
    }

    if (resetToken !== result.rows[0].reset_token) {
      return res.status(401).json({ message: 'Invalid reset token.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const updatePassword = 'UPDATE faculty_passwords SET password = $1, reset_token = NULL WHERE faculty_email = $2';
    await client.query(updatePassword, [hash, email]);

    return res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Reset token has expired.' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid reset token.' });
    } else {
      return res.status(500).json({ message: 'Password reset failed.' });
    }
  } finally {
    if (client) {
      client.release();
    }
  }
};



////////////////////////////////////////change password by dashboard///////////////////////////

exports.fChangePassword = async (req, res) => {
  let client;
  try {
    const { facultyId, oldPassword, newPassword } = req.body;

    client = await pool.connect();

    const query = 'SELECT email FROM faculty WHERE faculty_id = $1';
    const result = await client.query(query, [facultyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    const check = 'SELECT * FROM faculty_passwords WHERE faculty_email=$1';
    const respo = await client.query(check, [result.rows[0].email]);

    if (respo.rowCount === 0) {
      return res.status(404).send({ message: 'User Not Exists!.' });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, respo.rows[0].password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect Existing Password!.' });
    }

    const salt = await bcrypt.genSalt(16);
    const hash = await bcrypt.hash(newPassword, salt);

    const updatePassword = 'UPDATE faculty_passwords SET password = $1 WHERE faculty_email = $2';
    await client.query(updatePassword, [hash, result.rows[0].email]);

    return res.status(200).json({ message: 'Password change successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Password change failed!.' });
  } finally {
    if (client) {
      client.release();
    }
  }
};



// exports.facultyPosition = async (req, res) =>{
//   try{
//     const client = await pool.connect();
//     const {faculty_pos, description } = req.body;

//     let positionId =  generateNumericValue(6);

//     const query2 = 'SELECT * FROM faculty_position WHERE position_id = $1';
//     let result2 = await client.query(query2, [positionId]);

//     while (result2.rowCount !== 0) {
//       positionId =  generateNumericValue(6);
//       result2 = await client.query(query2, [positionId]);
//     }
//     const result = await pool.query(
//       `INSERT INTO faculty_position(faculty_pos, position_id, description) VALUES ($1,$2,$3) RETURNING*`,
//       [faculty_pos,positionId , description]
//     );
//     res.send({message:"Successfully Position Created"});
//     await client.release();
//   }catch (error) {
//     console.error(error)
//     return res.status(500).send({ message: 'Something went wrong!' });
//   }
// }



exports.facultyPosition = async (req, res) => {
  let client;
  try {
    client = await pool.connect();

    const { faculty_pos, description } = req.body;

    const checkResult1 = await pool.query('SELECT * FROM faculty_position WHERE faculty_pos = $1', [faculty_pos]);

    if (checkResult1.rows.length > 0) {
      return res.status(400).send({
        message: 'Faculty position already exists.',
      });
    }

    let positionId = generateNumericValue(6);

    const query2 = 'SELECT * FROM faculty_position WHERE position_id = $1';
    let result2 = await client.query(query2, [positionId]);

    while (result2.rowCount !== 0) {
      positionId = generateNumericValue(6);
      result2 = await client.query(query2, [positionId]);
    }

    const data = [faculty_pos, positionId, description];
    const create = 'INSERT INTO faculty_position(faculty_pos, position_id, description) VALUES ($1,$2,$3) RETURNING*';
    const result = await pool.query(create, data);

    return res.send({ message: 'Successfully Created' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal server error!' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

exports.viewAllFacultyPositions = async (req, res) => {
  let connection;
  try {
    connection = await pool.connect();

    const result = await connection.query('SELECT * FROM faculty_position');

    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'Nothing to Show!.' });
    } else {
      return res.status(200).send({ data: result.rows });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal Server Error!.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};



exports.positionSend = async (req, res) => {
  let client;
  try {
    client = await pool.connect();

    const query = 'SELECT * FROM faculty_position';
    const query1 = 'SELECT first_name, middle_name, last_name, designation FROM faculty';

    const result = await client.query(query);
    const result1 = await client.query(query1);

    if (result.rows.length === 0 && result1.rows.length === 0) {
      return res.status(404).send({ message: 'Nothing to show.' });
    }

    return res.send({ position: result.rows, faculty: result1.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal Server Error!.' });
  } finally {
    if (client) {
      client.release();
    }
  }
};




exports.officerFaculty = async (req, res) => {

  try {

    const client = await pool.connect()

    const { profile } = req.params

    const query = `select * from faculty where profile =$1`

    const result = await client.query(query, [profile])

    if (result.rowCount === 0) {

      return res.status(404).send(
        { message: 'Nothing to Show!.' }
      )
    }
       
  return  res.status(200).send({data:result.rows})

    await client.release()

  } 
  catch (error) {

    console.error(error)

    return res.status(500).send({ message: 'Something went wrong!' })

  }
}

/////////////////////////faculty position assi/////////////////

// exports.facultyPositionAssi = async(req,res) =>{
//   try{
//     const client= await pool.connect();
//     const {facultyId, faculty_pos,faculty_admin, position_assi_id}=req.body;
//     const check='SELECT * FROM faculty WHERE name=$1'
//     const result=await client.query(check,[faculty_admin])
//     if (result.rowCount===0) {
//       res.send({message:'Admin of this faculty not exists.'})
//     }
//     const query = 'INSERT INTO faculty_position_assi(faculty_id, faculty_pos, faculty_admin, position_assi_id) values($1,$2,$3,$4)';
//     const values = [ facultyId, faculty_pos, faculty_admin, position_assi_id];
//     await client.query(query, values);
//     res.status(200).send({ message: 'Successfully assign Faculty Position' });
//       await client.release() 

//   }catch (error) {
//     console.error(error)
//     return res.status(500).send({ message: 'Something went wrong!' });
//   }
// }

exports.facultyPositionAssi = async (req, res) => {
  let client;
  try {
    client = await pool.connect();

    const { facultyId, faculty_pos, faculty_admin, position_assi_id } = req.body;

    const checkAdmin = 'SELECT * FROM faculty WHERE faculty=$1';
    const resultAdmin = await client.query(checkAdmin, [faculty_admin]);

    if (resultAdmin.rowCount === 0) {
      return res.status(400).send({ message: 'Admin of this faculty does not exist.' });
    }

    const checkPosition = 'SELECT * FROM faculty_position WHERE faculty_pos=$1';
    const resultPosition = await client.query(checkPosition, [faculty_pos]);

    if (resultPosition.rowCount === 0) {
      return res.status(400).send({ message: 'Faculty position does not exist.' });
    }

    const query = 'INSERT INTO faculty_position_assi(faculty_id, faculty_pos, faculty_admin, position_assi_id) values($1,$2,$3,$4)';
    const values = [facultyId, faculty_pos, faculty_admin, position_assi_id];
    await client.query(query, values);

    return res.status(200).send({ message: 'Successfully assign Faculty Position' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal Server Error!' });
  } finally {
    if (client) {
      client.release();
    }
  }
};


exports.viewFaculty = async (req, res) => {
  let client;
  try {
    client = await pool.connect();

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;

    const dataQ = 'SELECT * FROM faculty ORDER BY created_on_date_time LIMIT $1 OFFSET $2';
    const result = await client.query(dataQ, [limit, offset]);

    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'No records to display.' });
    } else {
      return res.status(200).send({ data: result.rows });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal server error.' });
  } finally {
    if (client) {
      client.release();
    }
  }
};
