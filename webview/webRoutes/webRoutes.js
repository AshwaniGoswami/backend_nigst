const express = require('express')
const { viewAllDetailsFaculty } = require('../../viewList/allview')
const { viewWebAnnouncement, viewAllWebAnnouncement, viewPDFAnnouncement, viewAllPDFs, viewArchiveToWebsite } = require('../announcement')
const { viewFacultyByStatus } = require('../facultyView')
const router = express.Router()

router.get('/webannouncement',viewWebAnnouncement)
router.get('/facultynsub',viewAllDetailsFaculty)
router.get('/faculty_members',viewFacultyByStatus)
router.get('/view_ann_all',viewAllWebAnnouncement)
router.get('/view_ann/:aid',viewPDFAnnouncement)
router.get('/view',viewAllPDFs)
router.get('/view_archive',viewArchiveToWebsite)
module.exports=router