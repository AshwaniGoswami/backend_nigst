const express=require('express')
const { viewContact } = require('../controllers/ContactController')
const { createFacultyMembership, assignSubjects } = require('./create')
const { viewStudents, viewAllStudents, viewFaculty, viewAllDetailsFaculty } = require('./view')
const router=express.Router()

router.get('/studentsView',viewAllStudents)
router.get('/facultyView',viewFaculty)
router.post('/subassign',assignSubjects)
router.get('/contactview',viewContact)
module.exports=router