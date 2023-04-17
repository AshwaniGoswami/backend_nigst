const express= require('express')
const { uploadVideo, storeVideos } = require('../controllers/videoUp')
const { videoUpload } = require('../middleware/faculty')

const router=express.Router()

router.post('/vidup',storeVideos)
router.post('/',videoUpload,uploadVideo)

module.exports=router