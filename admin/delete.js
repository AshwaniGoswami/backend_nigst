const pool = require("../config/pool")



exports.deleteSchedulingCourse=async(req,res)=>{
    try {
      const {status,batch,courseID}=req.params
      const check='SELECT * FROM course_scheduler WHERE course_status=$1 AND batch_no=$2 AND course_id=$3'
      const data=[status,batch,courseID]
      const client=await pool.connect()
      const result=await client.query(check,data)
      if (result.rowCount===0) {
        return res.status(404).send({message:'Record NOt Exists!.'})
      }
      else{
        if (result.rows[0].course_status==='running'|| result.rows[0].course_status==='completed') {
            return res.send(result.rows[0].course_status)
           }
           else{
             res.send(result.rows)
     
           }
      }
    
      await client.release()
    } catch (error) {
      console.error(error)
      res.status(500).send({message:'Internal Server Error!.'})
    }
  }
  
  