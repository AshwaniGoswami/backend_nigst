const express= require('express')
const { upNewFolimg, getNewFolUpimg, thumbnail, alltup, delNewFolUpimg } = require('../controllers/imgfolder')
const { post } = require('./coursesRoutes')

const router=express.Router()

router.post('/ufol',upNewFolimg)
router.get('/gfol/:albumName',getNewFolUpimg)
router.get('/tup/:albumName',thumbnail)
router.get('/alltup',alltup)
router.delete('/del/:id',delNewFolUpimg)


module.exports=router