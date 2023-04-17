const sendMail = require("../mailing_Service/mailconfig");
const { v1: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const transporter = require('../mailing_Service/mailconfig')
const pool = require("../config/pool");
const generateNumericValue = require("../generator/NumericId");
const pg = require('pg');

exports.login = async (req, res) => {
  try {
    const client = await pool.connect()

    const email = req.body.email
    const password = req.body.password

    const userQuery = `SELECT * FROM users WHERE email = $1`

    const userResult = await client.query(userQuery, [email])
    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' })
    } else {
      const user = userResult.rows[0]
      if (!user.hasOwnProperty('email_verified') || user.email_verified === false) {
        res.json({ message: 'User not verified' })
      }

      else {
        const passwordQuery = `SELECT * FROM password WHERE email = '${userResult.rows[0].email}'`
        const passwordResult = await client.query(passwordQuery)

        if (passwordResult.rows.length === 0) {
          res.json({ error: 'Invalid email or password' })
        } else {
          const userRole = user.role

          const match = await bcrypt.compare(password, passwordResult.rows[0].password)

          if (match) {
            const updateQuery = `
              UPDATE users
              SET updated_at = NOW()
              WHERE email = '${email}'
            `;
            await client.query(updateQuery);

            const data = {
              id: passwordResult.rows[0].student_id,
            };

            const veri = userResult.rows[0].email_verified

            const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1h' })

            res.status(200).json({ token, verification: veri, type: userRole })
          } else {
            res.status(401).json({ error: 'Invalid email or password' })
          }
        }
      }
    }
    await client.release()
  } catch (error) {
    res.status(500).json({ error: 'Error connecting to the server' })
  }
};





exports.signUp = async (req, res) => {
  const regNum = uuidv4();
  const studentId = 'S-NIGST' + generateNumericValue(8);
  try {
    const client = await pool.connect();

    const { fname, mname, lname, dob, phone, gender, email, password, organization } = req.body;
    if (!password || password==="") {
      res.send({ message: 'Please provide a password' });
      await client.release();
      return;
    }

    const checkQuery = 'SELECT * FROM users WHERE email = $1';
    const result = await client.query(checkQuery, [email]);

    if (result.rowCount > 0) {
      res.send({ message: 'User already exists' });
      await client.release();
      return;
    }

    const checkRegNum =
      'SELECT * FROM users JOIN password ON users.reg_device_v1 = password.reg_device_v1 WHERE users.reg_device_v1 = $1';
    const regNumValue = [regNum];
    const regRes = await client.query(checkRegNum, regNumValue);

    if (regRes.rowCount > 0) {
      res.send({ message: 'Reg number already exists.' });
      await client.release();
      return;
    } else {
      const query2 = "SELECT * FROM users WHERE student_id = $1";
      let result2 = await client.query(query2, [studentId]);
      while (result2.rows.length !== 0) {
        studentId = 'S-NIGST' + generateNumericValue(8);
        result2 = await client.query(query2, [studentId]);
      }
      const salt = await bcrypt.genSalt(16);
      const hashedPass = await bcrypt.hash(password, salt);

      const data = [fname, mname, lname, dob, phone, gender, email,organization, regNum];
      const insertQuery =
        'INSERT INTO users (first_name, middle_name, last_name, dob, phone, gender, email,organization, reg_device_v1,student_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
      await client.query(insertQuery, [...data, studentId]);

      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: '30m',
      });

      const url = `${process.env.URL}/secure/${token}/${regNum}`;

      const data2 = [email, hashedPass, regNum];
      const passQuery =
        'INSERT INTO password (email, password, reg_device_v1) VALUES ($1, $2, $3)';
      await client.query(passQuery, data2);

      sendMail(
        `${req.body.email}`,
        'Please verify your email.',
        `<p>Hello ${req.body.fname} ${req.body.lname}, Thanks for registering with us. Please click below to verify your email.</p><br><a href=${url}><button style="color:white;background-color:#4CFA50;border-radius:8px;border:none;padding:auto;">Click Here to Verify Your Email</button></a>`
      );
      res
        .status(200)
        .send({ message: 'Verification email sent. Please check your email to verify.' });

      await client.release();
    }
  } catch (error) {
    console.log(error)
      res.status(500).send({ message: 'Something went wrong' });
    }
  }




exports.ForgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    const client = await pool.connect()

    const results = await client.query('SELECT * FROM users WHERE email = $1', [email])

    if (results.rowCount === 0) {
      await client.release()
      return res.status(404).json({ message: 'Email not found' })
    } else {
      const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '30m' })
      const resetURL = `${process.env.URL_FRONT}/passwordform/resetpassword.html?reset/auth/${resetToken}`
      await client.query('UPDATE password SET reset_token = $1 WHERE email = $2', [resetToken, email])

      sendMail(`${email}`, 'Password reset', `<p>You requested for password reset</p>
        <h5>Click on this <a href=${resetURL}>link</a> to reset password</h5>`)

      await client.release()
      return res.status(200).json({ message: 'Reset token sent to email' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}




exports.passwordReset = async (req, res) => {


  try {
    const { password, resetToken } = req.body;
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET)
    const email = decoded.email
    console.log(email)
    const client = await pool.connect();
    const query = `SELECT * FROM password WHERE email = $1`;

    const result = await client.query(query, [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    if (!resetToken || resetToken !== result.rows[0].reset_token) {
      console.log(resetToken)
      console.log(result.rows[0].reset_token)
      return res.status(401).json({ message: 'Invalid reset token' });
    }



    const salt = await bcrypt.genSalt(16);
    const hash = await bcrypt.hash(password, salt);

    const updatePassword = 'UPDATE password SET password = $1, reset_token = NULL WHERE email = $2';

    await client.query(updatePassword, [hash, email]);

    await client.release();
    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).send('Token expired');
    }
    else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).send('Invalid token');
    }
    else {
      res.status(500).send({ message: 'Password reset failed' });
    }
  }
};



exports.verifyEmail = async (req, res) => {
  const regNum = req.params.regNum;
  const token = req.params.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const client = await pool.connect();
    const queryText = 'SELECT id, email_verified FROM users WHERE email = $1 AND reg_device_v1 = $2';
    const queryParams = [email, regNum];
    const result = await client.query(queryText, queryParams);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    if (result.rows[0].is_verified) {
      throw new Error('Email already verified');
    }

    const updateQuery = 'UPDATE users SET email_verified = true WHERE email = $1 AND reg_device_v1 = $2';
    const updateResult = await client.query(updateQuery, queryParams);

    if (updateResult.rowCount > 0) {
      res.status(200).send('Email verified successfully');
    } else {
      throw new Error('User not found');
    }

    await client.release();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).send('Token expired');
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).send('Invalid token');
    } else {
      console.error(err);
      res.status(401).send('Invalid email or registration number');
    }
  }
}






exports.sendVeriMailAgain = async (req, res) => {


  try {
    const email = req.body.email

    const connection = await pool.connect()

    const query = 'SELECT first_name, last_name, reg_device_v1 FROM users WHERE email = $1'


    const result = await connection.query(query, [email])

    if (result.rows.length === 0) {

      res.status(404).send({ error: 'User not found' })
      return
    }
    else {
      const { first_name, last_name, reg_device_v1 } = result.rows[0]
      const newToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '30m' })

      const url = `${process.env.URL}/secure/${newToken}/${reg_device_v1}`


      sendMail(email, 'Please verify your email', `
    <p>Hello ${first_name} ${last_name},</p>
    <p>Thanks for registering with us. Please click the link below to verify your email:</p>
    <a href="${url}">Verify Email</a>
  `)


      res.status(200).send({ message: 'Verification email sent' })

    }
    await connection.release()
  }
  catch (err) {

    res.status(500).send({ error: 'Something went wrong' })

  }
}

// exports.usersFilter = async (req, res) => {
//   try {
//     const client = await pool.connect();
//     const { email, org_name, adminVef, start_date, end_date } = req.query;
//     let query = 'SELECT * FROM users WHERE 1=1';

//     if (email) {
//       query += ` AND email ILIKE '%${email}%'`;
//     }

//     if (org_name) {
//       query += ` AND organization ILIKE '%${org_name}%'`;
//     }

//     if (adminVef !== undefined) {
//       query += ` AND admin_verified = ${adminVef}`;
//     }

//     if (start_date && end_date) {
//       query += ` AND ((created_at >= '${start_date}' AND created_at <= '${end_date}') OR (updated_at >= '${start_date}' AND updated_at <= '${end_date}'))`;
//     } else {
//       if (start_date) {
//         query += ` AND (created_at >= '${start_date}' OR updated_at >= '${start_date}')`;
//       }
//       if (end_date) {
//         query += ` AND (created_at <= '${end_date}' OR updated_at <= '${end_date}')`;
//       }
//     }

//     const { rows } = await client.query(query);

//     res.status(200).json(rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };



// exports.usersFilter = async (req, res) => {
//   try {
//     const client = await pool.connect();
//     const { email, org_name, adminVef, start_date, end_date } = req.body;
//     let query = 'SELECT * FROM users WHERE 1=1';

//     if (email) {
//       query += ` AND email ILIKE '%${email}%'`;
//     }

//     if (org_name) {
//       query += ` AND organization ILIKE '%${org_name}%'`;
//     }

//     if (adminVef === "true" || adminVef === "false") {
//       query += ` AND admin_verified = ${adminVef === "true"}`;
//     } 
    
//     if (start_date && end_date) {
//       query += ` AND created_at BETWEEN '${start_date}' AND '${end_date}'`;
//     } else {
//       if (start_date) {
//         query += ` AND created_at >= '${start_date}'`;
//       }
//       if (end_date) {
//         query += ` AND created_at <= '${end_date}'`;
//       }
//     }

//     const { rows } = await client.query(query);

//     if (rows.length === 0) {
//       res.status(404).json({ message: 'No users found.' });
//     } else {
//       res.status(200).json(rows);
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// API VIEW ALL USERS WHERE DATE IS UNALTERED

// exports.viewUsers = async (req, res) => {
//   try {
//     const client = await pool.connect();
//     const query = "SELECT id, first_name, middle_name, last_name, TO_CHAR(dob, 'YYYY-MM-DD') AS dob, phone, gender, email, organization, email_verified, mobile_verified, admin_verified, student_id, user_status, reg_device_v1, TO_CHAR(created_at, 'YYYY-MM-DD') AS created_at, TO_CHAR(updated_at, 'YYYY-MM-DD') AS updated_at FROM users";
//     const result = await client.query(query);
//     res.send({ users: result.rows });
//     await client.release();
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: "Something went wrong!" });
//   }
// };


// API VIEW ALL USERS WHERE DATE IS UNALTERED

// exports.viewUsers = async (req, res) => {
//   try {
//     const connection = await pool.connect();
//     const result = await connection.query('SELECT * FROM users');
//     res.send(result.rows);
//     await connection.release();
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: 'Something went wrong!' });
//   }
// };


// exports.viewUsers = async (req, res) => {
//   try {
//     const connection = await pool.connect();
//     const result = await connection.query(`
//       SELECT 
//         id, 
//         first_name, 
//         middle_name, 
//         last_name, 
//         dob, 
//         phone, 
//         gender, 
//         email, 
//         organization, 
//         CASE 
//           WHEN email_verified THEN 'true' 
//           ELSE 'false' 
//         END AS email_verified, 
//         CASE 
//           WHEN mobile_verified THEN 'true' 
//           ELSE 'false' 
//         END AS mobile_verified, 
//         CASE 
//           WHEN admin_verified THEN 'true' 
//           ELSE 'false' 
//         END AS admin_verified, 
//         student_id, 
//         user_status, 
//         DATE(created_at) AS created_date, 
//         DATE(updated_at) AS updated_date 
//       FROM users
//     `);
//     res.send(result.rows);
//     await connection.release();
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: 'Something went wrong!' });
//   }
// };

// exports.viewUsers = async (req, res) => {
//   try {
//     const connection = await pool.connect();
//     const result = await connection.query(`
//       SELECT 
//         id, 
//         first_name, 
//         middle_name, 
//         last_name, 
//         dob, 
//         phone, 
//         gender, 
//         email, 
//         organization, 
//         CASE 
//           WHEN email_verified THEN 'true' 
//           ELSE 'false' 
//         END AS email_verified, 
//         CASE 
//           WHEN mobile_verified THEN 'true' 
//           ELSE 'false' 
//         END AS mobile_verified, 
//         CASE 
//           WHEN admin_verified THEN 'true' 
//           ELSE 'false' 
//         END AS admin_verified, 
//         student_id, 
//         user_status, 
//         (created_at AT TIME ZONE 'IST')::date AS created_date, 
//         (updated_at AT TIME ZONE 'IST')::date AS updated_date
//       FROM users
//     `);

//     const formattedResult = result.rows.map((user) => {
//       user.created_date = new Date(user.created_date).toISOString();
//       user.updated_date = new Date(user.updated_date).toISOString();
//       return user;
//     });
    
    
//     // const formattedResult = result.rows.map((user) => {
//     //   user.created_date = new Date(user.created_date).toLocaleDateString('en-IN');
//     //   user.updated_date = new Date(user.updated_date).toLocaleDateString('en-IN');
//     //   return user;
//     // });

//     res.send(formattedResult);
//     await connection.release();
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: 'Something went wrong!' });
//   }
// };


exports.filter = async (req, res) => {
  try {
    const { email, organization, status, startDate, endDate } = req.query;
    const client = await pool.connect();
    const params = [];
    let query = 'SELECT * FROM users';

    if (email) {
      params.push(email);
      query += ' WHERE email = $1';
    }

    if (organization) {
      if (params.length === 0) {
        query += ' WHERE';
      } else {
        query += ' AND';
      }
      params.push(organization);
      query += ' organization = $' + (params.length);
    }

    if (status === 'true' || status === 'false') {
      if (params.length === 0) {
        query += ' WHERE';
      } else {
        query += ' AND';
      }
      params.push(status === 'true');
      query += ' admin_verified = $' + (params.length);
    }
    

    if (startDate && endDate) {
      if (params.length === 0) {
        query += ' WHERE';
      } else {
        query += ' AND';
      }
      params.push(startDate);
      query += ' created_at >= $' + (params.length);
      params.push(endDate);
      query += ' AND created_at <= $' + (params.length);
    } else if (startDate) {
      if (params.length === 0) {
        query += ' WHERE';
      } else {
        query += ' AND';
      }
      params.push(startDate);
      query += ' created_at >= $' + (params.length);
    } else if (endDate) {
      if (params.length === 0) {
        query += ' WHERE';
      } else {
        query += ' AND';
      }
      params.push(endDate);
      query += ' created_at <= $' + (params.length);
    }

    const result = await client.query(query, params);
    if (result.rowCount===0) {
      res.status(404).send({ message: 'No matching records found.' })
      return
    }
    res.send(result.rows);
    await client.release()
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Internal server error.' })
  }
};


