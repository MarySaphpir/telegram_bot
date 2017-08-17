class BucketLogic {
    constructor() {
        this.order = [];
        this.bucketList = [];
        this.bill = 0;
    }

   showBucket = (msg, bot) => {
        this.bot = bot;
        let buttons = [];
        for (let i = 0; i <= this.bucketList.length - 1; i++) {
            let entry = [{
                text: `${this.bucketList[i]}`,
                callback_data: `${this.bucketList[i]}`
            }];
            buttons.push(entry);
        }
        buttons.create(buttons, msg, 'Ваша корзина', this.bot);
        this.formBill(msg, bot);
        buttons.saveButton(msg);
    };

// work with bill

    formBill = (msg, bot) => {
        this.getTotalAmount();
        this.getOrderInfo();
        bot.sendMessage(msg.from.id, `Ваш заказ ${this.bill}`)
    };

    getTotalAmount = () => {
        for (let i = 0; i <= this.bucketList.length - 1; i++) {
            this.bill += parseInt(this.bucketList[i].split(' - ')[1]);
            console.log('bill ' + this.bill);
        }
    };
    getOrderInfo = () => {
        for (let i = 0; i <= this.bucketList.length - 1; i++) {
            this.order.push(this.bucketList[i].split(' - ')[0]);
        }
        console.log('order ' + this.order);
        console.log('bucketList ' + this.bucketList);
    };


    saveToBd = (msg, telephone, address, selectedPizzeria, con, bot) => {
        this.formBill(msg, bot);
        let sql = `INSERT INTO orders (first_name, last_name, list, address, phone, pizzeria_id, amount) VALUES (
        '${msg.from.first_name}',
        '${msg.from.last_name}',
        '${this.order}', '${address}', '${telephone}' , '${selectedPizzeria}', '${this.bill}')`;
        console.log(sql);
        con.query(sql, function (err) {
            if (err) throw err;
        });
    };

    saveToBucket = (order) => {
        this.bucketList.push(order);
    };
}

let bucket;
export default bucket = new BucketLogic();