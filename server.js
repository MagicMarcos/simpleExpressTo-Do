const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config({ path: './config/.env' });
// url stored in .env
const url = process.env.url;

// intentional use of var, for scoping
var db, collection;

const dbName = 'todo';

app.listen(5000, () => {
	MongoClient.connect(
		url,
		{ useNewUrlParser: true, useUnifiedTopology: true },
		(error, client) => {
			if (error) {
				throw error;
			}
			db = client.db(dbName);
			console.log('Connected to `' + dbName + '`!');
		}
	);
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
	db.collection('todo')
		.find()
		.toArray((err, result) => {
			if (err) return console.log(err);

			res.render('index.ejs', { todos: result });
		});
});

app.post('/todo', (req, res) => {
	db.collection('todo').insertOne(
		{
			todo: req.body.todo,
			status: 'incomplete',
		},
		(err, result) => {
			if (err) return console.log(err);
			console.log('saved to database');
			res.redirect('/');
		}
	);
});

app.put('/upVote', (req, res) => {
	console.log(req.body.todo);
	db.collection('todo').findOneAndUpdate(
		{ todo: req.body.todo },
		{
			$set: {
				status: 'complete',
			},
		},
		{
			sort: { _id: -1 },
		},
		(err, result) => {
			if (err) return res.send(err);

			res.send(result);
		}
	);
});

app.put('/downVote', (req, res) => {
	req.body.todo;
	db.collection('todo').findOneAndUpdate(
		{ todo: req.body.todo, status: req.body.status },
		{
			$set: {
				status: 'incomplete',
			},
		},
		{
			sort: { _id: -1 },
		},
		(err, result) => {
			if (err) return res.send(err);
			res.send(result);
		}
	);
});

app.delete('/delete', (req, res) => {
	db.collection('todo').findOneAndDelete(
		{ todo: req.body.todo },
		(err, result) => {
			if (err) return res.send(500, err);
			res.send('Message deleted!');
		}
	);
});

app.delete('/deleteAll', (req, res) => {
	db.collection('todo').deleteMany({}, (err, result) => {
		if (err) return res.send(500, err);
		res.send('Message deleted!');
	});
});

app.delete('/deleteCompleted', (req, res) => {
	db.collection('todo').deleteMany({ status: 'complete' }, (err, result) => {
		if (err) return res.send(500, err);
		res.send('Message deleted!');
	});
});
