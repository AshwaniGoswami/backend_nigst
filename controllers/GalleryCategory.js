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
    return res.status(201).send('Category created successfully!');
} catch (error) {
  console.error('Error creating category', error);
   // Rollback the transaction in case of an error
   await connection.query('ROLLBACK');B   
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
    const{Cid,Cvisible}=req.body
    const updateAlbumCat="UPDATE album_category SET visibility=$1 WHERE category_id=$2"
    connection=await pool.connect()
    if(Cvisible===true || Cvisible===false){
    const updateALCat=await connection.query(updateAlbumCat,[Cvisible,Cid])
    return res.status(200).send({message:"Successfully Updated!"})
  }
  return res.status(401).send({message:"Visibility cannot be string"})
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


exports.deleteAlbumCategory = async (req, res) => {
  let connection;
  try {
    const {cname } = req.body;
    connection = await pool.connect();

    // Start a transaction
    await connection.query('BEGIN');

    // Check if Cname exists in album_category table
    const checkQuery = 'SELECT * FROM album_category WHERE category_name = $1';
    const checkResult = await connection.query(checkQuery, [cname]);

    if (checkResult.rowCount === 0) {
      // Rollback the transaction
      await connection.query('ROLLBACK');
      return res.status(404).send({ message: `Category with name ${cname} does not exist.` });
    }

    // Delete data from album table
    const deleteAlbumQuery = 'DELETE FROM album WHERE category_name=$1';
    await connection.query(deleteAlbumQuery, [cname]);

    // Delete data from album_category table
    const deleteCategoryQuery = 'DELETE FROM album_category WHERE category_name = $1';
    await connection.query(deleteCategoryQuery, [cname]);

    // Commit the transaction
    await connection.query('COMMIT');

    return res.status(200).send({ message: `Successfully deleted category ${cname} and associated albums.` });
  } catch (error) {
    console.error(error);
    // Rollback the transaction in case of an error
    await connection.query('ROLLBACK');
    return res.status(500).send({ message: 'Internal server error!' });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
};




