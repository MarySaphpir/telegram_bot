class BucketLogic {
    constructor() {
        this.order = [];
        this.bucketList = [];
        this.bill = 0;
    }

    showBucket(msg, bot){
        let buttons = [];
        for (let i = 0; i <= this.bucketList.length - 1; i++) {
            let entry = [{
                text: `${this.bucketList[i]}`,
                callback_data: `${this.bucketList[i]}`
            }];
            buttons.push(entry);
        }
        // console.log(msg.from.id);
        this.createButtons(buttons, msg, 'Ваша корзина', bot);
        setTimeout(function () {
            let options = {
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{text: 'Да', callback_data: 'Да'}]
                    ],
                    parse_mode: 'Markdown',
                })
            };
            // chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
            bot.sendMessage(msg.from.id, 'Далее?', options);
        }, 1000)
    };

// work with bill

    formBill(msg, bot) {
        this.getTotalAmount();
        this.getOrderInfo();
        bot.sendMessage(msg.from.id, `Ваш заказ ${this.order} на сумму ${this.bill} грн`);

    };

    getTotalAmount(){
        for (let i = 0; i <= this.bucketList.length - 1; i++) {
            this.bill += parseInt(this.bucketList[i].split(' - ')[1]);
            console.log('bill ' + this.bill);
        }
    };
    getOrderInfo() {
        for (let i = 0; i <= this.bucketList.length - 1; i++) {
            this.order.push(this.bucketList[i].split(' - ')[0]);
        }
        console.log('order ' + this.order);
        console.log('bucketList ' + this.bucketList);
    };


    saveToBd (msg, telephone, address, selectedPizzeria, con, bot) {
        this.formBill(msg, bot);
        let sql = `INSERT INTO orders (first_name, last_name, list, address, phone, pizzeria_id, amount) VALUES (
        '${msg.from.first_name}',
        '${msg.from.last_name}',
        '${this.order}', '${address}', '${telephone}' , '${selectedPizzeria}', '${this.bill}')`;
        console.log(sql);
        con.query(sql, function (err) {
            if (err) throw err;
        });
        this.bucketList.length = 0;
        this.order.length = 0;
        this.bill = 0;
    };

    saveToBucket(order) {
        this.bucketList.push(order);
    };

    createButtons(entry2, msg, title, bot) {
        let options = {
            reply_markup: JSON.stringify({
                inline_keyboard: entry2,
                parse_mode: 'Markdown',
            })
        };
        bot.sendMessage(msg.from.id, title, options);
    };

    saveButton(msg, bot) {
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
        // chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
        bot.sendMessage(msg.from.id, text, options);
    };
}
module.exports = new BucketLogic();