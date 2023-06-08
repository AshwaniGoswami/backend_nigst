const pool = require("../config/pool");
const generateNumericValue = require("../generator/NumericId");
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');


exports.createBanner=async(req,res)=>{

    let connection

    try {

        const {alt,url,section}=req.body 

        const file=req.files.image

        const name=file[0].originalname

        const path=file[0].location

        connection=await pool.connect()


    let BID='B-'+generateNumericValue(5)

    const check01='SELECT * FROM banner WHERE banner_id=$1'

    let result=await connection.query(check01,[BID])
    
    while (result.rowCount>0) {

        BID='B-'+generateNumericValue(5)

        result=await connection.query(check01,[BID])

    }
        const check=`INSERT INTO banner (name,alt,banner_path,url,section,banner_id) VALUES($1,$2,$3,$4,$5,$6)`

        const data=[name,alt,path,url,section,BID]
      
        await connection.query(check,data)

return res.send({message:'This is still in testing!.'})

    } 
    catch (error) {

        console.error(error)

        return res.status(500).send({message:'Internal Server Error!.'})

    }
    finally{

        if (connection) {

            await connection.release()
            
        }
    }
}


exports.editBanner=async(req,res)=>{

    let client

    try {
        
client=await pool.connect()

const {bid,alt,url,section}=req.body

const image=req.files.image 

const name=image[0].originalname

const path=image[0].key 


const check='SELECT * FROM banner WHERE banner_id=$1'

const result= await client.query(check,bid)

if (result.rowCount===0) {

    return res.status(404).send({message:'Banner not Found!.'})

}
 
const date= new Date()

const data=[name,alt,url,section,path,date]

const updateQ='UPDATE banner SET name=$1,alt=$2,url=$3,section=$4,path=$5,date=$6 WHERE banner_id=$7'

await client.query(updateQ,data)

return res.status(200).send({message:'Successfully Updated!.'})


    } catch (error) {
        
        console.log(error)

        return res.status(500).json({message:'Internal Server Error!.'})
    }
    finally{
        
        if (client) {
            
            await client.release()

        }
    }
}






exports.getBanner = async (req, res) => {
    let connection;
      
    try {
      const { bannerId } = req.params;
  
      connection = await pool.connect();
  
      const check = 'SELECT * FROM banner WHERE banner_id = $1';
      const result = await connection.query(check, [bannerId]);
  
      if (result.rowCount === 0) {
        return res.status(404).send({ message: 'Banner not found!' });
      }
  
      const path = result.rows[0].banner_path;
      const key = 'banner/' + path.substring(path.lastIndexOf('/') + 1);
  
      // Generate a signed URL for the S3 object
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
  
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
      return res.json({url:signedUrl});
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal Server Error!' });
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  };