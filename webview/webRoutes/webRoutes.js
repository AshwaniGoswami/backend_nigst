const express = require('express')
const { viewAllDetailsFaculty } = require('../../viewList/allview')
const { viewWebAnnouncement, viewAllWebAnnouncement, viewPDFAnnouncement, viewAllPDFs, viewArchiveToWebsite, viewArchivePDFAnnouncement } = require('../announcement')
const { createBanner, getBanner } = require('../Banner')
const { bannerUpload, galleryUpload, SOI_PROJECT_UPLOAD, headerUpload } = require('../../middleware/faculty')

const { FooterCreate, viewFooter, updateFooter, deleteFooter } = require('../footer')
const { createAlbumCategory, viewAlbumCategory, updateAlbumCategory } = require('../../controllers/GalleryCategory')
const { createAlbum, viewAlbum } = require('../../controllers/album')
const { createProject, viewProject, updateSoiProject, deleteProject } = require('../../controllers/soi_project')
const { HeaderCreate, viewHeader } = require('../header')

const router = express.Router()

router.get('/webannouncement', viewWebAnnouncement)
router.get('/facultynsub', viewAllDetailsFaculty)
router.get('/view_ann_all', viewAllWebAnnouncement)
router.get('/view_ann/:aid', viewPDFAnnouncement)
router.get('/view', viewAllPDFs)
router.get('/view_archive', viewArchiveToWebsite)
router.get('/view_archive/:aid', viewArchivePDFAnnouncement)
router.post('/create_banner', bannerUpload, createBanner)
router.get('/view_banner', getBanner)




router.post('/footer_create', FooterCreate)
router.get('/footer_view', viewFooter)
router.patch('/footer_update', updateFooter)
router.delete('/footer_delete', deleteFooter)
router.post('/create_album_category', createAlbumCategory)
router.get('/view_album_category', viewAlbumCategory)
router.patch('/update_album_category', updateAlbumCategory)
router.post('/create_album', galleryUpload, createAlbum)
router.post('/create_project', SOI_PROJECT_UPLOAD, createProject)
router.get('/view_project', viewProject)
router.patch('/update_project', updateSoiProject)
router.delete('/delete_project', deleteProject)
router.get('/view_album', viewAlbum)
router.post('/create_header', headerUpload, HeaderCreate)
router.get('/view_header', viewHeader)
module.exports = router