const chart = require('./chart')
const monito = require('./monito')
const user = require('./user')
const authorizations = require('./authorizations')
const v2 = require('./v2')
const check = require('./check')
module.exports = app => {
    app.use('/chart', chart)
    app.use('/monito', monito)
    app.use('/user', user)
    app.use('/authorizations', authorizations)
    app.use('/v2', v2)
    app.use('/check', check)
};