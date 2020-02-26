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
const PORT = process.env.PORT;
app.use(morgan('dev'));
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

//API ROUTES

//todo route
app.get('/api/todos', async(req, res) => {
    try {
        const result = await client.query(`
        
        `)
        
        res.json(result.rows);
        
    }
})


