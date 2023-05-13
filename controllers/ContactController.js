const pool = require("../config/pool");
const sendMail = require("../mailing_Service/mailconfig");


exports.postContact = async (req, res) => {
  let client;
  try {
    const { name, email, phone, subject, description } = req.body;
    client = await pool.connect();
    await client.query('BEGIN');

    const queryText = `INSERT INTO contact_form(name, email, phone, subject, description) VALUES ($1, $2, $3, $4, $5)`;
    const queryParams = [name, email, phone, subject, description];
    await client.query(queryText, queryParams);

    let admin = '';
    switch (subject) {
      case 'Admission Enquiry':
        admin = process.env.office_1;
        break;
      case 'Feedback':
        admin = process.env.office_2;
        break;
      case 'Grievances':
        admin = process.env.office_3;
        break;
      case 'Right to Information':
        admin = process.env.office_4;
        break;
      default:
        throw new Error('Invalid subject');
    }

    sendMail(
      admin,
      `${subject} Query`,
      `${name} wants to contact with you on the topic: ${subject}. Their email is: ${email}. Please clear their query.`
    );

    await client.query('COMMIT');
  return  res.json({ message: 'Successfully sent feedback' });
  } catch (error) {
    await client.query('ROLLBACK');
  return  res.json(error);
  } finally {
    if (client) {
      await client.release();
    }
  }
};
exports.viewContact = async(req,res)=>{
  try{
    const connection = await pool.connect();
    const query = "SELECT * FROM contact_form";
    const result = await connection.query(query);
   return res.send( { details: result.rows });
    await connection.release();
  }catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Something went wrong!' });
  }
}