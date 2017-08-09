let TelegramBot = require('node-telegram-bot-api');
let token = '430043343:AAFMmGRtyNMiFRdZN6Iy1rhNzz7UZpLMSh4';
let mysql = require('mysql');
let bot = new TelegramBot(token, {polling: true});
let chat, mainEntry = [], fillings = [], pizzerias = [], bucketList = [], order = [], address, telephone, bill = 0,
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

bot.on('callback_query', function (msg) {
    if (fillings.includes(msg.data)) {
        saveToBucket(msg.data)
    } else if (pizzerias.includes(msg.data)) {
        mainChoise(msg);
        selectedPizzeria = pizzerias.indexOf(msg.data) + 1;
    } else if (msg.data === 'Да') {
        enterAddress(msg);
        getTelephone(msg);
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
                if (pizzerias.includes(res2[i][col1]) || res2[i]['pizzeria_id'] === selectedPizzeria) {
                    if (col2) {
                        entry = [{
                            text: `${res2[i][col1]} - ${res2[i][col2]} грн`,
                            callback_data: `${res2[i][col1]} -  ${res2[i][col2]}`
                        }];
                        fillings.push(`${res2[i][col1]} -  ${res2[i][col2]}`);
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
// choosing

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
    getInfo("SELECT * FROM pizzeria", 'name').then(function () {
        createButtons(mainEntry, msg, 'Выберите пиццу');
    })
};

let createPizza = (msg) => {
    getInfo("SELECT * FROM filter", 'filter', 'cost').then(function () {
        createButtons(mainEntry, msg, 'Выберите начинку');
        saveButton(msg);
    });
};

let choosePizza = (msg) => {
    getInfo("SELECT * FROM pizza", 'pizza_name', 'cost').then(function () {
        createButtons(mainEntry, msg, 'Выберите пиццу');
        saveButton(msg);
    });
};

///

let enterAddress = (msg) => {
    chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
    bot.sendMessage(chat, 'Введите адресс').then(function () {
    }).then(ans => {
        bot.on('message', (msg) => {
            address = msg.text;
            console.log(address);
            bot.sendMessage(chat, 'Введите телефон').then(function () {
            }).then(ans => {
                bot.on('message', (msg) => {
                    telephone = msg.text;
                    console.log(telephone);
                    saveToBd(msg);
                    bot.sendMessage(msg.from.id, 'Ваш заказ принят');
                    bucketList.length = 0;
                });
                console.log(msg);
            });
        })
    })
};

let getTelephone = (msg) => {
    bot.sendMessage(chat, 'Введите телефон').then(function () {
    }).then(ans => {
        bot.on('message', (msg) => {
            telephone = msg.text;
            console.log(telephone);
            saveToBd(msg);
            bot.sendMessage(msg.from.id, 'Ваш заказ принят');
            bucketList.length = 0;
        });

    });
};

let showBucket = (msg) => {
    let buttons = [];
    for (let i = 0; i <= bucketList.length - 1; i++) {
        let entry = [{
            text: `${bucketList[i]}`,
            callback_data: `${bucketList[i]}`
        }];
        buttons.push(entry);
    }
    createButtons(buttons, msg, 'Ваша корзина');
    formBill(msg);
    saveButton(msg);
};

// work with bill

let formBill = (msg) => {
    getTotalAmount();
    getOrderInfo();
    bot.sendMessage(msg.from.id, `Ваш заказ ${bill}`)
};

let getTotalAmount = () => {
    for (let i = 0; i <= bucketList.length - 1; i++) {
        bill += parseInt(bucketList[i].split(' - ')[1]);
    }
    console.log('bill ' + bill);
};
let getOrderInfo = () => {
    for (let i = 0; i <= bucketList.length - 1; i++) {
        order.push(bucketList[i].split(' - ')[0]);
    }
    console.log('order ' + order);
    console.log('bucketList ' + bucketList);

};

// Save to BD

let saveToBd = (msg) => {
    formBill(msg);
    let sql = `INSERT INTO orders (first_name, last_name, list, address, phone, pizzeria_id, amount) VALUES (
        '${msg.from.first_name}',
        '${msg.from.last_name}',
        '${order}', '${address}', '${telephone}' , '${selectedPizzeria}', '${bill}')`;
    console.log(sql);
    con.query(sql, function (err) {
        if (err) throw err;
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

let saveToBucket = (order) => {
    bucketList.push(order);
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
