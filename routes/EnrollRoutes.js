const express= require('express')
const { Enrol, GetEnrolledCourses } = require('../controllers/Enrollment')
const router =express.Router()

router.post('/enrol',Enrol)
router.get('/view_enroll/:studentId',GetEnrolledCourses)

module.exports=router