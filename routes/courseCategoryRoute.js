const express= require('express')
const { CategoryCreation, EditCategory, ViewCourseCategory, viewCoursesByCategory, getCategoryNames, courseCategoryCreation } = require('../controllers/CategoryCreation')
const router= express.Router()


router.post('/create',courseCategoryCreation)
router.put('/edit/:category_id',EditCategory)
router.get('/view',ViewCourseCategory)
router.get('/',getCategoryNames)
router.get('/:course_category_name',viewCoursesByCategory)




module.exports=router