// const pool = require("../config/pool");
// const { v1: uuidv4 } = require('uuid')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcrypt');
// const generateNumericValue = require("../generator/NumericId");




// exports.createCorporateUsers = async (req, res) => {

//     try {

//         const { first_name, middle_name, last_name, dob, gender, email, phone, password, verification, type,company } = req.body
//         const connection = await pool.connect()
//         const query1 = 'SELECT * FROM users WHERE email=$1'
//         const result = await connection.query(query1, [email])
//         if (result.rows.length > 0) {
//             res.send({ message: 'User already exists.' })
//             await connection.release()
//         }
//         else {

//             let regNum = uuidv4();
//     const checkRegNumQuery = 'SELECT * FROM users JOIN password ON users.reg_device_v1 = password.reg_device_v1 WHERE users.reg_device_v1 = $1';
//     let regRes = await connection.query(checkRegNumQuery, [regNum]);
//     while (regRes.rowCount > 0) {
//       regNum = uuidv4();
//       regRes = await client.query(checkRegNumQuery, [regNum]);
//     }
// if (type==='Departmental') {
//  var  corporateId='D-'+generateNumericValue(8) 
// }
// else if(type==='ExtraDepartmental'){
//    var corporateId='ED-'+ generateNumericValue(8)
// }
// else if (type==='Private') {
//    var corporateId='P-'+generateNumericValue(8)
// }
//                 const idCheck = 'SELECT * FROM users WHERE student_id=$1'
//                 let idRes = await connection.query(idCheck, [corporateId])
//                 while (idRes.rows.length !== 0) {
//                     if (type === 'Departmental') {
//                         corporateId = 'D-' + generateNumericValue(8)
//                       } else if(type==='ExtraDepartmental') {
//                         corporateId = 'ED-' + generateNumericValue(8)
//                       }
//                       else if (type==='Private') {
//                         corporateId='P-'+generateNumericValue(8)
//                       }
//                     idRes = await connection.query(idCheck, [corporateId]);
//                 }
//                 const salt = await bcrypt.genSalt(16)
//                 const hash = await bcrypt.hash(password, salt)
//                 const data = [first_name, middle_name, last_name, dob, gender, email, phone, regNum, verification, type,company]
//                 const query2 = 'INSERT INTO users(first_name,middle_name,last_name,dob,gender,email,phone,reg_device_v1,is_verified,role,company,student_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)'
//                 const saveRes = await connection.query(query2, [...data, corporateId])

//                 const data2 = [email, regNum, hash]
//                 const finalQ = 'INSERT INTO password(email,reg_device_v1,password) VALUES($1,$2,$3)'
//                 await connection.query(finalQ, [...data2])
//                 res.send({ message: 'User Successfully Created.' })
//                 await connection.release()
            

//         }

//     } catch (error) {
//         console.error(error)
//         res.send({ message: 'Something went wrong.' })
//     }
// }

