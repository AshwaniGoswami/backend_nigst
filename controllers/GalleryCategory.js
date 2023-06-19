const pool = require("../config/pool");
const generateNumericValue = require("../generator/NumericId");

// =============Create====================
exports.createAlbumCategory=async(req,res)=>{
  let connection
try{
 const{Cname}=req.body;
 connection=await pool.connect()
 if (!Cname) {
  return res.send({ message: "Please enter all the data" });
}
  // Start a transaction
  await connection.query('BEGIN');
  let GID='G-'+generateNumericValue(7)
  const check='SELECT * FROM album_category  WHERE category_id=$1'
  const result=await connection.query(check,[GID])
  while(result.rowCount>0){
    GID='G-'+ generateNumericValue(7)
    result=await connection.query(check,[GID])
}

 const check1='INSERT INTO  album_category(category_id,category_name) VALUES ($1, $2)'
 const data1=[GID,Cname]
 const result1=await connection.query(check1,data1)

    // Commit the transaction
    await connection.query('COMMIT');
    return res.status(500).send('Category created successfully!');
} catch (error) {
  console.error('Error creating category', error);
   // Rollback the transaction in case of an error
   await connection.query('ROLLBACK');
  return res.status(500).send('Error creating category!');
}
finally{
  if (connection) {
      await connection.release()
  }
}
}

// =========get data=========
exports.viewAlbumCategory=async(req,res)=>{
  let connection
try{
 const allAlbum_categoey="SELECT category_id,category_name FROM album_category"
 connection=await pool.connect()
 const allAL=await connection.query(allAlbum_categoey)
 return res.send({data:allAL.rows})

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
exports.updateAlbumCategory=async(req,res)=>{
  let connection
  try {
    const{Cid,Cname}=req.body
    const updateAlbumCat="UPDATE album_category SET category_name=$1 WHERE category_id=$2"
    connection=await pool.connect()

    const updateALCat=await connection.query(updateAlbumCat,[Cname,Cid])
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






