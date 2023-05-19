const express =require('express')
const { updateFacultyDetails } = require('../admin/edit')
const { facultyCreation, facultyPassForgot, facultyLogin, fPassReset, fChangePassword, facultyPosition, positionSend, officerFaculty, facultyPositionAssi, viewAllFacultyPositions, viewFaculty } = require('../controllers/facultyAuth')
const { uploadFacultyPhoto } = require('../middleware/faculty')
const router= express.Router()

router.post('/create',facultyCreation)
router.post('/forget',facultyPassForgot)
router.post('/login',facultyLogin)
router.patch('/reset', fPassReset)
router.patch('/change',fChangePassword)
// router.patch('/update',uploadFacultyPhoto,updateFacultyDetails)
router.post('/position',facultyPosition)
router.get('/send',positionSend)
router.get('/officer/:profile',officerFaculty)
router.post('/position_assi',facultyPositionAssi)
router.get('/view',viewAllFacultyPositions)
router.get('/faculty_view',viewFaculty)

module.exports=router