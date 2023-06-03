const pool = require("../config/pool");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

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

exports.viewPDFAnnouncement = async (req, res) => {
    let client;
  
    try {
      const { aid } = req.params;
      client = await pool.connect();
      const check = 'SELECT pdf_path FROM announcement WHERE a_id = $1';
      const result = await client.query(check, [aid]);
  
      if (result.rowCount === 0) {
        return res.status(404).send({ message: 'Announcement Not Exists' });
      }
  
      const fileUrl = result.rows[0].pdf_path;
  
      if (!fileUrl) {
        return res.status(404).send({ error: 'PDF file not found.' });
      }
  
      const key = 'announcement/' + fileUrl.substring(fileUrl.lastIndexOf('/') + 1); 
  
      const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
      });
  
      const response = await s3Client.send(getObjectCommand);
  
      if (!response.Body) {
        return res.status(404).send({ error: 'PDF file not found.' });
      }
  
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=tender.pdf');
  
      response.Body.pipe(res);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error!.' });
    } finally {
      if (client) {
        await client.release();
      }
    }
  };
  