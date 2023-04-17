const express= require('express')
const { signUp, login, ForgotPassword, passwordReset, verifyEmail, sendVeriMailAgain, viewUsers, filter} = require('../controllers/psAuth')
const router=express.Router()

router.post('/signup', signUp)
router.post('/login', login)
router.post('/forget',ForgotPassword)
router.put('/reset',passwordReset)
router.get('/:token/:regNum',verifyEmail)
router.get('/resend',sendVeriMailAgain)
// router.get('/fil',usersFilter)
// router.get('/viewu',viewUsers)
router.get('/filter',filter)
module.exports=router