const pool = require("../config/pool");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
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
    else {
      return res.send({
        announcement: result.rows
      })

    }

  } catch (error) {
    console.error(error)
    return res.send({ message: 'Internal Server Error!.' })
  }
  finally {
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
    else {
      return res.send({
        announcement: result.rows
      })

    }

  } catch (error) {
    console.error(error)
    return res.send({ message: 'Internal Server Error!.' })
  }
  finally {
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


//testing
// exports.viewAllPDFs = async (req, res) => {
//   let client;

//   try {
//     client = await pool.connect();
//     const query = 'SELECT pdf_path FROM announcement';
//     const result = await client.query(query);

//     if (result.rowCount === 0) {
//       return res.status(404).send({ message: 'No PDFs Found' });
//     }

//     const files = result.rows.map(row => row.pdf_path);
//     const keys = files.map(fileUrl => {
//       if (fileUrl) {
//         return 'announcement/' + fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
//       }
//       return null;
//     });

//     const objects = await Promise.all(
//       keys.map(key => {
//         if (key) {
//           return s3Client.send(new GetObjectCommand({
//             Bucket: process.env.BUCKET_NAME,
//             Key: key,
//           }));
//         }
//         return null;
//       })
//     );

//     const validObjects = objects.filter(response => response && response.Body);

//     if (validObjects.length === 0) {
//       return res.status(404).send({ error: 'PDF files not found.' });
//     }

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'inline; filename=tender.pdf');

//     validObjects.forEach((response, index) => {
//       const fileStream = response.Body;
//       const fileName = files[index];

//       res.attachment(fileName);
//       fileStream.pipe(res);
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({ message: 'Internal Server Error!' });
//   } finally {
//     if (client) {
//       await client.release();
//     }
//   }
// };

//base+64


exports.viewAllPDFs = async (req, res) => {
  let client;

  try {
    client = await pool.connect();
    const query = 'SELECT pdf_path FROM announcement';
    const result = await client.query(query);

    if (result.rowCount === 0) {
      return res.status(404).send({ message: 'No PDFs Found' });
    }

    const attachments = result.rows.map(row => row.pdf_path).filter(Boolean);
    const pdfData = [];

    for (const attachment of attachments) {
      const fileUrl = attachment;
      const key = 'announcement/' + fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

      try {
     
        const s3Client = new S3Client({
          region: process.env.BUCKET_REGION,
          credentials: {
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
          },
        });

        const command = new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: key,
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        pdfData.push({ fileName: key, url });
      } catch (error) {
        console.error(`Error retrieving file '${key}': ${error}`);
      }
    }

    if (pdfData.length === 0) {
      return res.status(404).send({ error: 'PDF files not found.' });
    }

    res.json({ pdfs: pdfData });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal Server Error!' });
  } finally {
    if (client) {
      await client.release();
    }
  }
};