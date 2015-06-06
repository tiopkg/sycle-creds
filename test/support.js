'use strict';

var chai = require('chai');
var sycle = require('sycle');
var authorizer = require('sycle-core').authorizer;
var async = require('async');
var _ = require('underscore');
chai.config.includeStack = true;

exports.t = exports.assert = chai.assert;

exports.donner = function donner(n, func) {
    if (n < 1) {
        return func();
    }
    return function (err) {
        if (err) {
            throw err;
        }
        if (--n < 1) {
            func(err ? err : null);
        }
    };
};

exports.sapp = function (options) {
    options = options || {};
    options.db = options.db || {
        driver: 'redis-hq'
    };

    var sapp = new sycle.Application();
    sapp.setAll(options);
    sapp.phase(sycle.boot.module('sycle-core'));
    sapp.phase(sycle.boot.module('./'));
    sapp.phase(sycle.boot.database(options.db));
    sapp.phase(authorizer);
    return sapp;
};

exports.cleanup = function (sappOrModels, done) {
    var models = sappOrModels;
    if (sappOrModels.models) {
        models = _.values(sappOrModels.models);
    } else if (!(Array.isArray(sappOrModels))) {
        models = [sappOrModels];
    }

    done = done || function () {
    };

    async.eachSeries(models, function (Model, callback) {
        Model.destroyAll(callback);
    }, done);
};