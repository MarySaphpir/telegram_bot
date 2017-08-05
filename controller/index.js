let TelegramBot = require('node-telegram-bot-api');
let token = '';
let mysql = require('mysql');
let bot = new TelegramBot(token, {polling: true});
let chat, mainEntry = [], fillings = [], pizzerias = [], bucketList = [];

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "cfvgbh",
    database: "pizzeria"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");

});

bot.onText(/\/выбратьпиццерию/, function (msg) {
    choosePizzeria(msg);
});

bot.on('callback_query', function (msg) {
    if (fillings.includes(msg.data)) {
        saveToBucket('fillings', msg.data)
    } else if(pizzerias.includes(msg.data)) {

        createPizza(msg);
    }
});

//Work with bd

let getInfo = (sql, col1, col2) => {
    return new Promise(function (resolve, reject) {
        con.query(sql, function (err, result) {
            if (err) throw err;
            let res = JSON.stringify(result);
            let res2 = JSON.parse(res);
            for (let i = 0; i < res2.length; i++) {
                let entry = [];
                    if (col2) {
                        entry = [{text: `${res2[i][col1]} ${res2[i][col2]}`, callback_data:`${res2[i][col1]} ${res2[i][col2]}` }];
                        fillings.push(`${res2[i][col1]} ${res2[i][col2]}`);}
                    else {
                        entry = [{text: `${res2[i][col1]}`, callback_data:`${res2[i][col1]}` }];
                        pizzerias.push(`${res2[i][col1]}`);
                    }
                mainEntry.push(entry);
            }
            if (err) {
                return reject(err);
            }
            resolve(mainEntry);
        });
        mainEntry.length = 0;

    })
};

let choosePizzeria = (msg) =>{
    getInfo("SELECT * FROM pizzeria", 'name').then(function (result) {
        createButtons(mainEntry, msg);
    });
};

let createPizza = (msg) => {
    getInfo("SELECT * FROM filter", 'filter', 'cost').then(function (result) {
        createButtons(mainEntry, msg);
    });
};

// Save to bucket

let saveToBucket = (title, order) => {
    let list = {
        title: title,
        order: order
    };
    bucketList.push(list);
    console.log(bucketList);
};

// Create buttons => move to another file? //

let createButtons = (entry2, msg) => {
    let createdButtons = {
        title: 'Выберите начинку',
        buttons: []
    };
    let text = createdButtons.title;
    let options = {
        reply_markup: JSON.stringify({
            inline_keyboard: entry2,
            parse_mode: 'Markdown',
        })
    };
    chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
    bot.sendMessage(chat, text, options);
};
