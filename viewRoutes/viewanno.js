const express= require('express')
const { viewAnnouncement } = require('../admin/view')
const router= express.Router()


router.get('/view',viewAnnouncement)


module.exports=router