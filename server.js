//Load Env Vars from .env file
require('dotenv').config();

//App dependecies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const client = require('./lib/client');

//Init the database connection
client.connect();

//App setup
const app = express();
const port = process.env.PORT || 3000;
app.use(morgan('dev'));
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

//API ROUTES

// route to GET all todos
app.get('/api/todos', async(req, res) => {
    try {
        const result = await client.query(`
        SELECT * 
        FROM todos;
        `);
        
        res.json(result.rows);        
    }
    catch(err) {
        console.log(err);
        res.status(500).json({
            error:err.message || err
        });
    }
});

// route to POST a new todo
app.post('/api/todos', async(req, res) => {
    try {
        const result = await client.query(`
        INSERT INTO todos (task, complete)
        VALUES ($1, false)
        RETURNING *;
        `,
        [req.body.task]
        );

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});







// start server
app.listen(port, () => {
    console.log('the server is running :D on PORT', port);
});

module.exports = {
    app: app,
};
