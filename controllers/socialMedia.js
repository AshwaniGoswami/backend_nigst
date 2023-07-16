const pool = require("../config/pool");
const generateNumericValue = require("../generator/NumericId");


exports.createSocialMedia=async(req,res) =>{
    let connection;
    try {
        const{name, url, icon, iconColor}=req.body;

        connection=await pool.connect();

        if(!name || !url || !icon || !iconColor){
            return res.status(400).send({message: "Please enter all the data!"});
        }

        const checkExistence="SELECT * FROM social_media WHERE s_name=$1"
        const result=await connection.query(checkExistence,[name]);

        if(result.rowCount>0)
        {
            return res.status(500).send({message:"Data Already Exists!"});

        }
        let SID = 'S-' + generateNumericValue(7);
    const check = 'SELECT * FROM social_media WHERE s_id = $1';
    let result1 = await connection.query(check, [SID]);

    while (result1.rowCount > 0) {
      SID = 'S-' + generateNumericValue(7);
      result = await connection.query(check, [SID]);
    }

    const insertQ= 'INSERT INTO social_media (s_id,s_name,s_url,s_icon,s_icon_color) VALUES ($1,$2,$3,$4,$5)';
    const data=[SID, name, url, icon, iconColor];
    const checkData= await connection.query(insertQ,data);

    return res.status(200).send({message:"Social Media create successfully!"});

    } catch (error) {
        console.error(error);
        return res.status(400).send({ message: 'Error creating !' });
      } finally {
        if (connection) {
          await connection.release();
        }
      }    
    
};




exports.viewSocialMedia=async(req,res)=>{
    let connection;
    try {
        const allViewMedia = "SELECT s_name as name, s_url as url, s_icon as icon, s_icon_color as icon_color, visibility FROM social_media ORDER BY s_name ASC";
    connection = await pool.connect();
    const allMedia = await connection.query(allViewMedia);
    // if (allMedia.rowCount === 0) {
    //   return res.status(404).send({ message: 'No data found' });
    // }
    return res.status(200).send({data:allMedia.rows})

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'Internal server error!' });
      } finally {
        if (connection) {
          await connection.release();
        }
    }    
    
};


exports.updateDetails=async(req,res) =>{
    let connection
  try {
    const{Sid,name, url, icon,iconColor}=req.body
    // const checkQuery = 'SELECT * FROM social_media WHERE s_id = $1';
    connection=await pool.connect()
    const updateMediaDetails="UPDATE social_media SET s_name=$1, s_url=$2, s_icon=$3, s_icon_color=$4 WHERE s_id=$5"
    // const checkResult=await connection.query(checkQuery,[Sid]);
    // if (checkResult.rowCount === 0) {
    //     return res.status(404).send({ message: 'This media Does Not Exist!' });
    //   }
    //   const mediaData = checkResult.rows[0];
    //   const { s_name: currentname, s_url: currenturl, s_icon: currentIcon, s_icon_color: currenticonColor } = mediaData;
  
    //   const updatedSname = name || currentname;
    //   const updatedUrl = url || currenturl;
    //   const updatedIcon = icon || currentIcon;
    //   const updatedIconColor = iconColor || currenticonColor;
    let data=[name,url,icon,iconColor,Sid];
      await connection.query(updateMediaDetails, data);
  
      return res.status(200).send({ message: 'Successfully Updated!' });
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
