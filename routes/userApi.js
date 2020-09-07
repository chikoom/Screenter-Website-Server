const express = require('express')
const Sequelize = require('sequelize')
const userRouter = express.Router()
const moment = require('moment')
require('dotenv').config()
const {
    DB_URL,
    DB_USER,
    DB_PASS,
    DB_NAME,
    DB_PORT
} = process.env

const sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASS,
    {
        host: DB_URL,
        port: DB_PORT,
        logging: console.log,
        maxConcurrentQueries: 100,
        dialect: 'mysql',
        dialectOptions: {
            ssl: 'Amazon RDS'
        },
        pool: { maxConnections: 5, maxIdleTime: 30 },
        language: 'en',
    }
)
const clearUserId = (userId) => {
    let newLineIndex = userId.indexOf('|')
    let newUserId = userId
    if (newLineIndex > 0) {
        newUserId = newUserId.substring(newLineIndex + 1, newUserId.length - 1)
    }
    return newUserId
}


userRouter.get('/', async function (req, res) {
    const users = await sequelize
        .query(`SELECT * FROM Users`)
    res.send(users[0])
})

userRouter.get('/:id', async function (req, res) {
    const id = clearUserId(req.params.id)
    const user = {}
    const pastShows = []
    const futureShows = []
    try {
        const userData = await sequelize
            .query(
                `SELECT id, username, imageURL, userRole
             FROM Users
             WHERE Users.id LIKE '%${id}%'`
            )
        const shows = await sequelize
            .query(
                `SELECT * 
            FROM Shows AS s, User_Shows AS u
            WHERE s.id = u.showId
            AND u.userId LIKE '%${id}%'`
            )
        for (let show of shows[0]) {
            moment() < moment(show.startTime).tz("Asia/Jerusalem") ?
                futureShows.push(show) :
                pastShows.push(show)
        }
        user['id'] = userData[0][0].id
        user['firstName'] = userData[0][0].firstName
        user['lastName'] = userData[0][0].lastName
        user['email'] = userData[0][0].email
        user['phone'] = userData[0][0].phone
        user['userRole'] = userData[0][0].userRole
        user['username'] = userData[0][0].username
        user['imageURL'] = userData[0][0].imageURL
        user['pastShows'] = pastShows
        user['futureShows'] = futureShows
        res.send(user)
    } catch (err) {
        res.send(null)
    }
})

userRouter.post('/show', async function (req, res) {
    let showID  = req.body.showID
    console.log(showID)
    console.log(req.body.userID)
    let userID =escape(req.body.userID)
    try {
        await sequelize
            .query(
                `INSERT INTO User_Shows VALUES(
                               '${userID}',
                                ${showID}
                            )`
            )
        const saved = await sequelize
            .query(
                `SELECT * FROM Shows
                WHERE Shows.id = ${showID}`
            )
        console.log(saved, "==============================================================")
        ///not hapend //////\\\\\\\
        res.send(saved[0][0])
    }
    catch (err) {
        res.send("saving error")
    }
})
userRouter.delete('/show/:userID/:showID', async function (req, res) {
    const { userID , showID } = req.params
    console.log(req.params , "============")
    try {
        const result = await sequelize
            .query(
                `DELETE FROM User_Shows
            WHERE userID = '${userID}'
            AND showID = ${showID}`
            )
            console.log(result)
        res.send("trgdfgdfgdgdfgdfgdfgdfgdfue")
    }
    catch (err) {
        res.send("error")
    }
})


userRouter.post('/', async function (req, res) {
    const {
        id,
        firstName,
        lastName,
        username,
        imageURL,
        videoURL,
        email,
        birthday,
        memberSince,
        gender,
        about,
        userRole,
        isAuthorized,
        phone
    } = req.body
    try {
        await sequelize
            .query(
                `INSERT INTO Users VALUES(
                                        '${escape(id)}',
                                        '${firstName}',
                                        '${lastName}',
                                        '${username}',
                                        '${imageURL}',
                                        '${videoURL}',
                                        '${email}',
                                        '${birthday}',                                                     
                                        '${memberSince}',
                                        '${gender}',
                                        '${about}',
                                        '${userRole}',
                                         ${isAuthorized},
                                        '${phone}'
                                    )`
        )
        const saved = await sequelize
            .query(
                `SELECT * FROM Users
            WHERE Users.id = '${escape(id)}'`
            )
        res.send(saved[0][0])
    }
    catch (err) {
        res.send('saving error')
    }
})

userRouter.put('/:id', async function (req, res) {
    const { id } = req.params
    const { field } = req.body
    let { value } = req.body
    if (typeof value === 'string') value = `'${value}'`

    try {
        await sequelize
            .query(
                `UPDATE Users
            SET ${field} = ${value}
            WHERE id = '${escape(id)}'`
            )
        res.send(true)
    }
    catch (err) {
        res.send(false)
    }

})

userRouter.delete('/show/:userID/:showID', async function (req, res) {
    const { userID , showID } = req.params
    try {
        await sequelize
            .query(
                `DELETE FROM User_Shows
            WHERE userID = '${userID}'
            AND showID = ${showID}`
            )
        res.send(true)
    }
    catch (err) {
        res.send(false)
    }
})

userRouter.delete('/:id', async function (req, res) {
    const { id } = req.params
    try {
        await sequelize
            .query(
                `DELETE FROM Users
            WHERE id = '${id}'`
            )
        res.send(id)
    }
    catch (err) {
        res.send('delete err')
    }
})

module.exports = userRouter


