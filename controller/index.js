let TelegramBot = require('node-telegram-bot-api');
let token = '430043343:AAFMmGRtyNMiFRdZN6Iy1rhNzz7UZpLMSh4';
let mysql = require('mysql');
let bot = new TelegramBot(token, {polling: true});
let chat, mainEntry = [], fillings = [], pizzerias = [], bucketList = [], address, telephone;

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
    chat = msg;
});

bot.onText(/\/адресс (.+)/, function (msg, match) {
    let resp = match[1];
    saveToBucket('address', resp);
    bot.sendMessage(chat, 'введите телефон')
});

bot.onText(/\/телефон (.+)/, function (msg, match) {
    telephone = msg.data;
    // console.log(msg);
    saveToBd(msg);
});

bot.on('callback_query', function (msg) {
    if (fillings.includes(msg.data)) {
        saveToBucket('fillings', msg.data)
    } else if (pizzerias.includes(msg.data)) {
        createPizza(msg);
    } else if (msg.data == 'Да') {
        // saveToBd(msg);
        enterAddress(msg);
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
                    entry = [{
                        text: `${res2[i][col1]} ${res2[i][col2]}`,
                        callback_data: `${res2[i][col1]} ${res2[i][col2]}`
                    }];
                    fillings.push(`${res2[i][col1]} ${res2[i][col2]}`);
                }
                else {
                    entry = [{text: `${res2[i][col1]}`, callback_data: `${res2[i][col1]}`}];
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

let choosePizzeria = (msg) => {
    getInfo("SELECT * FROM pizzeria", 'name').then(function (result) {
        createButtons(mainEntry, msg);
    });
};

let createPizza = (msg) => {
    getInfo("SELECT * FROM filter", 'filter', 'cost').then(function (result) {
        createButtons(mainEntry, msg);
        saveButton(msg);

    });
};

let enterAddress = (msg) => {
    chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
    bot.sendMessage(chat, 'введите адресс').then(function (result) {
        address = msg.data;
    })
};

// Save to BD

let saveToBd = (msg) => {
    console.log(msg);
    let sql = `INSERT INTO orders (first_name, last_name, list, address, phone) VALUES (
        '${msg.from.first_name}',
        '${msg.from.last_name}',
        '${bucketList}', 'Company Inc', '0509049587')`;
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });
};


let saveButton = (msg) => {
    let text = 'Далее?';
    let options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [[{text: 'Да', callback_data: 'Да'}]],
            parse_mode: 'Markdown',
        })
    };
    chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
    bot.sendMessage(chat, text, options);

};

// Save to bucket

let saveToBucket = (title, order) => {
    let list = [{
        title: title,
        order: order
    }];
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
