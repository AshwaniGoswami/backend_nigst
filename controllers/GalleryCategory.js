const pool = require("../config/pool");

exports.createGalleryCategory=async(res,res)=>{
    try {
        const {name}=req.body
        const client= await pool.connect()
        const insertQ='INSERT INTO album_category(category_name) VALUES($1)'
        await client.query(insertQ,[name])
      return  res.send({message:'Successfully created.'})
        await client.release()
    } catch (error) {
        console.log(error)
      return  res.send({message:'Something went Wrong!.'})
    }
}