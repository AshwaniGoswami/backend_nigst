const sendMail = require("../mailing_Service/mailconfig");
const { v1: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const transporter = require('../mailing_Service/mailconfig');
const pool = require("../config/pool");
const generateNumericValue = require("../generator/NumericId");
const generatePassword = require('generate-password');

exports.facultyCreation = async (req, res) => 
{
  try 
  {
    const 
    {
      first_name,
      middle_name,
      last_name,
      dob,
      phone,
      gender,
      email,
      education,
      designation,
      profile
    } = req.body;

    const client = await pool.connect();

    const checkEmailQuery = 'SELECT * FROM faculty WHERE email=$1';
    const resultEmail = await client.query(checkEmailQuery, [email]);

    if (resultEmail.rowCount > 0) 
    {
      res.status(400).send({ error: 'Faculty already exists' });
      await client.release();
      return;
    }

    let regNum = uuidv4();

    const checkRegNumQuery =
      'SELECT * FROM faculty JOIN faculty_passwords ON faculty.unique_id = faculty_passwords.unique_id WHERE faculty.unique_id = $1';

    let regRes = await client.query(checkRegNumQuery, [regNum]);

    while (regRes.rowCount > 0) 
    {
      regNum = uuidv4();
      regRes = await client.query(checkRegNumQuery, [regNum]);
    }

    let facultyId = 'T-NIGST' + generateNumericValue(8);

    const query2 = 'SELECT * FROM faculty WHERE faculty_id = $1';
    let result2 = await client.query(query2, [facultyId]);

    while (result2.rowCount !== 0) 
    {
      facultyId = 'T-NIGST' + generateNumericValue(8);
      result2 = await client.query(query2, [facultyId]);
    }

    const password = generatePassword.generate
    (
      {
        length: 10,
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
      }
    );

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const data = 
    [
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
    ];

    const insertFacultyQuery =
      'INSERT INTO faculty(first_name,middle_name,last_name,dob,phone,gender,email,education,designation,profile,unique_id,faculty_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)';

    await client.query(insertFacultyQuery, [...data, regNum, facultyId]);

    const insertPasswordQuery =
      'INSERT INTO faculty_passwords(faculty_email,password,unique_id) VALUES($1,$2,$3)';
    await client.query(insertPasswordQuery, [email, hashedPass, regNum]);

    res.status(200).send({ message: 'Successfully Created', password: password });

    await client.release();
  } catch (error) {
    console.error(error);
    res.send({ message: 'Something went wrong' });
  }
};
exports.facultyPassForgot = async (req, res) => {

  try {

    const { email } = req.body

    const connection = await pool.connect()

    const check = 'SELECT * FROM faculty WHERE email=$1'

    const result1 = await connection.query(check, [email])

    if (result1.rows.length === 0) {

      res.send({ message: 'User not found!.' })

      connection.release()

    }
    else {

      const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '30m' })

      const resetURL = `${process.env.URL_FRONT}/passwordform/resetpassword.html?/reset/secure/${resetToken}`

      const update = 'UPDATE faculty_passwords SET reset_token=$1,WHERE email=$'

      const data = [resetToken, email]

      await connection.query(update, data)

      sendMail(`${email}`, 'Password-reset', `<p>You requested for password reset</p>
     <h5>Click on this <a href=${resetURL}>link</a> to reset password</h5>`)

      await connection.release()

      res.send({ message: 'Reset Token sent to email' })

    }

  }
  catch (error) {

    res.send({ message: 'Something went wrong!.' })

  }

}
exports.facultyLogin = async (req, res) => {

  try {

    const { email, password } = req.body

    const psCon = await pool.connect()

    const check = 'SELECT * FROM faculty WHERE email=$1'

    const result1 = await psCon.query(check, [email])

    if (result1.rows.length === 0) {

      res.send('User not exists!.')

    }
    else {
      const user = result1.rows[0]
      if (!user.hasOwnProperty('admin_verified') || user.admin_verified === false) {
        res.json({ message: 'User not verified' })
      }

    else {

      const role = result1.rows[0].role

      const faculty = result1.rows[0].email

      const check2 = 'SELECT * FROM faculty_passwords WHERE faculty_email=$1'

      const result2 = await psCon.query(check2, [faculty])

      if (result2.rows.length === 0) {

        res.send({ message: 'Invalid Email or Password' })

      }
      else {

        const iPass = result2.rows[0].password

        const match = await bcrypt.compare(password, iPass)

        if (!match) {

          res.send({ message: 'Invalid Credentials!.' })

        }
        const data = {

          id: result1.rows[0].faculty_id

        }

        const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1h' })

        res.send({ token, type: role })
      }
        await psCon.release()
      
    }
    }
  }
  catch (error) {

    res.send({ message: 'Something went wrong!.' })

  }

}
exports.fPassReset = async (req, res) => {


  try {

    const { password, resetToken } = req.body

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET)

    const email = decoded.email

    const client = await pool.connect()

    const query = `SELECT * FROM faculty_passwords WHERE email = $1`


    const result = await client.query(query, [email])

    if (result.rows.length === 0) {

      return res.status(404).json({ message: 'Email not found' })

    }

    if (!resetToken || resetToken !== result.rows[0].reset_token) {


      return res.status(401).json({ message: 'Invalid reset token' })

    }

    const salt = await bcrypt.genSalt(16)

    const hash = await bcrypt.hash(password, salt)


    const updatePassword = 'UPDATE faculty_passwords SET password = $1, reset_token = NULL WHERE email = $2'

    await client.query(updatePassword, [hash, email])

    await client.release()

    return res.status(200).json({ message: 'Password reset successful' })

  }
  catch (error) {

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).send('Token expired')
    }
    else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).send('Invalid token')
    }
    else {
      res.status(500).send({ message: 'Password reset failed' })
    }
  }
}
////////////////////////////////////////change password by dashboard///////////////////////////
exports.fChangePassword = async (req, res) => {
  try {
    const { faculty_id, oldPassword, newPassword } = req.body;

    const client = await pool.connect();

    const query = `SELECT * FROM faculty_passwords WHERE faculty_id = $1`;

    const result = await client.query(query, [faculty_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, result.rows[0].password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    const salt = await bcrypt.genSalt(16);
    const hash = await bcrypt.hash(newPassword, salt);

    const updatePassword = 'UPDATE faculty_passwords SET password = $1 WHERE faculty_id = $2';

    await client.query(updatePassword, [hash, faculty_id]);
    await client.release();

    return res.status(200).json({ message: 'Password change successful' });
  } catch (error) {
    res.status(500).send({ message: 'Password change failed' });
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



exports.facultyPosition = async (req, res) =>{
  try{
    const client = await pool.connect();
    const {faculty_pos, description } = req.body;

    const checkResult1 = await pool.query(`SELECT id FROM faculty_position WHERE faculty_pos = $1`, [faculty_pos]);
    if (checkResult1.rows.length > 0) {
      return res.status(400).send({
        message: `Duplicate faculty position found`
      });
    }

    let positionId =  generateNumericValue(6);

    const query2 = 'SELECT * FROM faculty_position WHERE position_id = $1';
    let result2 = await client.query(query2, [positionId]);

    while (result2.rowCount !== 0) {
      positionId =  generateNumericValue(6);
      result2 = await client.query(query2, [positionId]);
    }
    const result = await pool.query(
      `INSERT INTO faculty_position(faculty_pos, position_id, description) VALUES ($1,$2,$3) RETURNING*`,
      [faculty_pos,positionId , description]
    );
    res.send({message:"Successfully Position Created"});
    await client.release();
  }catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Something went wrong!' });
  }
}

exports.viewAllFacultyPositions = async (req, res) => {
  try {
    const connection = await pool.connect();
    const result = await connection.query('SELECT * FROM faculty_position');
    res.send(result.rows);
    await connection.release();
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Something went wrong!' });
  }
};


exports.positionSend = async (req,res) =>{
  try{
    const client = await pool.connect();
    const Query = `SELECT * FROM faculty_position`
    const Query1 ='SELECT first_name,middle_name,last_name FROM faculty'
    const result1 =await client.query(Query1)
    const result= await client.query(Query)

    if (result.rows.length===0 && result1.rows.length===0){
      res.send({message:'nothing to show'})
    }
    res.send({position:result.rows,faculty:result1.rows})
    await client.release()
  }catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Something went wrong!' });
  }
}
exports.officerFaculty = async(req,res) =>{
  try{
    const client = await pool.connect();
    const {profile}=req.body;
    const query = `select * from faculty where profile =$1`
    const result =await client.query(query,[profile])
    if(result.rowCount===0)
      {
        res.send(
          {message:'nothing to show'}
          )
        }
      res.send(result.rows)
      await client.release()

  }catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Something went wrong!' });
  }
}
/////////////////////////faculty position assi/////////////////
exports.facultyPositionAssi = async(req,res) =>{
  try{
    const client= await pool.connect();
    const {facultyId, faculty_pos,faculty_admin, position_assi_id}=req.body;
    const query = 'INSERT INTO faculty_position_assi(faculty_id, faculty_pos, faculty_admin, position_assi_id) values($1,$2,$3,$4)';
    const values = [ facultyId, faculty_pos, faculty_admin, position_assi_id];
    await client.query(query, values);
    res.status(200).send({ message: 'Successfully assign Faculty Position' });
      await client.release() 

  }catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Something went wrong!' });
  }
}