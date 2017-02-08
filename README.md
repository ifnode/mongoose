# ifnode-mongoose

## Description

`ifnode-mongoose` is a schema plugin which is specified for `ifnode` and provide possibility to using `mongoose` in `ifnode` eco-system. Plugin does not around developer under some special features of `mongoose` and it more like proxy.

Each `ifnode` model (returned by `app.Model`) is a abstraction under `Mongoose.Schema` and `Mongoose.Model`. `ifnode-mongoose` get possibility to reuse any `mongoose` plugins, validation and all other features.

# Usage

## Install module:

```bash
npm install ifnode-mongoose --save
```

## API

### `ifnode` database connection config options

Name | Type | Description
---- | ---- | -----------
- | `string` | Mongo connection uri. Read more on [mongoose site](http://docs.mongodb.org/manual/reference/connection-string)
`config` | `Object: { uri, options }` | Mongoose connect params. Read more on [mongoose site](http://mongoosejs.com/docs/connections.html#options) (`uri` - first argument of `mongoose.connect(uri, options)`, `options` - second argument of `mongoose.connect(uri, options)`);
- | `function` | Adds possibility to create own connection. Useful for multiplied mongo connections

#### Database connection examples

##### By `string`

```javascript
module.exports = {
    db: {
        my_mongo_database: {
            schema: 'mongoose',
            config: 'mongodb://root:123@localhost:27017/db'
        }
    }
};
```

##### By `Object`

```javascript
module.exports = {
    db: {
        my_mongo_database: {
            schema: 'mongoose',
            config: {
                uri: 'mongodb://localhost:27017/db',
                options: {
                    user: 'root',
                    pass: '123'
                }
            }
        }
    }
};
```

##### By `function`

```javascript
module.exports = {
    db: {
        my_mongo_database: {
            schema: 'mongoose',
            config(Mongoose) {
                Mongoose.set('debug', true);
                Mongoose.Promise = Promise;
                
                return Mongoose.createConnection('mongodb://localhost:27017/db', {
                    user: 'root',
                    pass: '123'
                });
            }
        }
    }
};
```

##### Combined connections

```javascript
module.exports = {
    db: {
        connection1: {
            schema: 'mongoose',
            config: 'mongodb://root:123@localhost:27017/somedb1'
        },
        connection2: {
            schema: 'mongoose',
            config: {
                uri: 'mongodb://localhost:27017/somedb2',
                options: {
                    user: 'root',
                    pass: '123'
                }
            }
        },
        connection3: {
            schema: 'mongoose',
            config(Mongoose) {
                return Mongoose.createConnection('mongodb://localhost:27018/db', {
                    mongos: true
                });
            }
        }
    }
};
```

### Creating `ifnode` models options

```javascript
const app = require('ifnode')();
const UsersModel = app.Model(
    model_options,
    db_options
);
```

#### `model_options` (required)

Name | Optional | Description
---- | -------- | -----------
`collection` | `false` | Name of collection
`columns` | `true` | Mongoose Schema columns. Rules for create check [here](http://mongoosejs.com/docs/guide.html#definition)
`config` | `true` | Mongoose Schema options. List check [here](http://mongoosejs.com/docs/guide.html#options)

#### `db_options` (optional)

Name | Description
---- | -----------
`db` | Which of database configuration need use (from `app.config.db`). Default: first in `app.config.db`
`alias` | Model`s alias (in app.models)

### Model instance properties

#### Properties

Name | Description
---- | -----------
`.statics` | Link to [mongoose.statics](http://mongoosejs.com/docs/guide.html#statics)
`.methods` | Link to [mongoose.methods](http://mongoosejs.com/docs/guide.html#methods)

#### Methods

Name | Description
---- | -----------
`.schema()` | Return mongoose `Schema` (`new Mongoose.Schema`) instance (result of `new Mongoose.Schema`)
`.model()` | Return mongoose `Nodel` (result of `Mongoose.createConnection().Model`)

## Example of usage in project

### config

```javascript
// config/dev.js
module.exports = {
    db: {
        customers_db: {
            schema: 'mongoose',
            config: 'mongodb://localhost/customers'
        },
        events_db: {
            schema: 'mongoose',
            config: 'mongodb://localhost/events'
        }
    }
}
```

### models

```javascript
// customers.js

const app = require('ifnode')();
const CustomersModel = app.Model({
    collection: 'customers',
    config: {
        strict: false
    }
}, {
    db: 'customers_db',
    alias: 'UsersModel'
});
const originalCustomersModel = CustomersModel.model();

originalCustomersModel.schema.path('name').validate(
    name => /[0-9]/i.test(name),
    'Invalid name'
);

CustomersModel.statics.findByEmail = function(email) {
    return this.find({ email });
};
```

```javascript
// customers.js

const app = require('ifnode')();
const EventsModel = app.Model({
    collection: 'events',
    columns: {
        id: {
            type: String,
            index: true,
            unique: true
        },
        type: String
    }
}, {
    db: 'events_db'
});

EventsModel.statics.pushEvent = function(event) {
    return this.create(event);
};
```


```javascript
// app.js
const IFNode = require('ifnode');
const app = IFNode({
    environment: 'dev'
});

app.load();
app.models.UsersModel.findByEmail('test@email.com').then(users => {
    /* do smt */
});
app.models.events.pushEvent({
    type: 'logsmt'
});
```
