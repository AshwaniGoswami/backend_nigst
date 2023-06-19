const { PayloadInstance } = require("twilio/lib/rest/api/v2010/account/recording/addOnResult/payload");
const pool = require("../config/pool");
const generateNumericValue = require("../generator/NumericId");

// =============create===============================
exports.createProject=async(req,res)=>{
    let connection
    try {
        const{Pname,Pdescription}=req.body;
        const image=req.files.image
        const path=image[0].location
        connection=await pool.connect()
        
        if (!Pname || !Pdescription) {
            return res.send({ message: "Please enter all the data" });
        }
        connection=await pool.connect()
        const checkExxistence="SELECT * from soi_project WHERE p_name=$1"
        const result2=await connection.query(checkExxistence,[Pname])
        if(result2.rowCount>0){
            return res.status(500).send({message:'Data Already Exist!'})
        }
        
        let PID='P-'+generateNumericValue(7)
        const check='SELECT * FROM soi_project WHERE p_id=$1'
        const result=await connection.query(check,[PID])
        while(result.rowCount>0){
            PID='P-'+ generateNumericValue(7)
            result=await connection.query(check,[PID])
        }
        const check1='INSERT INTO  soi_project(p_id,p_name,p_description,path) VALUES ($1, $2, $3, $4)'
        const data1=[PID,Pname,Pdescription,path]
        const result1=await connection.query(check1,data1)
        return res.status(500).send('created successfully!');
        // const query=
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error creating!');
    }
    finally{
        if (connection) {
            await connection.release()
        } 
    }
}

// ====================get all data======================

exports.viewProject=async(req,res)=>{
    let connection
    try{
        const allViewProject="SELECT p_name,p_description,path FROM soi_project"
        connection=await pool.connect()
        const allProject=await connection.query(allViewProject)
        return res.send({data:allProject.rows})
       
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
exports.updateSoiProject=async(req,res)=>{
    let connection
    try {
      const{Pname,Pdescription,Pid}=req.body
      const updateProject="UPDATE soi_project SET p_name=$1,p_description=$2 WHERE p_id=$3"
      connection=await pool.connect()
  
      const updateProjectSOI=await connection.query(updateProject,[Pname,Pdescription,Pid])
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

//   =============================delete=======================

exports.deleteProject=async(req,res)=>{
    let connection
    try{
        const {Pid}=req.body
        if (!Pid) {
            return res.send({ message: "Please provide the Project ID" });
          }
          connection=await pool.connect()
          const ExistanceProject_ID="SELECT * FROM soi_project WHERE p_id=$1"
          const result=await connection.query(ExistanceProject_ID,[Pid]);
          if(result.rowCount==0)
          return res.send({message:"Project ID does not exist!"})
          
          
          const delProject="DELETE FROM soi_project WHERE p_id=$1"
          const dProject=await connection.query(delProject,[Pid])
          return res.send({message: "Successfully Deleted!"})
    }

    catch (error) {
        console.error(error)
        return res.status(500).send({message:'Internal Server Eroor!.'})
    }
finally{
    if (connection) {
        await connection.release()
    }
}
}