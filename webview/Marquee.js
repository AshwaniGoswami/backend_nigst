const pool = require("../config/pool")
const generateNumericValue = require("../generator/NumericId")


exports.CreateMarquee = async (req, res) => {
    let client;

    try {
        const { detail, url, color, textColor } = req.body;

        client = await pool.connect();

        const checkCount = 'SELECT COUNT()* FROM marquee'

        const countResult = await client.query(checkCount)

        if (countResult.rowCount > 10) {
            return res.status(400).send({ message: 'Cant Create More then 10 Marquee' })
        }

        let mid = 'M-' + generateNumericValue(8);

        const check = 'SELECT * FROM marquee WHERE marquee_id = $1';

        let result = await client.query(check, [mid]);

        while (result.rowCount > 0) {
            mid = 'M-' + generateNumericValue(8);
            result = await client.query(check, [mid]);
        }

        const insertQuery =
            'INSERT INTO marquee (info, url, color, text_color, marquee_id, date_creation) VALUES ($1, $2, $3, $4, $5, $6)';

        const date = new Date();
        const data = [detail, url, color, textColor, mid, date];

        await client.query(insertQuery, data);

        return res.status(201).send({ message: 'Marquee Created Successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Internal Server Error!' });
    } finally {
        if (client) {
            await client.release();
        }
    }
};


exports.viewMarqueeToAdmin = async (req, res) => {
    let connection

    try {

        connection = await pool.connect()

        const check = 'SELECT * FROM marquee ORDER BY date_creation DESC'

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