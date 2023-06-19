const pool = require("../config/pool");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");


exports.createAlbum=async(req,res)=>{
    let connection
    
    try {
      const{Cname}=req.body
      const image=req.files.image
      const params=[]
      let Apath=''
      let Aname=''
      connection = await pool.connect() 

      for (let i = 0; i < image.length; i++) {
        Aname = image[i].originalname;
        Apath = image[i].location;
      


    const query = 'INSERT INTO album (category_name,name,path) VALUES ($1, $2, $3)'

    const values = [Cname,Aname,Apath]

    const result = await connection.query(query, values)
    params.push({name:Aname,path:Apath})
    }

    return res.status(201).send({ message: 'Images uploaded successfully' })

  } 
  catch (error) {

    console.error(error)

    return res.status(500).send({ error: 'Something went wrong' })

  } 
  finally {

    if (connection) {

    await  connection.release()

    }
  }
}
// =====================view==========================
exports.viewAlbum=async(req,res)=>{
  let connection
  try {
    const{Cname}=req.body;
    const AllAlbumView="SELECT name,path from album ";
    connection=await pool.connect()
    const allAlbum=await connection.query(AllAlbumView)
    if (allAlbum.rowCount === 0) {
      return res.status(404).send({ message: 'No image Found' });
    }
    const attachments = allAlbum.rows.map(row => row.path).filter(Boolean);
const imageData = [];

for (const attachment of attachments) {
  const fileUrl = attachment;
  const key = 'gallery/' + fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
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
    const url = await getSignedUrl(s3Client, command, { expiresIn: 36000 });

    imageData.push({ fileName: key, url});
  } catch (error) {
    console.error(`Error retrieving file '${key}': ${error}`);
  }
}
if (imageData.length === 0) {
  return res.status(404).send({ error: 'Image  not found.' });
}

    
    return res.send({data:imageData})
  } catch (error) {
    console.log(error)
    return res.status(500).send({message:'Internal server error!'})

  }

finally{
  if(connection)
  {
    await connection.release()
  }
}
}



