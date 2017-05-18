'use strict';

var _defaults = require('lodash/defaults');
var _isPlainObject = require('lodash/isPlainObject');

var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
var DEFAULT_CONFIG = {
    id: false,
    versionKey: false
};

/**
 *
 * @private
 * @param   {Object}    base_configuration
 * @param   {Object}    [columns]
 * @returns {Schema}
 */
function createMongooseSchema(base_configuration, columns) {
    var has_columns = _isPlainObject(columns);
    var schema_configuration = _defaults(
        {},
        base_configuration.strict !== 'boolean' && {
            strict: has_columns && !!Object.keys(columns).length
        },
        base_configuration
    );

    return Schema(
        has_columns ?
            columns :
            {},
        schema_configuration
    );
}

/**
 *
 * @param {Application} app
 * @param {Function}    MongooseSchema
 */
exports.schema = function MongooseSchema(app, MongooseSchema) {
    MongooseSchema.schema = 'mongoose';

    /**
     * @callback MongooseConnectionCreator
     *
     * @param   {Mongoose}  mongoose
     * @returns {Mongoose|Connection}
     */

    /**
     * @typedef {Object} MongooseConnectionConfig   {@link http://mongoosejs.com/docs/connections.html#options}
     */

    /**
     *
     * @param   {MongooseConnectionCreator|MongooseConnectionConfig|string} config
     * @returns {Mongoose|Connection}
     */
    MongooseSchema.driver = function(config) {
        if (typeof config === 'function') {
            return config.call(this, Mongoose);
        }

        return typeof config === 'string' ?
            Mongoose.createConnection(config) :
            Mongoose.createConnection(config.uri, config.options, config.callback);
    };

    /**
     *
     * @returns {Schema}
     */
    MongooseSchema.prototype.schema = function() {
        return this._schema;
    };

    /**
     *
     * @returns {?Model}
     */
    MongooseSchema.prototype.model = function() {
        return this._model;
    };

    /**
     *
     * @param {Object}  model_config
     */
    MongooseSchema.prototype.initialize = function(model_config) {
        var collection = model_config.collection;
        var name = model_config.name;
        var columns = model_config.columns;
        var config = model_config.config;

        this._schema = createMongooseSchema(
            _defaults(
                { collection: collection },
                config,
                DEFAULT_CONFIG
            ),
            columns
        );
        this._model = null;

        this.collection = collection;
        this.name = name || collection;
        this.statics = this._schema.statics = {};
        this.methods = this._schema.methods = {};
    };

    /**
     *
     * @returns {Model}
     */
    MongooseSchema.prototype.compile = function() {
        this._model = this._driver.model(this.name, this._schema);

        return this._model;
    };
};
