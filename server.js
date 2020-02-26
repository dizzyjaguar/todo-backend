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
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.json());
// everything that starts with "/api" below here requires an auth token!


// Auth Routes
const createAuthRoutes = require('./lib/auth/create-auth-routes');

const authRoutes = createAuthRoutes({
    selectUser(email) {
        return client.query(`
        SELECT id, email, hash 
        FROM users
        WHERE email = $1;
        `,
        [email]
        ).then(result => result.rows[0]);
    },
    insertUser(user, hash) {
        return client.query(`
        INSERT into users (email, hash)
        VALUES ($1, $2)
        RETURNING id, email;
        `,
        [user.email, hash]
        ).then(result => result.rows[0]);
    }
});

// before ensure auth, but after other middleware:
app.use('/api/auth', authRoutes);

const ensureAuth = require('./lib/auth/ensure-auth');
app.use('/api', ensureAuth);












//API ROUTES

// route to GET all todos
app.get('/api/todos', async(req, res) => {
    try {
        const result = await client.query(`
        SELECT * 
        FROM todos WHERE user_id=$1;
        `,
        [req.userId]
        );
        
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

// route to update (PUT) the todo from complete or incomplete
app.put('/api/todos/:id', async (req, res) => {
    console.log(req.body, '|||||||');
    try {
        const result = await client.query(`
        UPDATE todos
        SET complete=$1
        WHERE id = ${req.params.id}
        returning *;
        `,
        [req.body.complete]
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

// route to delete a todo
app.delete('/api/todos/:id', async(req, res) => {
    try {
        const result = await client.query(`
        DELETE FROM todos where id = ${req.params.id}
        `);

        res.json(result.rows);
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
