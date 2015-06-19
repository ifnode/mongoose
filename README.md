#ifnode-auth
Mongoose plugin for ifnode


# Usage
Install module:

`npm install ifnode-mongoose --save`

Set database config:

    config/local.js
    
    module.exports = {
        ...
        db: {
            my_mongo_database: {
                schema: 'mongoose',
                config: config: String|Object|Function
            }
        }
        ...
    };
    
    config: String                  Mongo connection uri. Check here: http://docs.mongodb.org/manual/reference/connection-string/
    config: Object                  Mongoose connect params. Check here: http://mongoosejs.com/docs/connections.html#options
            .uri                    First argument of mongoose.connect(uri, options)
            .options                Second argument of mongoose.connect(uri, options);
    config: Function                Possibility to set custom configuration

Example

    config/local.js
    
    module.exports = {
        db: {
            string_config: {
                schema: 'mongoose',
                config: 'mongodb://localhost/blog'
            },
            object_config: {
                schema: 'mongoose',
                config: {
                    uri: 'mongodb://localhost:27018/blog',
                    options: {
                        user: 'root',
                        pass: '123',
                        server: { poolSize: 10 }
                    }
                }
            },
            function_config: {
                schema: 'mongoose',
                config: function(mongoose) {
                    mongoose.connect('mongodb://localhost:27019/blog');
                    
                    return mongoose;
                }
            }
        }
    };


Create model (users, for example):

    users.js
    
    var app = require('ifnode')(),
        users_model = app.Model(schema, options);
        
schema:

    .collection                 Name of collection
    .columns                    Mongoose Schema columns. Rules for create check here: http://mongoosejs.com/docs/guide.html#definition
    .config                     Mongoose Schema options. List check here: http://mongoosejs.com/docs/guide.html#options

options

    .db                         Which of database configuration need use (from app.config.db) [optional] Default: first in app.config.db or default
    .alias                      Model`s alias (in app.models) [optional]
    
    
Model instance properties:

    .methods                    Analog of http://mongoosejs.com/docs/guide.html#methods
    .statics                    Analog of http://mongoosejs.com/docs/guide.html#statics
    
    .mongoose()                 Return original mongoose module
    .schema()                   Return mongoose schema instance (result of new mongoose.Schema(...))
    .model()                    Return mongoose model instance (result of mongoose.model(...))

Statics properties of module:

    .mongoose                   Return original mongoose module


# Examples

Return original mongoose 

    var ifnode_mongoose = require('ifnode-mongoose'),
        mongoose = ifnode_mongoose.mongoose;
       
Create static method:

    var app = require('ifnode')(),
        users_model = app.Model({ collection: 'users' });
    
    users_model.statics.get_all = function(callback) {
        this.find(callback);
    };

Get original schema and model

    var app = require('ifnode')(),
        users_model = app.Model({ collection: 'users' }),
        
        original_users_schema = users_model.schema(),
        original_users_model = users_model.model();
        
    original_users_model.schema.path('name').validate(function(name) {
        return /[0-9]/i.test(name);
    }, 'Invalid name');


# Run server

    var ifnode = require('ifnode'),
        app = ifnode();
    
    app.register('ifnode-mongoose');
    app.run();
