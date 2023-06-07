const pool = require("../config/pool");
const generateNumericValue = require("../generator/NumericId");

exports.createBanner=async(req,res)=>{

    let connection

    try {

        const {alt,url,section}=req.body 

        const file=req.files.image

        const name=file[0].originalname

        const path=file[0].key

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