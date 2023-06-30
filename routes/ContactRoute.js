const express=require('express')
const { postContact, viewContact, createOffice, sendOffice } = require('../controllers/ContactController')
const router=express.Router()

router.post('/v0',postContact)
router.get('/contact_view',viewContact)
router.post('/create_office',createOffice)
router.get('/office_view',sendOffice)

module.exports=router