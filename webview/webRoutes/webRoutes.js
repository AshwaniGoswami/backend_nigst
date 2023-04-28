const express = require('express')
const { viewAllDetailsFaculty } = require('../../viewList/allview')
const { viewWebAnnouncement } = require('../announcement')
const { viewFacultyByStatus } = require('../facultyView')
const router = express.Router()

router.get('/webannouncement',viewWebAnnouncement)
router.get('/facultynsub',viewAllDetailsFaculty)
router.get('/faculty_members',viewFacultyByStatus)
module.exports=router