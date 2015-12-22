'use strict';

var mongoose = require('mongoose'),
    defaults = require('lodash/object/defaults'),
    isPlainObject = require('lodash/lang/isPlainObject'),

    DEFAULT_CONFIG = {
        id: false,
        versionKey: false
    };

exports.mongoose = mongoose;
exports.schema = function MongooseSchema(app, MongooseSchema) {
    var _initialize_schema = function() {
        var has_columns = isPlainObject(this._columns);

        if(typeof this._schema_config.strict !== 'boolean') {
            this._schema_config.strict = has_columns && !!Object.keys(this._columns).length;
        }

        this._schema = this._driver.Schema(has_columns? this._columns : {}, this._schema_config);
    };

    MongooseSchema.schema = 'mongoose';
    MongooseSchema.driver = function(config) {
        if(typeof config === 'function') {
            return config.call(this, mongoose);
        }

        if(typeof config === 'string') {
            mongoose.connect(config);
        } else {
            mongoose.connect(config.uri, config.options, config.callback);
        }

        return mongoose;
    };

    MongooseSchema.fn.mongoose = function() {
        return this._driver;
    };
    MongooseSchema.fn.schema = function() {
        return this._schema;
    };
    MongooseSchema.fn.model = function() {
        return this._model;
    };

    MongooseSchema.fn.initialize = function(model_config) {
        this.collection = model_config.collection;

        this._columns = model_config.columns;
        this._schema_config = defaults(model_config.config || {}, DEFAULT_CONFIG);
        this._schema_config.collection = this.collection;

        _initialize_schema.call(this);
        this.statics = this._schema.statics = {};
        this.methods = this._schema.methods = {};
    };
    MongooseSchema.fn.compile = function() {
        return this._model = this._driver.model(this.collection, this._schema);
    };
};
