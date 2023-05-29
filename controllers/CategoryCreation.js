const pool = require("../config/pool");
const generateShortId = require("../generator/shortID");








exports.courseCategoryCreation = async (req, res) => {
  
  let client

  try {
  
    client = await pool.connect()

    const { name } = req.body

    const checkQuery = `SELECT * FROM course_category WHERE course_category_name = $1`

    const checkValues = [name]

    const checkResult = await client.query(checkQuery, checkValues)

    if (checkResult.rowCount > 0) {
    
      return res.status(409).json({ error: "Course category already exists" })
    
    }

    const categoryId = generateShortId(5)

    const courseCategoryId = name.slice(0, 5).toUpperCase()
    
    const category_id = `${courseCategoryId}-${categoryId}`

    const query = `
      INSERT INTO course_category (course_category_name, category_id)
      VALUES ($1, $2)
      RETURNING id, course_category_name, category_id
    `
    const values = [name, category_id]

    const result = await client.query(query, values)
    
    const createdCourseCat = result.rows[0]

    return res.status(201).json({ data: createdCourseCat })
  
  }
   catch (err) {
  
    console.error(err)
  
    return res.status(500).json({ error: "Internal server error" })
  
  }
   finally {
  
    if (client) {
  
      await client.release()
  
    }
  }
}

exports.viewCategoryList=async(req,res)=>{
  
  let client
  
  try {
  
    client=await pool.connect()
  
    const check='SELECT course_category_name as category,category_id as catID from course_category'
  
    const result=await client.query(check)
  
    if (result.rowCount===0) {
  
      return res.status(404).send({message:'No Category Found!.'})
  
    }
  
    return res.status(200).send({categories:result.rows})

  }
   catch (error) {
  
    console.log(error)
  
    return res.status(500).send({message:'Internal Server Error!.'})
  
  }
  finally{
  
    if (client) {
  
      await client.release()
  
    }
  }
}


exports.addCodeToCategory=async(req,res)=>{

  let connection

  try {

    const {name,code}=req.body

    const check= 'SELECT * FROM category_code WHERE category=$1 AND code=$2'

    const result=await client.query(check,[name,code])

    if (result.rowCount>0) {

      return res.send({message:`This code already allocated to: ${name}` })

    }
    else{

      const insertQ='INSERT INTO category_code (category,code) VALUES ($1,$2)'

      await connection.query(insertQ,[name,code])

      return res.status(201).send({message:'Successfully added code.'})

    }
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