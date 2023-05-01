const express=require('express')
const { viewCourses, courseCreation, updateCourse, filterCourse, updateCourseStatus, changeCourseStatus, course_scheduling, viewScheduledCourses, sendCourseCodeNo, takeCodeNo, sendBatchAndInfo} = require('../controllers/courseController')
const router=express.Router()

router.post('/creation',courseCreation)
// router.put('/editCourse/:courseId',editCourse)
router.patch('/update',updateCourse)
router.get('/view',viewCourses)
// router.put('/status/:courseId',coursestatus)
router.get('/filter',filterCourse)
router.post('/activestatus',updateCourseStatus)
router.put('/status',changeCourseStatus)
router.post('/scheduler',course_scheduling)
router.get('/view_scheduled',viewScheduledCourses)
router.get('/view_code_no',sendCourseCodeNo)
router.get('/send_course/:code/:no/:type',takeCodeNo)
router.get('/send_batch_info/:courseID',sendBatchAndInfo)

module.exports=router