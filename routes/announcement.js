
const express= require('express')
const { createAnnouncement, archiveAnnouncement, retrieveAnnouncement } = require('../admin/create')
const { uploadAnnouncement } = require('../middleware/faculty')
const { viewAnnouncementToAdmin } = require('../admin/view')
const { editAnnouncementForPosting } = require('../admin/edit')
const router = express.Router()
router.post('/create',uploadAnnouncement,createAnnouncement)
router.post('/archive',archiveAnnouncement)
router.post('/retrieve',retrieveAnnouncement)
router.get('/view',viewAnnouncementToAdmin)
router.patch('/edit',editAnnouncementForPosting)
module.exports=router