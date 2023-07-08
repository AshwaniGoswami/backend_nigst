const pool = require("../config/pool")
const generateNumericValue = require("../generator/NumericId")


exports.CreateMarquee = async (req, res) => {

    let client

    try {

        const { detail, url, color, textColor } = req.body

        client = await pool.connect()

        const checkCount = 'SELECT COUNT(*) FROM marquee'

        const countResult = await client.query(checkCount)

        if (countResult.rows[0].count > 10) {

            return res.status(400).send({ message: 'Cannot create more than 10 Marquees.' })

        }

        let mid = 'M-' + generateNumericValue(8)

        const check = 'SELECT * FROM marquee WHERE marquee_id = $1'

        let result = await client.query(check, [mid])

        while (result.rowCount > 0) {

            mid = 'M-' + generateNumericValue(8)

            result = await client.query(check, [mid])

        }

        const insertQuery =
            'INSERT INTO marquee (info, url, color, text_color, marquee_id, date_creation) VALUES ($1, $2, $3, $4, $5, $6)'

        const date = new Date()

        const data = [detail, url, color, textColor, mid, date]

        await client.query(insertQuery, data)

        return res.status(201).send({ message: 'Marquee created successfully.' })

        console.error(error)

        return res.status(500).send({ message: 'Internal Server Error!' })

    }
    finally {

        if (client) {

            await client.release()

        }
    }
}


exports.viewMarqueeToAdmin = async (req, res) => {

    let connection

    try {

        connection = await pool.connect()

        const check = ` SELECT marquee_id as marqueeid,marquee_status as status,info as text, url, color as backgroundcolor,text_color  as textcolor, web_visiblity as text_visiblity,to_char(date_creation,'YY/MM/DD') as creationdate FROM marquee ORDER BY date_creation DESC`

        const result = await connection.query(check)

        if (result.rowCount === 0) {
            return res.status(404).send({ message: 'No Data To Display!.' })
        }

        return res.status(200).send({ data: result.rows })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Internal Server Error!.' })
    }
    finally {
        if (connection) {
            await connection.release()
        }
    }
}

exports.editMarqueeDetails = async (req, res) => {
    let client;

    try {
        const { mid, detail, url, color, textColor } = req.body;

        client = await pool.connect();

        const check = 'SELECT * FROM marquee WHERE marquee_id';

        const result = await client.query(check, [mid]);

        if (result.rowCount === 0) {
            return res.status(404).send({ message: 'Record Not Exists' });
        }

        const updateQuery =
            'UPDATE marquee SET info=$1,url=$2,color=$3,text_color=$4 WHERE marquee_id=$5';

        const data = [detail, url, color, textColor, mid];

        await client.query(updateQuery, data);

        return res.status(200).send({ message: 'Marquee Updated Successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).status({ message: 'Internal Server Error!.' });
    } finally {
        if (client) {
            await client.release();
        }
    }
};

exports.editMarqueeVisibility = async (req, res) => {
    let connection;
    try {
      const { mid, visibility } = req.body;
      connection = await pool.connect();
  
      await connection.query('BEGIN'); 
  
      const checkQuery = 'SELECT * FROM marquee WHERE marquee_id = $1';
      const result = await connection.query(checkQuery, [mid]);
  
      if (result.rowCount === 0) {
        await connection.query('ROLLBACK'); 
        return res.status(500).send({ message: 'Record Does Not Exist' });
      }
  
      const resetQuery = 'UPDATE marquee SET web_visibility = false';
      await connection.query(resetQuery);
  
      const updateQuery = 'UPDATE marquee SET marquee_status = $1, web_visibility = $2 WHERE marquee_id = $3';
      const data = [true, visibility, mid];
  
      if (visibility === true) {
        await connection.query(updateQuery, data);
      } else {
        const data2 = [false, visibility, mid];
        await connection.query(updateQuery, data2);
      }
  
      await connection.query('COMMIT'); 
  
      return res.status(200).send({ message: 'Updated Successfully' });
    } catch (error) {
      console.error(error);
      await connection.query('ROLLBACK'); // Rollback transaction if an error occurs
      return res.status(500).send({ message: 'Internal Server Error' });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  };
  