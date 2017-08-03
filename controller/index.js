import token from '../config/config.js'

var TelegramBot = require('node-telegram-bot-api');
// var token = require('./config/config.js')

var bot = new TelegramBot(token, {
    polling: true
});
var pizza_okey = "Окей",
    pizza_bambolina = 'Бамболіна',
    pizza_manhattan = "Manhattan";

var pizza_okey_one = "Фірменна - 50грн",
    pizza_okey_two = "Подвійний сир - 70грн",
    pizza_bambolina_one = "Фірменна - 50грн",
    pizza_bambolina_two = "Подвійний сир - 70грн",      
    pizza_manhattan_one = "Фірменна - 50грн",
    pizza_manhattan_two = "Подвійний сир - 70грн"

// Choice pizzeria
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Привіт, ви бачите список піцерій,клікніть на будь-яку з них, де хочете замовити піцу ", {
        "reply_markup": {
            "keyboard": [
                ["Окей"],
                ["Бамболіна"],
                ["Manhattan"]
            ]
        }
    });
});
// Choice pizza
bot.on('message', (msg) => {
    if (msg.text.indexOf(pizza_okey) === 0) {
        bot.sendMessage(msg.chat.id, "Ви бачите назву піци та її ціну. Виберіть піццу:", {
            "reply_markup": {
                "keyboard": [
                    ["Фірменна - 50грн"],
                    ["Подвійний сир - 70грн"]
                ]
            }
        });
    }

    if (msg.text.indexOf(pizza_bambolina) === 0) {
        bot.sendMessage(msg.chat.id, "Ви бачите назву піци та її ціну. Виберіть піццу:", {
            "reply_markup": {
                "keyboard": [
                    ["Фірменна - 50грн"],
                    ["Подвійний сир - 70грн"]
                ]
            }
        });
    }

    if (msg.text.indexOf(pizza_manhattan) === 0) {
        bot.sendMessage(msg.chat.id, "Ви бачите назву піци та її ціну. Виберіть піццу:", {
            "reply_markup": {
                "keyboard": [
                    ["Фірменна - 50грн"],
                    ["Подвійний сир - 70грн"]
                ]
            }
        });
    }
   
});
 //choice count pizza
bot.on("message",(msg) =>{
    if (msg.text.indexOf(pizza_okey_one) === 0 || msg.text.indexOf(pizza_okey_two) === 0 || 
        msg.text.indexOf(pizza_bambolina_one) === 0 || msg.text.indexOf(pizza_bambolina_two) )  {
        bot.sendMessage(msg.chat.id, "Виберіть кількість піц:", {
            "reply_markup": {
                "keyboard": [
                    ["1"],
                    ["2"],
                    ["3"],
                ]
            }
        });
        }
})
   