class Buttons{
    constructor(){
    }
    create(entry2, msg, title, bot) {
        this.bot = bot;
        let options = {
            reply_markup: JSON.stringify({
                inline_keyboard: entry2,
                parse_mode: 'Markdown',
            })
        };
        this.chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
        bot.sendMessage(this.chat, title, options);
    };

    saveButton(msg){
        let text = 'Далее?';
        let options = [
            [{text: 'Да', callback_data: 'Да'}],
            [{text: 'Посмотреть заказ', callback_data: 'Посмотреть заказ'}]
        ];
        this.create(options, msg, text, this.bot)
    };

}

let buttons;