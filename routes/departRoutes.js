const express= require('express')
const { departments, organizationCourseAssi, otherCategory, courseAssi, idAssi, departAssi, viewOrganizations, viewAllOrganizations, viewdepartAssi } = require('../controllers/organization')
const router =express.Router()

router.post('/d',departments)
router.get('/view',viewAllOrganizations)
router.get('/v',viewOrganizations)
router.post('/organization_assign',organizationCourseAssi)
router.get('/othercategory',otherCategory)
router.get('/orgname',courseAssi)
router.get('/idassi',idAssi)
router.post('/departassi',departAssi)
router.get('/viewda',viewdepartAssi)

module.exports=router