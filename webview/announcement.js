const pool = require("../config/pool");

exports.viewWebAnnouncement = async (req, res) => {
    try {
        const client = await pool.connect()
        const check = 'SELECT * FROM announcement WHERE visible=$1 ORDER BY DESC'
        const visible = true
        const result = await client.query(check, [visible])
        if (result.rowCount === 0) {
            res.send({
                message: "nothing to show"
            })
            await client.release()

        }
        else{
            res.send({
                announcement: result.rows
            })
            await client.release()
        }
      
    } catch (error) {
        res.send({ message: 'Something went wrong!.' })
    }
}