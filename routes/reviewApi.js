const express = require('express')
const moment = require('moment');
const Sequelize = require('sequelize')
const reviewRouter = express.Router()
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

reviewRouter.get('/:id', async function (req, res) {
    const { id } = req.params
    const { tableName } = req.body
    const table = tableName === 'Event' ?
        'Show_Review' :
        tableName + '_Review'

    const Reviews = await sequelize
        .query(
            `SELECT * FROM ${table}
            WHERE ${table}.review${tableName}ID = ${id}`
        )
    res.send(Reviews[0])
})


reviewRouter.post('/creator', async function (req, res) {
    const {
        header,
        text,
        reviewUserID,
        reviewCreatorID,
        time,
        parentReview
    } = req.body
    try {
        await sequelize
            .query(
                `INSERT INTO Creator_Reviews VALUES(
                                         null,
                                        '${header}',
                                        '${text}',
                                        '${reviewUserID}',
                                        '${reviewCreatorID}',
                                        '${moment(time)}',
                                         ${parentReview}
                                    )`
            )

        const isReviewSaved = await sequelize
            .query(
                `SELECT * FROM Creator_Reviews
                WHERE Creator_Reviews.id = LAST_INSERT_ID()`
            )
        res.send(isReviewSaved[0][0])
    }
    catch (err) {
        res.send('saving error')
    }
})

reviewRouter.post('/show', async function (req, res) {
    const {
        header,
        text,
        reviewUserID,
        reviewShowID,
        reviewTime,
        reviewParentID,
        reviewEventID
    } = req.body
    try {
        await sequelize
            .query(
                `INSERT INTO Show_Review VALUES(
                                         null,
                                        '${header}',
                                        '${text}',
                                         ${reviewUserID},
                                         ${reviewShowID},
                                        '${reviewTime}',
                                        ${reviewParentID},
                                        ${reviewEventID}
                                    )`
            )
        const isReviewSaved = await sequelize
            .query(
                `SELECT * FROM Show_Reviews
                WHERE Show_Review.id = LAST_INSERT_ID()`
            )
        res.send(isReviewSaved[0][0])
    }
    catch (err) {
        res.send('saving error')
    }
})

reviewRouter.delete('/:id', async function (req, res) {
    const { id } = req.params
    const { table } = req.body
    try{
        await sequelize
        .query(
            `DELETE FROM ${table}
            WHERE id = '${id}'`
        )
    res.send(id)
        }
        catch(err){
            res.send('delete err')
        }
})

module.exports = reviewRouter


