const express= require('express')
const {  courseCategoryCreation, viewCategoryList, addCodeToCategory } = require('../controllers/CategoryCreation')
const router= express.Router()


router.post('/create',courseCategoryCreation)
router.get('/view_category',viewCategoryList)
router.post('/add_code',addCodeToCategory)




module.exports=router