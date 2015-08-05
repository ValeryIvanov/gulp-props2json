'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var extend = require('extend');
var propsParser = require('properties-parser');
var isKeyword = require('is-keyword-js');
var BufferStreams = require('bufferstreams');

var PluginError = gutil.PluginError;
var PLUGIN_NAME = 'gulp-props2json';
var entryTemplate = '<%=data.ns%>[\'<%=data.key%>\'] = <%=data.value%>;';
var minifiedTemplate = '<%=data.ns%>[\'<%=data.key%>\']=<%=data.value%>;';
var rKey = /([\\'])/g;
var rValue = /([\\"'])/g;

function getValidIdentifier(str) {
    var identifier = str.replace(/[^a-z0-9_$]/ig, '_');
    if (/^[0-9]+/.test(identifier)) {
        identifier = '_' + identifier;
    }
    if (identifier !== str) {
        gutil.log(gutil.colors.yellow(PLUGIN_NAME + ': namespace option was renamed to ' + identifier + ' to be a valid variable name.'));
    }
    return identifier;
}

function addProperty(obj, str, val, options) {
    str = str.split(options.nestingDelimiter);
    while (str.length > 1) {
        var prop = str.shift();
        if (!obj.hasOwnProperty(prop)) {
            obj[prop] = {};
        }
        obj = obj[prop];
    }
    if (options.complexTypes) {
        val = getParsedJSON(val);
    }
    return obj[str.shift()] = val;
}

function addNamespaceAndPrettify(obj, options) {
    var objWithNamespace = {};
    if (options.namespace) {
        objWithNamespace[options.namespace] = obj;
        obj = objWithNamespace;
    }
    if (!options.minify && !options.space) {
        options.space = 2;
    }
    return obj;
}

function getParsedJSON(value) {
    try {
        return JSON.parse(value);
    } catch (error) {
        return value;
    }
}

function getJsonOutput(options, props) {
    if (options.nestedProps) {
        var obj = {};
        Object.keys(props).forEach(function(key) {
            addProperty(obj, key, props[key], options);
        });
        obj = addNamespaceAndPrettify(obj, options);
        return JSON.stringify(obj, options.replacer, options.space);
    } else {
        if (options.complexTypes) {
            for (var prop in props) {
                props[prop] = getParsedJSON(props[prop]);
            }
        }
        props = addNamespaceAndPrettify(props, options);
        return JSON.stringify(props, options.replacer, options.space);
    }
}

function getJsOutput(options, props) {
    var output = '';
    if (!options.namespace) {
        options.namespace = 'props';
    }
    if (options.minify) {
        output = ['var ' + options.namespace + '=' + options.namespace + '||{};'];
    } else {
        output = ['var ' + options.namespace + ' = ' + options.namespace + ' || {};'];
    }
    var template = options.minify ? minifiedTemplate : entryTemplate;
    Object.keys(props).forEach(function(key) {
        var val;
        if (options.complexTypes) {
            try {
                val = JSON.parse(props[key].replace(rValue, '\\$1'));
            } catch (error) {
                val = '\'' + props[key].replace(rValue, '\\$1') + '\'';
            }
        } else {
            val = '\'' + props[key].replace(rValue, '\\$1') + '\'';
        }
        output.push(gutil.template(template, {
            file: {
            },
            data: {
                ns: options.namespace,
                key: key.replace(rKey, '\\$1'),
                value: val
            }
        }));
    });
    options.minify ? output = output.join('') : output = output.join('\n') + '\n';

    //TODO
    if (options.nestedProps) {

    } else {

    }
    return output;
}

function props2json(buffer, options) {
    var props = propsParser.parse(buffer.toString('utf8')); //returns object with simple properties
	var output = '';
    if (options.outputType === 'json') {
        output = getJsonOutput(options, props);
    } else if (options.outputType === 'js') {
        output = getJsOutput(options, props);
    }
    return new Buffer(output);
}

function outputFilename(filePath, options) {
    return (options.appendExt) ? filePath + '.' + options.outputType : gutil.replaceExtension(filePath, '.' + options.outputType);
}

module.exports = function(options) {
    var self = this;
    options = extend({
        outputType: 'json',
        namespace: null,
        minify: true,
        complexTypes: false,
        nestedProps: false,
        replacer: null,
        space: 0,
        nestingDelimiter: '.',
        appendExt: false
    }, options);

    return through.obj(function(file, enc, callback) {
        if (options.namespace) {
            if (isKeyword(options.namespace)) {
                this.emit('error', new PluginError(PLUGIN_NAME, 'namespace option cannot be a reserved word.'));
                return callback();
            }
            options.namespace = getValidIdentifier(options.namespace);
        }
        if (file.isStream()) {
            file.contents = file.contents.pipe(new BufferStreams(function(err, buf, cb) {
                if (err) {
                    self.emit('error', new PluginError(PLUGIN_NAME, err.message));
                } else {
                    try {
                        cb(null, props2json(buf, options));
                        file.contents = props2json(file.contents, options);
                        file.path = outputFilename(file.path, options);
                    } catch (error) {
                        self.emit('error', new PluginError(PLUGIN_NAME, error.message));
                        cb(error);
                    }
                }
            }));
        } else if (file.isBuffer()) {
            try {
                file.contents = props2json(file.contents, options);
                file.path = outputFilename(file.path, options);
            } catch (error) {
                this.emit('error', new PluginError(PLUGIN_NAME, error.message));
                return callback();
            }
        }
        this.push(file);
        return callback();
    });
};
