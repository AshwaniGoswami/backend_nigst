//API TO SEND SMS USING TWILIO

const pool = require("../config/pool");
const twilio = require('twilio');


const twilioAccountSid = 'AC85b3c233434413a9ab00497b49238ec3'
const twilioAuthToken = 'be2e75fe3787738eaf80864c83182ca7'
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);


exports.sendsms = async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const message = req.body.message;
  try {
    // Save the message to the database
    await pool.query('INSERT INTO sms_messages (phone_number, message_text) VALUES ($1, $2)', [phoneNumber, message]);
    // Send the message using Twilio API
    await twilioClient.messages.create({
      body: message,
      from: '+15747667875',
      to: phoneNumber
    });
    res.status(200).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending message.' });
  }
};


//resuable sms verify
const sendVerifySms = async (phoneNumber, message) => {
  try {
    // Save the message to the database
    await pool.query('INSERT INTO sms_messages (phone_number, message_text) VALUES ($1, $2)', [phoneNumber, message]);
    // Send the message using Twilio API
    await twilioClient.messages.create({
      body: message,
      from: '+15747667875',
      to: phoneNumber
    });
    console.log('Message sent successfully');
  } catch (error) {
    console.error(error);
    throw new Error('Error sending message');
  }
};

// exports.sendOTP = async (req, res) => {
//   const id = req.params.id; // ID of the message in the sms table
//   const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

//   try {
//     const result = await pool.query('SELECT phone_number FROM sms_messages WHERE id = $1', [id]);
//     const phoneNumber = result.rows[0].phone_number;

//     // Save the OTP to the database
//     await pool.query('INSERT INTO otps (phone_number, otp) VALUES ($1, $2)', [phoneNumber, otp]);

//     // Send the OTP using Twilio API
//     await twilioClient.messages.create({
//       body: `Your NIGST Phone Pumber registration OTP is ${otp}`,
//       from: '+15747667875',
//       to: phoneNumber
//     });

//     res.status(200).json({ message: 'OTP sent successfully.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error sending OTP.' });
//   }
// };

// exports.verifyOTP = async (req, res) => {
//   const phoneNumber = req.body.phoneNumber;
//   const otp = req.body.otp;

//   try {
//     // Check if the OTP is valid
//     const result = await pool.query('SELECT * FROM otps WHERE phone_number = $1 AND otp = $2', [phoneNumber, otp]);
//     if (result.rows.length === 0) {
//       return res.status(400).json({ message: 'Invalid OTP.' });
//     }

//     // Delete the OTP from the database
//     await pool.query('DELETE FROM otps WHERE phone_number = $1', [phoneNumber]);

//     res.status(200).json({ message: 'OTP verified successfully.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error verifying OTP.' });
//   }
// };

//API TO SEND OTP USING ID

// exports.sendOTP = async (req, res) => {
//   const id = req.params.id; // ID of the message in the sms table
//   const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

//   try {
//     const result = await pool.query('SELECT phone FROM users WHERE id = $1', [id]);
//     const phoneNumber = result.rows[0].phone_number;

//     // Save the OTP to the database
//     await pool.query('INSERT INTO otps (phone_number, otp, verified) VALUES ($1, $2, false)', [phoneNumber, otp]);

//     // Send the OTP using Twilio API
//     await twilioClient.messages.create({
//       body: `Your NIGST Phone Pumber registration OTP is ${otp}`,
//       from: '+15747667875',
//       to: phoneNumber
//     });

//     res.status(200).json({ message: 'OTP sent successfully.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error sending OTP.' });
//   }
// };

//API TO SEND OTP USING EMAIL

exports.sendOTP = async (req, res) => {
  const email = req.body.email; // Email address of the user
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

  try {
    // Get the phone number from the users table using the email address
    const result = await pool.query('SELECT phone FROM users WHERE email = $1', [email]);
    const phoneNumber = result.rows[0].phone;

    // Save the OTP to the database
    await pool.query('INSERT INTO otps (phone_number, otp, verified) VALUES ($1, $2, false)', [phoneNumber, otp]);

    // Send the OTP using Twilio API
    await twilioClient.messages.create({
      body: `Your NIGST Phone Pumber registration OTP is ${otp}`,
      from: '+15747667875',
      to: phoneNumber
    });

    res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending OTP.' });
  }
};

exports.resendOTP = async (req, res) => {
  const email = req.body.email; 
  
  try {
  const result = await pool.query('SELECT phone FROM users WHERE email = $1', [email]);
  const phoneNumber = result.rows[0].phone;
  
  javascript
  
  const existingOtpResult = await pool.query('SELECT id, otp FROM otps WHERE phone_number = $1 AND verified = false ORDER BY created_at DESC LIMIT 1', [phoneNumber]);
  if (existingOtpResult.rows.length > 0) {
    const existingOtpId = existingOtpResult.rows[0].id;
    const otp = Math.floor(100000 + Math.random() * 900000);
  
    await pool.query('UPDATE otps SET otp = $1 WHERE id = $2', [otp, existingOtpId]);
  
    await twilioClient.messages.create({
      body: `Your NIGST Phone Pumber registration OTP is ${otp}`,
      from: '+15747667875',
      to: phoneNumber
    });
  
    res.status(200).json({ message: 'OTP replaced and sent successfully.' });
  } else {
    const otp = Math.floor(100000 + Math.random() * 900000);
  
    await pool.query('INSERT INTO otps (phone_number, otp, verified) VALUES ($1, $2, false)', [phoneNumber, otp]);
  
    await twilioClient.messages.create({
      body: `Your NIGST Phone Pumber registration OTP is ${otp}`,
      from: '+15747667875',
      to: phoneNumber
    });
  
    res.status(200).json({ message: 'New OTP sent successfully.' });
  }
  
  } catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Error resending OTP.' });
  }
  };

//API TO VERIFY OTP

exports.verifyOTP = async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const otp = req.body.otp;

  try {
    // Check if the OTP is valid
    const result = await pool.query('SELECT * FROM otps WHERE phone_number = $1 AND otp = $2', [phoneNumber, otp]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // Update the OTP in the database
    await pool.query('UPDATE otps SET verified = true WHERE phone_number = $1', [phoneNumber]);
    await pool.query('UPDATE users SET mobile_verified = true WHERE phone = $1', [phoneNumber]);

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying OTP.' });
  }
};



//API USING TEXTLOCAL


// const pool = require("../config/pool");
// const http = require('http');
// const urlencode = require('urlencode');



// exports.sendsms = async (req, res) => {
//   const apiKey = '	MzY3MzZmNzU3YTM2NjQ2MjU4Nzc3ODc0MzI1NTVhNmI=';
//   const sender = 'INIGST';
//   const message = req.body.message;
//   const phoneNumber = req.body.phoneNumber;

//   const messageEncoded = urlencode(message);
//   const phoneNumberEncoded = urlencode(phoneNumber);
//   const url = `http://api.textlocal.in/send/?apikey=${apiKey}&sender=${sender}&message=${messageEncoded}&numbers=${phoneNumberEncoded}`;

//   try {
//     // Save the message to the database
//     await pool.query('INSERT INTO sms_messages (phone_number, message_text) VALUES ($1, $2)', [phoneNumber, message]);

//     // Send the message using Textlocal API
//     http.get(url, (response) => {
//       let rawData = '';
//       response.on('data', (chunk) => {
//         rawData += chunk;
//       });
//       response.on('end', () => {
//         console.log(rawData);
//         res.status(200).json({ message: 'Message sent successfully.' });
//       });
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error sending message.' });
//   }
// };

// const fastTwoSms = require('fast-two-sms');
// const apiKey = 'zG2stqb7Jl19vAo4aewNidyB6CF0UWmQxpfIh5PkR8YVgrKDMjPsbX0dgkMtnjeLNqJ81E4fQVSGCWAl';

// exports.sendsms = async (req, res) => {
//   try {
//     const { message, phoneNumber } = req.body;

//     const options = {
//       authorization: apiKey,
//       message: message,
//       numbers: [phoneNumber]
//     };

//     const response = await fastTwoSms.sendMessage(options);

//     res.json({ message: 'SMS sent successfully.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error sending SMS.' });
//   }
// };

// API USING FAST 2 SMS API TO SEND MESSAGES


// const pool = require("../config/pool");
// const Fast2SMS = require('fast-two-sms');

// exports.sendsms = async (req, res) => {
//   try {
//     const { phone, message } = req.body;
//     const response = await Fast2SMS.sendMessage({
//       authorization: 'zG2stqb7Jl19vAo4aewNidyB6CF0UWmQxpfIh5PkR8YVgrKDMjPsbX0dgkMtnjeLNqJ81E4fQVSGCWAl',
//       message: message,
//       numbers: ['8126666480']
//     });
//     // Save SMS details to database
//     const status = response.status || 'unknown';
//     const result = await pool.query('INSERT INTO sms(phone, message, status) VALUES($1, $2, $3) RETURNING *', [phone, message, status]);
//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred' });
//   }
// };

// exports.showsms = async (req, res) => {
//   try {
//     const result = await client.query('SELECT * FROM sms');
//     res.json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred' });
//   }
// };