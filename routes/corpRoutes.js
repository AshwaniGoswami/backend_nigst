const express= require('express')
const { createCorporateUsers } = require('../controllers/CorporateController')
const router = express.Router()


router.post('/create',createCorporateUsers)


module.exports=router