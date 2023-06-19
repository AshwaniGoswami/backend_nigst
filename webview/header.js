const pool = require("../config/pool");
const generateNumericValue = require("../generator/NumericId");

// ===============create ===================
exports.HeaderCreate=async(req,res)=>{
    let connection
    try {
        const{Hname}=req.body
        const image=req.files.image
        const Hpath=image[0].location
        // if(!Hname)
        //     return res.send({message:"Please enter all the data!"})
        connection=await pool.connect()
        const checkExistence="SELECT * FROM header WHERE h_name=$1"  
         const result=await connection.query(checkExistence,[Hname])
         if(result.rowCount>0)
            return res.status(500).send({message:"Data Already Exist!"})
            let HID='H-'+ generateNumericValue(7)
            const check01='SELECT * FROM header WHERE h_id=$1'
            const result1=await connection.query(check01,[HID])
            
                while(result1.rowCount>0){
                        FID='H-'+ generateNumericValue(7)
                        result=await connection.query(check01,[HID])
                }     
            const check1=`INSERT INTO header (h_id,h_name,h_path) VALUES($1,$2,$3)`
            const data=[HID,Hname,Hpath]
            const result2=await connection.query(check1,data)
            return res.send({message:'Successfully Created'})

    } catch (error) {
        console.error(error)
        return res.status(500).send({message:'Internal server error!'})        
    }
    finally{
        if(connection)
        {
            await connection.release()
        }
    }
}


// =============view=======================
exports.viewHeader=async(req,res)=>{
    let connection
    try{
        const allViewHeader="SELECT h_id,h_name,h_path FROM header"
        connection=await pool.connect()
        const allHeader=await connection.query(allViewHeader)
        return res.send({data:allHeader.rows}) 
       
       }
       catch(error){
         console.log(error)
         return res.status(500).send({message:'Iternal server error!'})
       }
       finally{
         if(connection){
           await connection.release()
         }
       }
       }

// ===================update============================
exports.updateHeader=async(req,res)=>{
    let connection
    try {
      const{Hname,HID}=req.body
      const updateH="UPDATE header SET  h_name=$1 WHERE h_id=$2"
      connection=await pool.connect()
  
      const updateHeader=await connection.query(updateH,[Hname,HID])
      return res.send({message:"Successfully Updated!"})
    } catch (error) {
      console.error(error)
      return res.status(500).send({message:"Internal server error!"})
    }
    finally{
      if(connection){
        await connection.release()
      }
    }
  }
