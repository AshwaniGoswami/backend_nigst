const express= require('express')
const { sendsms, sendOTP, verifyOTP } = require('../controllers/smsVerf')


const router=express.Router()

router.post('/ss',sendsms)
router.post('/so',sendOTP)
router.post('/vs',verifyOTP)


module.exports=router