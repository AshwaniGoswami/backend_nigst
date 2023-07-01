const express=require("express")
const { viewAlbumByCategory } = require("../controllers/album")
// const {  getPhotosByCategory, uploadPhoto } = require("../controllers/galleryController")
// const { galleryUpload } = require("../middleware/faculty")
const router=express.Router()

// router.post('/upload',galleryUpload,uploadPhoto)
// router.get('/album/:category',getPhotosByCategory)

router.patch('/album_view_category',viewAlbumByCategory)

module.exports=router