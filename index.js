'use strict';

var _ = require('lodash'),
    mongoose = require('mongoose'),

    DEFAULT_CONFIG = {
        id: false,
        versionKey: false,
        strict: true
    };

exports.mongoose = mongoose;
exports.schema = function MongooseSchema(app, MongooseSchema) {
    var _initialize_schema = function() {
        if(typeof this._schema_config.strict !== 'boolean') {
            this._schema_config.strict = DEFAULT_CONFIG.strict;
        }

        this._schema = this._driver.Schema(this._columns, this._schema_config);
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

        this._columns = model_config.columns || {};
        this._schema_config = _.defaults(model_config.config || {}, DEFAULT_CONFIG);

        _initialize_schema.call(this);
        this.statics = this._schema.statics = {};
        this.methods = this._schema.methods = {};
    };
    MongooseSchema.fn.compile = function() {
        return this._model = this._driver.model(this.collection, this._schema);
    };
};
