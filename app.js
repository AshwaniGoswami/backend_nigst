const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const helmet = require('helmet')
var hpp = require('hpp')
const bodyParser =require('body-parser')
dotenv.config()

const app = express()

app.use(helmet())
app.disable('x-powered-by')
// app.use(bodyParser.json({ limit: '10mb', extended: true }));
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
const coursec = require('./routes/coursesRoutes')
const psauth = require('./routes/psRoutes')
const cat=require('./routes/courseCategoryRoute')
const special=require('./routes/corpRoutes')
const fAuth=require('./routes/FacultyRoutes')
const contact=require('./routes/ContactRoute')
const enrol=require('./routes/EnrollRoutes')
const showEnrolCor=require('./viewRoutes/EnrollView')
const announcement=require('./routes/announcement')
const viewanno =require("./viewRoutes/viewanno")
const web =require('./webview/webRoutes/webRoutes')
const upimg = require('./routes/ImageRoutes')
const admin=require('./admin/adminRoutes')
const visit = require('./routes/vcount')
const superadmin = require('./remote/admincreationroutes')
const nfolimg=require('./routes/newFolImg')
const gallery=require('./routes/albumRoutes')
const vid=require('./routes/videoRoutes')
const depart=require('./routes/departRoutes')
const smsv=require('./routes/smsRoutes')
const pdfup=require('./routes/pdfRoutes')
const tender = require('./routes/tenderRouter')
const fol=require('./routes/folderUpRoutes')



app.use(cors())

app.use(
  express.json(
    {
      limit: "30mb",
      extended: true,
    }
  )
)

app.use(
  express.urlencoded(
    {
      limit: "30mb",
      extended: true,
    }
  )
)

app.use(hpp())

app.use('/course',coursec)
app.use('/secure',psauth)
app.use('/category',cat)
app.use('/corp',special)
app.use('/sauth',fAuth)
app.use('/enrollment',enrol)
app.use('/courses/',showEnrolCor)
app.use('/announcement',announcement)
app.use('/viewanno',viewanno)
app.use('/viewweb',web)
app.use('/contact',contact)
app.use('/upload',upimg)
app.use('/admin',admin)
app.use('/viscount',visit)
app.use('/sadmin',superadmin)
app.use('/folImg',nfolimg)
app.use('/gallery',gallery)
app.use('/video',vid)
app.use('/dep',depart)
app.use('/sms',smsv)
app.use('/pdf',pdfup)
app.use('/tender',tender)
app.use('/fold',fol)
app.get('/',(req,res)=>{
  res.send('Node is running')
})

// image upload route

module.exports = app
