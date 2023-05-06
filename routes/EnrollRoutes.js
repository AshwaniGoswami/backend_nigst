const express= require('express')
const { Enrol, GetEnrolledCourses, CancelEnrollment, reEnroll } = require('../controllers/Enrollment')
const router =express.Router()

router.post('/enrol',Enrol)
router.get('/view_enroll/:studentId',GetEnrolledCourses)
router.patch('/cancel/:enrollmentId',CancelEnrollment)
router.put('/renroll/:enrollmentID',reEnroll)

module.exports=router