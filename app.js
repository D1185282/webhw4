var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

// 確保表格存在
db.run('CREATE TABLE IF NOT EXISTS CPUPRICE (id INTEGER PRIMARY KEY AUTOINCREMENT, brand TEXT NOT NULL, item_name TEXT NOT NULL, incdate TEXT NOT NULL, price INTEGER DEFAULT 0)');

// 將 /api 路由添加到 app.js 中
app.post('/api/query', (req, res) => {
    let brand = req.body.brand;
    let item_name = req.body.item_name;
    let incdate = req.body.incdate;
    let price = req.body.price;
    let showAll = req.body.showAll;

    let sql = 'SELECT * FROM CPUPRICE WHERE 1=1';
    let params = [];

    if (showAll === '是') {
        // 如果選擇顯示全部，不加任何條件
    } else {
        if (brand) {
            sql += ' AND brand = ?';
            params.push(brand);
        }

        if (item_name) {
            sql += ' AND item_name = ?';
            params.push(item_name);
        }

        if (incdate) {
            sql += ' AND incdate = ?';
            params.push(incdate);
        }

        if (price) {
            sql += ' AND price = ?';
            params.push(price);
        }
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send(rows);
    });
});


module.exports = app;

