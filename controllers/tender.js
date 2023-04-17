const pool = require("../config/pool");
const fs = require('fs');

// exports.tenderCreation = async(req,res)=>{
//     try{
//         const client = await pool.connect();
//         const {title, description, startDate, endDate, tenderRefNo}=req.body;
//         const file=req.files.pdf

        
        
//         const result = await pool.query(
//             `INSERT INTO tender (title, description, start_date, end_date, attachment, tender_ref_no) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
//             [title, description, startDate, endDate, file[0].path, tenderRefNo]
//           );
//           res.send({
//             message: "Successfully Tender created"
//           });
//           await client.release();

//     }catch (error) {
//     // console.log(error);
//     res.status(500).send({ error: "Something went wrong." });
//   }
// }

exports.tenderCreation = async(req,res)=>{
  try{
      const client = await pool.connect();
      const {title, description, startDate, endDate, tenderRefNo}=req.body;
      const file=req.files.pdf

      // Check if tender reference number already exists in the database
      const checkTenderResult = await pool.query(`SELECT id FROM tender WHERE tender_ref_no = $1`, [tenderRefNo]);
      if (checkTenderResult.rows.length > 0) {
        return res.status(400).send({
          message: `Duplicate tender reference number found`
        });
      }
        
      const result = await pool.query(
          `INSERT INTO tender (title, description, start_date, end_date, attachment, tender_ref_no) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [title, description, startDate, endDate, file[0].path, tenderRefNo]
        );
        res.send({
          message: "Successfully Tender created"
        });
        await client.release();

  }catch (error) {
    // console.log(error);
    res.status(500).send({ error: "Something went wrong." });
  }
}


exports.archiveTender = async(req,res)=>{
    try{
        const client = await pool.connect();
        const {id}=req.body;
        const insert ="INSERT INTO archive_tender (title, description, start_date, end_date, attachment, attachment1, tender_ref_no,corrigendum) SELECT title, description, start_date, end_date, attachment, attachment1, tender_ref_no,corrigendum FROM tender WHERE id=$1"
        const result = await client.query(insert,[id])
        const deleteq = "DELETE FROM tender WHERE id=$1"
        await client.query(deleteq,[id])
          res.send({
            message: "Successfully Archive Tender"
          });
          await client.release();

    }catch (error) {
    console.log(error);
    res.status(500).send({ error: "Something went wrong." });
  }
}
exports.retrieveTender = async (req, res) => {
    const client = await pool.connect();
    try {
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
      res.send({ message: "Successfully restored" });
      await client.release();
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(error);
      res.send({ message: "Something went wrong!" });
    } finally {
      client.release();
    }
  };

// exports.viewTender =async(req,res)=>{
//     try{
//         const client= await pool.connect();
//         const query= "SELECT * FROM tender";
//         const result = await client.query(query);
//         res.send( { tender: result.rows });
//     await client.release();

//   }catch (error) {
//     console.log(error);
//     res.status(500).send({ error: "Something went wrong." });
//   }
//   }

exports.viewTender = async (req, res) => {
  try {
    const client = await pool.connect();
    const query = "SELECT id, title, description, DATE(start_date) AS start_date, DATE(end_date) AS end_date, attachment, attachment1, tender_ref_no, corrigendum FROM tender";
    const result = await client.query(query);
    const formattedTenders = result.rows.map((tender) => {
      const tenderStartDate = new Date(tender.start_date);
      tender.start_date = tenderStartDate.toLocaleDateString();
      const tenderEndDate = new Date(tender.end_date);
      tender.end_date = tenderEndDate.toLocaleDateString();
      return tender;
    });
    res.send({ tender: formattedTenders });
    await client.release();
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Something went wrong." });
  }
};

exports.corrigendumTender = async(req,res)=>{
  try{
    const client = await pool.connect();
    const {tender_ref_no, corrigendum}= req.body;
    const file = req.files.pdf
    console.log(file)
    const query =`SELECT title, description, start_date, end_date, attachment FROM tender WHERE tender_ref_no=$1`
    const result = await client.query(query, [tender_ref_no]);
    if (result.rows.length===0){res.send({message:"Nothing To Show"})}

    const insert = `INSERT INTO tender(attachment1, corrigendum) VALUES($1,$2)`
    const data = [file[0].path, corrigendum]
    res.send(
      {message:"Successfully Corrigendum created"}
    )
    await client.release();
  }catch (error) {
    console.log(error);
    res.status(500).send({ error: "Something went wrong." });
  }
}

exports.getTenderNo = async(req,res)=>{
  try{
    const client = await pool.connect();
    const query= `SELECT tender_ref_no FROM tender`
    const result = await client.query(query);
    if(result.rows.length===0){res.send({message:"Nothing To Show"})}
    res.send( { tender: result.rows });
    await client.release();


  }catch (error) {
    console.log(error);
    res.status(500).send({ error: "Something went wrong." });
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

exports.viewPdf = async (req, res) => 
  {
    try {
      const client = await pool.connect();
      const id = req.params.id;
      const result = await client.query(`SELECT attachment FROM tender WHERE id = $1`, [id]);
      if (result.rows.length === 0) {
        return res.status(404).send({ error: `Tender with id ${id} not found.` });
      }
      const filePath = result.rows[0].attachment;
      const stat = await fs.statSync(filePath);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Length': stat.size,
      });
      const fileStream = await fs.createReadStream(filePath);
      fileStream.pipe(res);
      await client.release();
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Something went wrong." });
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
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Length': stat.size,
        'Content-Disposition': `attachment; filename=${id}.pdf`,
      });
      const fileStream = await fs.createReadStream(filePath);
      fileStream.pipe(res);
      await client.release();
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Something went wrong." });
    }
  };
  
  