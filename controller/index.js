let TelegramBot = require('node-telegram-bot-api');
let token = '430043343:AAFMmGRtyNMiFRdZN6Iy1rhNzz7UZpLMSh4';
let mysql = require('mysql');
let bot = new TelegramBot(token, {polling: true});
let chat, mainEntry = [], fillings = [], pizzerias = [], bucketList = [], address, telephone, bill = 0,
    selectedPizzeria;

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
    address = match[1];
    saveToBucket('address', resp);
    bot.sendMessage(chat, 'введите телефон')
});

bot.onText(/\/телефон (.+)/, function (msg, match) {
    let resp = match[1];
    telephone = resp;
    saveToBd(msg);
    bot.sendMessage(msg.from.id, 'Ваш заказ принят')
});

bot.on('callback_query', function (msg) {
    if (fillings.includes(msg.data)) {
        saveToBucket('fillings', msg.data)
    } else if (pizzerias.includes(msg.data)) {
        mainChoise(msg);
        selectedPizzeria = pizzerias.indexOf(msg.data) + 1;
    } else if (msg.data === 'Да') {
        enterAddress(msg);
    } else if (msg.data === 'Посмотреть заказ') {
        showBucket(msg);
    } else if (msg.data === 'Готовую') {
        choosePizza(msg);
    } else if (msg.data === 'Собрать свою') {
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
                if ( pizzerias.includes(res2[i][col1]) || res2[i]['pizzeria_id'] === selectedPizzeria) {
                    console.log('e');
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
                }
                mainEntry.push(entry);
                if (err) {
                    return reject(err);
                }
                resolve(mainEntry);
            }
        });
        mainEntry.length = 0;
    })
};

let mainChoise = (msg) => {
    let text = 'Готовую пиццу или собрать свою?';
    let options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Готовую', callback_data: 'Готовую'}],
                [{text: 'Собрать свою', callback_data: 'Собрать свою'}]
            ],
            parse_mode: 'Markdown',
        })
    };
    chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
    bot.sendMessage(chat, text, options);
};

let choosePizzeria = (msg) => {
    getInfo("SELECT * FROM pizzeria", 'name').then(function (result) {
        createButtons(mainEntry, msg, 'Выберите пиццу');
    }).then(

    )
};

let createPizza = (msg) => {
    getInfo("SELECT * FROM filter", 'filter', 'cost').then(function (result) {
        createButtons(mainEntry, msg, 'Выберите начинку');
        saveButton(msg);
    });
};

let choosePizza = (msg) => {
    getInfo("SELECT * FROM pizza", 'pizza_name', 'cost').then(function (result) {
        createButtons(mainEntry, msg, 'Выберите пиццу');
        saveButton(msg);
    });
};

let enterAddress = (msg) => {
    chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
    bot.sendMessage(chat, 'Введите адресс').then(function (result) {
        address = msg.data;
    })
};

let showBucket = (msg) => {
    let buttons = [];
    for (let i = 0; i <= bucketList.length - 1; i++) {
        let entry = [{
            text: `${bucketList[i].order}`,
            callback_data: `${bucketList[i].order}`
        }];
        buttons.push(entry);
    }
    // console.log(msg.from.id);
    createButtons(buttons, msg, 'Ваша корзина');
    formBill(msg);
    saveButton(msg);
};

let formBill = (msg) => {
    for (let i = 0; i <= bucketList.length - 1; i++) {

        bill += parseInt(bucketList[i].order.split(' ')[1]);
    }
    console.log(bill);
    bot.sendMessage(msg.from.id, `Ваш заказ ${bill}`)
};

// Save to BD

let saveToBd = (msg) => {
    let sql = `INSERT INTO orders (first_name, last_name, list, address, phone) VALUES (
        '${msg.from.first_name}',
        '${msg.from.last_name}',
        '${bucketList}', '${address}', '${telephone}')`;
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
            inline_keyboard: [
                [{text: 'Да', callback_data: 'Да'}],
                [{text: 'Посмотреть заказ', callback_data: 'Посмотреть заказ'}]
            ],
            parse_mode: 'Markdown',
        })
    };
    chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
    bot.sendMessage(chat, text, options);
};

// Save to bucket

let saveToBucket = (title, order) => {
    let list = {
        title: title,
        order: order
    };
    bucketList.push(list);
};

// Create buttons => move to another file? //

let createButtons = (entry2, msg, title) => {
    let options = {
        reply_markup: JSON.stringify({
            inline_keyboard: entry2,
            parse_mode: 'Markdown',
        })
    };
    chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
    bot.sendMessage(chat, title, options);
};
