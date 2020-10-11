"use strict"

const mongo = require("mongodb").MongoClient;
const dsn = "mongodb://localhost:27017/chatMessages";
const express = require('express');
const app = express();
const port = 8300;
const cors = require('cors');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.origins(['https://react.bjos19.me:443']);
// io.origins(['http://localhost:3000']);

app.use(cors());

app.get("/list", async (request, response) => {
    try {
        let res = await findInCollection(dsn, "savedMessages", {}, {}, 0);

        // console.log(res);
        response.json(res);
    } catch (err) {
        console.log(err);
        response.json(err);
    }
});

function applyZeros(date) {
    if (date <= 9) {
        return "0" + date;
    }
    return date;
};

function formatedDate() {
    let date = new Date();
    let formatedDate =  applyZeros(date.getDate()) + "/" +
                        applyZeros(date.getMonth() + 1) + " " +
                        applyZeros(date.getHours()) + ":" +
                        applyZeros(date.getMinutes());

    return formatedDate;
};


/**
 * Insert message to database.
 *
 * @async
 *
 * @param {string} dsn     DSN to connect to database.
 * @param {string} colName Name of collection.
 * @param {string} doc     Documents to be inserted into collection.
 *
 * @throws Error when database operation fails.
 *
 * @return {Promise<void>} Void.
 */
async function insertMessage(dsn, colName, doc) {
    const client  = await mongo.connect(dsn, { useUnifiedTopology: true });
    const db = await client.db();
    const col = await db.collection(colName);

    await col.insertMany(doc);

    await client.close();
};


/**
 * Find documents in an collection by matching search criteria.
 *
 * @async
 *
 * @param {string} dsn        DSN to connect to database.
 * @param {string} colName    Name of collection.
 * @param {object} criteria   Search criteria.
 * @param {object} projection What to project in results.
 * @param {number} limit      Limit the number of documents to retrieve.
 *
 * @throws Error when database operation fails.
 *
 * @return {Promise<array>} The resultset as an array.
 */
async function findInCollection(dsn, colName, criteria, projection, limit) {
    const client  = await mongo.connect(dsn, { useUnifiedTopology: true });
    const db = await client.db();
    const col = await db.collection(colName);
    const res = await col.find(criteria, projection).limit(limit).toArray();
    // console.log(res);
    await client.close();

    return res;
};


io.on('connection', function (socket) {
    console.info("User connected");
    socket.on('chat message', function (message) {
        let messages = {};

        messages = {
            time: formatedDate(),
            msg: message.message,
            user: message.user
        };

        insertMessage(dsn, "savedMessages", [messages]);
        console.log(messages);
        io.emit('chat message', messages);
    });
});

server.listen(port, () => {
    console.log(`Server listening on ${port}`);
    console.log(`DSN is: ${dsn}`);
});
