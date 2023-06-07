const express=require('express')
const { postContact, viewContact } = require('../controllers/ContactController')
const router=express.Router()

router.post('/v0',postContact)
router.get('contact_view',viewContact)

module.exports=router