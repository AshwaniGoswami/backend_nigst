const express = require('express')
const { viewAllDetailsFaculty } = require('../../viewList/allview')
const { viewWebAnnouncement } = require('../announcement')
const router = express.Router()

router.get('/webannouncement',viewWebAnnouncement)
router.get('/facultynsub',viewAllDetailsFaculty)
module.exports=router