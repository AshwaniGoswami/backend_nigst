const pool = require("../config/pool");


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
exports.viewAlbum=async(req,res)=>{
  let connection
  try {
    const{Cname}=req.body;
    const AllAlbumView="SELECT name,path from album WHERE category_name=$1";
    connection=await pool.connect()
    const allAlbum=await connection.query(AllAlbumView,[Cname])
    return res.send({data:allAlbum.rows})
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



