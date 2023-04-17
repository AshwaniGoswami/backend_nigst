const express=require("express")
const {  getPhotosByCategory, uploadPhoto } = require("../controllers/galleryController")
const { galleryUpload } = require("../middleware/faculty")
const router=express.Router()

router.post('/upload',galleryUpload,uploadPhoto)
router.get('/album/:category',getPhotosByCategory)

module.exports=router