const app = require("./app")
const { connect } = require("./config/postgreconfig")
const { createTables } = require("./dataTab/createTables")

connect()
createTables()

PORT=process.env.PORT || 4000

app.listen
(
    PORT,()=>
    {
        console.log(`server is listening at PORT : ${PORT}`)
    }
)
