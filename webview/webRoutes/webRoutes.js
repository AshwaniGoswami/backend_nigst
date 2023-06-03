const express = require('express')
const { viewAllDetailsFaculty } = require('../../viewList/allview')
const { viewWebAnnouncement, viewAllWebAnnouncement } = require('../announcement')
const { viewFacultyByStatus } = require('../facultyView')
const router = express.Router()

router.get('/webannouncement',viewWebAnnouncement)
router.get('/facultynsub',viewAllDetailsFaculty)
router.get('/faculty_members',viewFacultyByStatus)
router.get('/view_ann_all',viewAllWebAnnouncement)
module.exports=router