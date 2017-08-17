'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    entry  : {
        logic: './controller/index.js',
        // buttons: './controller/buttons.js',
        // dbLogic: './controller/dbCore.js'
    },
    output : {
        path     : __dirname + '/controller',
        filename : '[name].js'
    },
    target: 'node',
    //
    // externals:
    //     [
    //         'process'
    //     ],
    module : {
        loaders: [ {
            test   : /.js$/,
            loader : 'babel-loader',
            query: {
                presets: ['es2015', 'es2015', 'stage-0']
            }
        }
        ]
    },

    node: {
        __dirname: false,
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
};
