const pool = require("../config/pool")



exports.viewFacultyByStatus=async (req,res)=>{
    try {
        const client=await pool.connect()
        const check='SELECT * FROM faculty WHERE status=$1'
        const status=true 
        const result= await client.query(check,[status])
        if (result.rowCount===0) {
            res.status(404).send({message:'Nothing to Show!.'})
        }
        else{
            res.status(200).send({data:result.rows})
        }
        await client.release()
    } catch (error) {
        console.error(error)
        res.status(500).send({message:'Internal Server Error.!'})
    }
}