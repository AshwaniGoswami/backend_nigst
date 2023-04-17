const express=require('express')
const { viewCourses, courseCreation, updateCourse, filterCourse, updateCourseStatus, changeCourseStatus, courseScheduler} = require('../controllers/courseController')
const router=express.Router()

router.post('/creation',courseCreation)
// router.put('/editCourse/:courseId',editCourse)
router.patch('/update',updateCourse)
router.get('/view',viewCourses)
// router.put('/status/:courseId',coursestatus)
router.get('/filter',filterCourse)
router.post('/activestatus',updateCourseStatus)
router.put('/status',changeCourseStatus)
router.post('/scheduler',courseScheduler)

module.exports=router