const pool = require("../config/pool");

exports.viewWebAnnouncement = async (req, res) => {
    let client
    try {
         client = await pool.connect()
        const check = `SELECT title,description,to_char(posted_at,'YYYY/MM/DD') as posteddate  FROM announcement   WHERE status=$1  ORDER BY posted_at DESC LIMIT 6`
        const visible = true
        const result = await client.query(check, [visible])
        if (result.rowCount === 0) {
           return res.send({
                message: "nothing to show"
            })
            await client.release()

        }
        else{
           return res.send({
                announcement: result.rows
            })
          
        }
        
    } catch (error) {
        console.error(error)
       return res.send({ message: 'Internal Server Error!.' })
    }
    finally{
        if (client) {
            await client.release()
        }
    }
}



exports.viewAllWebAnnouncement = async (req, res) => {
    let client
    try {
         client = await pool.connect()
        const check = `SELECT title,description,to_char(posted_at,'YYYY/MM/DD') as posteddate,url,pdf_path,a_id  FROM announcement   WHERE status=$1  ORDER BY posted_at DESC `
        const visible = true
        const result = await client.query(check, [visible])
        if (result.rowCount === 0) {
           return res.send({
                message: "nothing to show"
            })
            await client.release()

        }
        else{
           return res.send({
                announcement: result.rows
            })
          
        }
        
    } catch (error) {
        console.error(error)
       return res.send({ message: 'Internal Server Error!.' })
    }
    finally{
        if (client) {
            await client.release()
        }
    }
}