const pool = require("../config/pool");
const fs = require('fs');
const generateNumericValue = require("../generator/NumericId");


// exports.tenderCreation = async (req, res) => {
//   const { title, description, startDate, endDate, tenderRefNo } = req.body;
//   const file = req.files.pdf;
// console.log(file)
//   try {
//     const client = await pool.connect();

//     const checkTenderResult = await client.query('SELECT * FROM tender WHERE tender_ref_no = $1', [tenderRefNo]);
//     const checkarchive = await client.query('SELECT * FROM archive_tender WHERE tender_ref_no=$1', [tenderRefNo])
//     if (checkTenderResult.rows.length > 0 || checkarchive.rowCount > 0) {
//       return res.status(400).send({ message: 'Tender reference number already exists.' });
//     }

//     const query = 'INSERT INTO tender (title, description, start_date, end_date, attachment, tender_ref_no) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
//     const values = [title, description, startDate, endDate, file[0].path, tenderRefNo];
//     const result = await client.query(query, values);

//     res.status(201).send({ message: 'Tender created successfully' });

//     await client.release();
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: 'Something went wrong' });
//   }
// }

///s3 code
exports.tenderCreation = async (req, res) => {
  const { title, description, startDate, endDate, tenderRefNo } = req.body;
  const file = req.files.pdf;
console.log(file)
  try {
    const client = await pool.connect();

    const checkTenderResult = await client.query('SELECT * FROM tender WHERE tender_ref_no = $1', [tenderRefNo]);
    const checkarchive = await client.query('SELECT * FROM archive_tender WHERE tender_ref_no=$1', [tenderRefNo])
    if (checkTenderResult.rows.length > 0 || checkarchive.rowCount > 0) {
      return res.status(400).send({ message: 'Tender reference number already exists.' });
    }

    const query = 'INSERT INTO tender (title, description, start_date, end_date, attachment, tender_ref_no) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const values = [title, description, startDate, endDate, file[0].location, tenderRefNo];
    const result = await client.query(query, values);

   return res.status(201).send({ message: 'Tender created successfully' });

    await client.release();
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Something went wrong' });
  }
}

exports.addCorrigendum = async (req, res) => {
  try {
    const { corrigendum, tender_number } = req.body;
    const file = req.files.pdf;
    const client = await pool.connect();

    const tenderResult = await client.query('SELECT * FROM tender WHERE tender_ref_no = $1', [tender_number]);
    if (tenderResult.rowCount === 0) {
      await client.release();
      return res.status(400).send({ message: 'Tender not found' });
    }
    const check = 'SELECT * FROM corrigendum_tender WHERE corri_id=$1'
    let corrigendumID = 'TENDER-' + generateNumericValue(6)
    const result = await client.query(check, [corrigendumID])
    while (result.rows.length !== 0) {
      corrigendumID = 'TENDER-' + generateNumericValue(6);
      result = await client.query(check, [corrigendumID]);
    }
    const feed = 'INSERT INTO corrigendum_tender(corrigendum,tender_ref_no,corri_id' + (file ? ', attachment' : '') + ') VALUES ($1,$2,$3' + (file ? ',$4' : '') + ')'
    const data = [corrigendum, tender_number, corrigendumID];
    if (file) data.push(file[0].path);

    await client.query(feed, data);
 return    res.status(201).send({ message: 'Corrigendum successfully created' });

    await client.release();
  } catch (error) {
    console.error(error);
   return res.status(500).send({ message: 'Internal Server Error.' });
  }
}


exports.viewCorriPdf = async (req, res) => {
  const { corrigendumID } = req.params;

  try {
    const client = await pool.connect();
    const query = 'SELECT attachment FROM corrigendum_tender WHERE corri_id = $1';
    const result = await client.query(query, [corrigendumID]);

    if (result.rowCount === 0) {
      await client.release();
      return res.status(404).send({ error: `PDF not found.` });
    }

    const filePath = result.rows[0].attachment;

    if (!fs.existsSync(filePath)) {
      await client.release();
      return res.status(404).send({ error: `Attachment file does not exist.` });
    }

    const fileStream = fs.createReadStream(filePath);
    const stat = fs.statSync(filePath);

  return  res.setHeader('Content-Type', 'application/pdf');
  return  res.setHeader('Content-Length', stat.size);
   return res.setHeader('Content-Disposition', `attachment; filename=${filePath}`);

    fileStream.pipe(res);

    await client.release();
  } catch (error) {
    console.error(error);
   return res.status(500).send({ error: 'Something went wrong.' });
  }
};



exports.archiveTender = async (req, res) => {
  const { tender_number } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const checkTenderQuery = `
      SELECT *
      FROM tender
      WHERE tender_ref_no = $1
    `;
    const checkTenderResult = await client.query(checkTenderQuery, [tender_number]);
    if (checkTenderResult.rowCount === 0) {
      await client.query('ROLLBACK');
      await client.release();
      return res.status(400).json({ message: "Tender does not exist." });
    }

    const archiveQuery = `
      INSERT INTO archive_tender (title, description, start_date, end_date, attachment, tender_ref_no)
      SELECT title, description, start_date, end_date, attachment, tender_ref_no
      FROM tender
      WHERE tender_ref_no = $1
    `;
    await client.query(archiveQuery, [tender_number]);

    const archiveCorrigendumQuery = `
      INSERT INTO archive_corrigendum (corrigendum, attachment, tender_ref_no, corri_id, created_at)
      SELECT corrigendum, attachment, tender_ref_no, corri_id, created_at
      FROM corrigendum_tender
      WHERE tender_ref_no = $1
    `;
    await client.query(archiveCorrigendumQuery, [tender_number]);

    const deleteCorrigendumQuery = `
      DELETE FROM corrigendum_tender
      WHERE tender_ref_no = $1
    `;
    await client.query(deleteCorrigendumQuery, [tender_number]);

    const deleteQuery = `
      DELETE FROM tender
      WHERE tender_ref_no = $1
    `;
    await client.query(deleteQuery, [tender_number]);

    await client.query('COMMIT');
    await client.release();

    return res.status(200).json({
      message: "Tender archived successfully",
    });
  } catch (error) {
    console.error(error);
    await client.query('ROLLBACK');
    await client.release();
    return res.status(500).json({
      error: "Something went wrong. Please try again later.",
    });
  }
};



exports.retrieveTender = async (req, res) => { 
  let client
  try {
     client = await pool.connect();
    await client.query('BEGIN');
    const { id } = req.body;
    const retrieve = `
        INSERT INTO tender(title, description, start_date, end_date, attachment,attachment1, tender_ref_no,corrigendum) 
        SELECT title, description, start_date, end_date, attachment, attachment1, tender_ref_no,corrigendum 
        FROM archive_tender WHERE id=$1;
      `;
    await client.query(retrieve, [id]);
    const deleteData = "DELETE FROM archive_tender WHERE id=$1";
    await client.query(deleteData, [id]);
    await client.query('COMMIT');
  return  res.send({ message: "Successfully restored" });
    await client.release();
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
   return res.send({ message: "Something went wrong!" });
  } finally {
   await client.release();
  }
};


exports.viewTender = async (req, res) => {
  try {
    const client = await pool.connect();
    const query = `
      SELECT 
      tender.id, 
      tender.title, 
      tender.description, 
      to_char(tender.start_date, 'MM/DD/YYYY') AS start_date, 
      to_char(tender.end_date, 'MM/DD/YYYY') AS end_date,
      tender.tender_ref_no, 
      array_agg(
        json_build_object(
          'corrigendumID', corrigendum_tender.corri_id,
          'corrigendum', corrigendum_tender.corrigendum,
          'pdf', corrigendum_tender.attachment,
          'created_at', to_char(corrigendum_tender.created_at, 'MM/DD/YYYY')
        )
      ) AS corrigenda
    FROM tender
    LEFT JOIN corrigendum_tender ON tender.tender_ref_no = corrigendum_tender.tender_ref_no
    GROUP BY tender.id
    
      `;
    const result = await client.query(query);
    if (result.rowCount === 0) {
     return res.status(404).send({ messgage: 'Nothing to show.' })
    }
   return res.status(200).send({ tender: result.rows });
    await client.release();
  } catch (error) {
    console.log(error);
   return res.status(500).send({ error: "Something went wrong." });
  }
};





exports.corrigendumTender = async (req, res) => {
  try {
    const client = await pool.connect();
    const { tender_ref_no, corrigendum } = req.body;
    const file = req.files.pdf
    console.log(file)
    const query = `SELECT title, description, start_date, end_date, attachment FROM tender WHERE tender_ref_no=$1`
    const result = await client.query(query, [tender_ref_no]);
    if (result.rows.length === 0) { res.send({ message: "Nothing To Show" }) }

    const insert = `INSERT INTO tender(attachment1, corrigendum) VALUES($1,$2)`
    const data = [file[0].path, corrigendum]
   return res.status(201).send(
      { message: "Successfully Corrigendum created" }
    )
    await client.release();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Something went wrong." });
  }
}

exports.getTenderNo = async (req, res) => {
  try {
    const client = await pool.connect();
    const query = `SELECT tender_ref_no FROM tender`
    const result = await client.query(query);
    if (result.rows.length === 0) { res.send({ message: "Nothing To Show" }) }
  return  res.status(200).send({ tender: result.rows });
    await client.release();


  } catch (error) {
    console.log(error);
  return  res.status(500).send({ error: "Something went wrong." });
  }
}

exports.viewArchiveTender=async (req,res)=>{
  try {
    const check=`SELECT archive_tender.id, archive_tender.title,archive_tender.description, to_char(archive_tender.start_date,'MM/DD/YYYY') as startDate, to_char(archive_tender.end_date,'MM/DD/YYYY') as endDate, archive_tender.tender_ref_no, array_agg(
        json_build_object(
          'corrigendumID', archive_corrigendum.corri_id,
          'corrigendum', archive_corrigendum.corrigendum,
          'pdf', archive_corrigendum.attachment,
          'created_at', to_char(archive_corrigendum.created_at, 'MM/DD/YYYY')
        )
      ) AS corrigendum
    FROM archive_tender
    LEFT JOIN archive_corrigendum ON archive_tender.tender_ref_no = archive_corrigendum.tender_ref_no
    GROUP BY archive_tender.id`
    const client=await pool.connect()
    const result=await client.query(check)
if (result.rowCount===0) {
 return res.status(200).send({message:'Nothing to show!.'})
}
else{
  return res.status(200).send({data:result.rows})
}
await client.release()
  } catch (error) {
    console.error(error)
   return res.status(500).send({message:'Internal Server Error!.'})
  }
}

// exports.viewPdf = async (req, res) => {
//   try {
//     const { id } = req.params; // Get the tender ID from the request URL

//     // Query the database for the attachment path
//     const result = await pool.query(`SELECT attachment FROM tender WHERE id = $1`, [id]);
//     if (result.rows.length === 0) {
//       return res.status(404).send({
//         message: `Tender with ID ${id} not found`
//       });
//     }

//     // Construct the file path to the attachment
//     const attachmentPath = path.join(__dirname, '..', result.rows[0].attachment);

//     // Check if the attachment file exists
//     if (!fs.existsSync(attachmentPath)) {
//       return res.status(404).send({
//         message: `Attachment not found for tender with ID ${id}`
//       });
//     }

//     // Stream the attachment file to the response
//     const attachmentStream = fs.createReadStream(attachmentPath);
//     attachmentStream.pipe(res);
//   } catch (error) {
//     console.error('Error fetching attachment:', error);
//     res.status(500).send({ error: "Something went wrong." });
//   }
// };

//


// exports.viewPdf = async (req, res) => {
//   const { tender_number } = req.params;

//   try {
//     const client = await pool.connect();
//     const query = 'SELECT attachment FROM tender WHERE tender_ref_no = $1';
//     const result = await client.query(query, [tender_number]);

//     if (result.rowCount === 0) {
//       return res.status(404).send({ error: `Tender not found.` });
//     }

//     const filePath = result.rows[0].attachment;
//     const fileStream = fs.createReadStream(filePath);
//     const stat = fs.statSync(filePath);

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Length', stat.size);
//     res.setHeader('Content-Disposition', `attachment; filename=${filePath}`);

//     fileStream.pipe(res);

//     client.release();
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: 'Something went wrong.' });
//   }
// };
exports.viewPdf = async (req, res) => {
  const { tender_number } = req.params;

  try {
    const client = await pool.connect();
    const query = 'SELECT attachment FROM tender WHERE tender_ref_no = $1';
    const result = await client.query(query, [tender_number]);

    if (result.rowCount === 0) {
      return res.status(404).send({ error: `Tender not found.` });
    }

    const fileUrl = result.rows[0].attachment;
    const fileStream = request.get(fileUrl);

   return res.setHeader('Content-Type', 'application/pdf');
   return res.setHeader('Content-Disposition', `inline; filename=tender.pdf`);

    fileStream.pipe(res);

  await  client.release();
  } catch (error) {
    console.error(error);
  return  res.status(500).send({ error: 'Something went wrong.' });
  }
};



// exports.downloadPdf = async (req, res) => {
//   try {
//     const client = await pool.connect();
//     const id = req.params.id;
//     const result = await client.query(`SELECT attachment FROM tender WHERE id = $1`, [id]);
//     if (result.rows.length === 0) {
//       return res.status(404).send({ error: `Tender with id ${id} not found.` });
//     }
//     const filePath = result.rows[0].attachment;
//     const stat = await fs.statSync(filePath);
//     res.writeHead(200, {
//       'Content-Type': 'application/pdf',
//       'Content-Length': stat.size,
//       'Content-Disposition': `attachment; filename=${id}.pdf`,
//     });
//     const fileStream = await fs.createReadStream(filePath);
//     fileStream.pipe(res);
//     await client.release();
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ error: "Something went wrong." });
//   }
// };


exports.downloadPdf = async (req, res) => {
  try {
    const client = await pool.connect();
    const id = req.params.id;
    const result = await client.query(`SELECT attachment FROM tender WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send({ error: `Tender with id ${id} not found.` });
    }
    const filePath = result.rows[0].attachment;
    const stat = await fs.statSync(filePath);
   return res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename=${id}.pdf`,
    });
    const fileStream = await fs.createReadStream(filePath);
    fileStream.pipe(res);
    await client.release();
  } catch (error) {
    console.log(error);
   return res.status(500).send({ error: "Something went wrong." });
  }
};

