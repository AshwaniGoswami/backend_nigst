const pool = require("../config/pool");
const bcrypt=require('bcrypt')
const generateNumericValue = require("../generator/NumericId");
const jwt = require('jsonwebtoken')


exports.adminCreation = async (req,res)=>{
    try{
        const {username, phone, email, password, role} =req.body;
    

        const client = await pool.connect();
        const query1 = "SELECT * FROM admin WHERE username=$1"
        const result = await client.query(query1,[username]);

        if (result.rows.length !== 0) {
            throw new Error("This Admin already exists.");
        } 
            let adminId = generateNumericValue(5);
            const query2 = "SELECT * FROM admin WHERE admin_id = $1";
            let result2 = await client.query(query2, [adminId]);
            while (result2.rows.length !== 0) {
                adminId = 'A-NIGST' + generateNumericValue(5);
                result2 = await client.query(query2, [adminId]);
            }
            console.log(result2.rows)
            const salt = await bcrypt.genSalt(16);
            const hashedPass = await bcrypt.hash(password, salt);

            const data = [username, phone, email, hashedPass, adminId, role];
            console.log(data)
            const query3 = "INSERT INTO admin (username, phone, email, password, admin_id, role) VALUES ($1, $2, $3, $4, $5, $6)";
            await client.query(query3, data);
            res.send({ message: "Admin successfully created." });
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Something went wrong." });
    }
}

exports.adminLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const client = await pool.connect();
      const query = "SELECT * FROM admin WHERE email = $1";
      const result = await client.query(query, [email]);
  
      if (result.rows.length === 0) {
        throw new Error("Invalid email or password.");
      }
  
      const admin = result.rows[0];
      const isMatch = await bcrypt.compare(password, admin.password);
  
      if (!isMatch) {
        throw new Error("Invalid email or password.");
      }
      const data = {

        id: result.rows[0].admin_id

      }
      console.log(result.rows[0].role)
      const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1h' })
      const type= result.rows[0].role

      res.send({ message: "Login successful." ,token,type});
    
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Something went wrong." });
    }
  }

  exports.adminFilter = async(req,res)=>{
    try{
      const client = await pool.connect();
      const {admin_id}= req.body;
      const query= `SELECT username, role from admin where admin_id = $1`
      const result=await client.query(query,[admin_id])
      if(result.rowCount===0)
      {
        res.send(
          {message:'nothing to show'}
          )
        }
      res.send(result.rows)
      await client.release()




    }catch (error) {
      console.log(error);
      res.status(500).send({ error: "Something went wrong." });
    }
  }
  