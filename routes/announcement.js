
const express= require('express')
const { createAnnouncement, archiveAnnouncement, retrieveAnnouncement } = require('../admin/create')
const { viewAnnouncement } = require('../admin/view')
const router = express.Router()
router.post('/create',createAnnouncement)
router.post('/archive',archiveAnnouncement)
router.post('/retrieve',retrieveAnnouncement)
router.get('/view',viewAnnouncement)
module.exports=router