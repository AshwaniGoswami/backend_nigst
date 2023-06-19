const pool = require("../config/pool");
const generateNumericValue = require("../generator/NumericId");

// ===============create ===================
exports.FooterCreate=async(req,res)=>{
    let connection
try {
    const {name,link,type,phone,email,address}=req.body
    if (!name || !link || !type || !phone || !email || !address) {
        return res.send({ message: "Please enter all the data" });
    }
    connection=await pool.connect()
    const checkExxistence="SELECT * from footer WHERE name=$1 AND link=$2 AND type=$3 AND phone=$4 AND email=$5 AND address=$6"
    const result2=await connection.query(checkExxistence,[name,link,type,phone,email,address])
    if(result2.rowCount>0){
        return res.status(500).send({message:'Data Already Exist!'})
    }
    
    let FID='F-'+ generateNumericValue(7)
    const check01='SELECT * FROM footer WHERE footer_id=$1'
    const result=await connection.query(check01,[FID])
    
        while(result.rowCount>0){
                FID='F-'+ generateNumericValue(7)
                result=await connection.query(check01,[FID])
        }
        
    const check=`INSERT INTO  footer (name,link,type,footer_id,phone,email,address) VALUES($1,$2,$3,$4,$5,$6,$7)`
    const data=[name,link,type,FID,phone,email,address]
    const result1=await connection.query(check,data)
    return res.send({message:'Successfully Created!'})
} catch (error) {
    console.error(error)
    return res.status(500).send({message:'Internal Server error!'})
}
finally{
    if (connection) {
        await connection.release()
    }
}
}

// ==================get all data =================
exports.viewFooter=async(req,res)=>{
    let connection
    try{
    const allFooter="SELECT * from footer"
    connection=await pool.connect()
    
    
    const alFooter=await connection.query(allFooter)
    return res.send({data:alFooter.rows})
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

// ====================Update ============================
exports.updateFooter=async(req,res)=>{
    let connection
    try{
        const {footer_id,name,link,type,phone,email,address}=req.body
        const updateFoot="UPDATE footer SET name=$1,link=$2,type=$3,phone=$4,email=$5,address=$6 WHERE footer_id=$7"
        connection=await pool.connect()
    
    
    const uFooter=await connection.query(updateFoot,[name,link,type,phone,email,addressfooter_id])
    return res.send({message: "Successfully Updated!"})
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

// ==================Delete========================
exports.deleteFooter=async(req,res)=>{
    let connection
    try{
        const {footer_id}=req.body
        if (!footer_id) {
            return res.send({ message: "Please provide the footer_id" });
          }
          connection=await pool.connect()
          const ExistanceFooter_id="SELECT * FROM footer WHERE footer_id=$1"
          const result=await connection.query(ExistanceFooter_id,[footer_id]);
          if(result.rowCount==0)
          return res.send({message:"footer_id does not exist!"})
          
          
          const delFoot="DELETE FROM footer WHERE footer_id=$1"
          const dFooter=await connection.query(delFoot,[footer_id])
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
