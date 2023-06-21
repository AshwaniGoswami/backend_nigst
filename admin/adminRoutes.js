const express=require('express')
const { viewContact } = require('../controllers/ContactController')
const { createFacultyMembership, assignSubjects, createFaculty, archiveAnnouncement } = require('./create')
const { viewStudents, viewAllStudents, viewFaculty, viewAllDetailsFaculty, organizationFilter, viewFacultyName, viewFacultyMembersWithFaculty, viewCourseByFaculty, viewAllEnrollment, viewAllCancelEnrollment, showReportsToAdmin, filter, viewArchiveAnnouncementToAdmin, viewCancelledCourses } = require('./view')
const { loginAccess, activeInactive, updateScheduling, updateFacultyDetails } = require('./edit')
const { deleteSchedulingCourse } = require('./delete')
const router=express.Router()

router.get('/studentsView',viewAllStudents)
router.post('/subassign',assignSubjects)
router.get('/contactview',viewContact)
router.get('/organizationfilter',organizationFilter)
router.post('/faculty_create',createFaculty)
router.get('/faculty_show',viewFacultyName)
router.patch('/access',loginAccess)
router.patch('/act_inact_faculty',activeInactive)
router.get('/faculty_member_faculty/:faculty',viewFacultyMembersWithFaculty)
router.get('/delete/:status/:batch/:courseID',deleteSchedulingCourse)
router.patch('/updateSchedule',updateScheduling)
router.get('/course_faculty/:faculty',viewCourseByFaculty)
router.get('/view_all_enrol',viewAllEnrollment)
router.get('/view_all_cancelenrol',viewAllCancelEnrollment)
router.get('/all_reports',showReportsToAdmin)
router.get('/filter',filter)
router.patch('/archive_ann',archiveAnnouncement)
router.get('/show_archive_admin',viewArchiveAnnouncementToAdmin)
router.patch('/update_faculty',updateFacultyDetails)
router.get('/view_cancelled',viewCancelledCourses)


module.exports=router
