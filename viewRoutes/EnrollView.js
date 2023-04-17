const express= require('express')
const { viewAnnouncement } = require('../admin/view')
const { showCoursesForEnroll } = require('../viewList/showCoursesToENroll')
const router= express.Router()

router.get('/coursesActive',showCoursesForEnroll)
router.get('/viewannouncement',viewAnnouncement)


module.exports=router