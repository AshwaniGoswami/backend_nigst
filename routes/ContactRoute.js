const express=require('express')
const { postContact } = require('../controllers/ContactController')
const router=express.Router()

router.post('/v0',postContact)

module.exports=router