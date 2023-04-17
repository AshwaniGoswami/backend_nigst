const express= require('express')
const { Enrol, GetEnroledCourses } = require('../controllers/Enrollment')
const router =express.Router()

router.post('/enrol',Enrol)
router.get('/studentId',GetEnroledCourses)

module.exports=router