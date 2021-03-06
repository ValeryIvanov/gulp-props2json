'use strict';

var props = require('../');
var gutil = require('gulp-util');
var File = gutil.File;
var fs = require('fs');
var path = require('path');
var es = require('event-stream');

require('should');
require('mocha');

describe('gulp-props2json', function() {

    // Test files

    var propsFile;
	var nullFile;
	var emptyFile;//TODO both
	var specialFile;
	var noExtFile;
    var replaceFile;

    // buffer mode

    describe('in buffer mode', function() {

        beforeEach(function() {
            propsFile = new File({
                path: 'test/props.properties',
                cwd: 'test',
                contents: fs.readFileSync('test/props.properties')
            });
            noExtFile = new File({
                path: 'test/noExt.1',
                cwd: 'test',
                contents: fs.readFileSync('test/noExt.1')
            });
            emptyFile = new File({
                path: 'test/empty.properties',
                cwd: 'test',
                contents: fs.readFileSync('test/empty.properties')
            });
            specialFile = new File({
                path: 'test/special.properties',
                cwd: 'test',
                contents: fs.readFileSync('test/special.properties')
            });
            nullFile = new File({
                cwd: 'test',
                contents: null
            });
            replaceFile = new File({
                path: 'test/replace.properties',
                cwd: 'test',
                contents: fs.readFileSync('test/replace.properties')
            });
        });

        it('should return valid JS with quotation marks', function(done) {
            var stream = props({ outputType: 'js' });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('var props=props||{};props["\\"key\\""]="\\"value\\"";props["\\"new.key\\""]="\\"new.key.value\\"";');
                path.extname(file.path).should.equal('.js');
                done();
            });

            stream.write(replaceFile);
            stream.end();
        });

        it('should return valid JS with nested props and quotation marks', function(done) {
            var stream = props({ outputType: 'js', nestedProps: true });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('var props=props||{};props["\\"key\\""]=props["\\"key\\""]||"\\"value\\"";props["\\"new"]=props["\\"new"]||{};props["\\"new"]["key\\""]=props["\\"new"]["key\\""]||"\\"new.key.value\\"";');
                path.extname(file.path).should.equal('.js');
                done();
            });

            stream.write(replaceFile);
            stream.end();
        });

        it('should return valid JSON with quotation marks', function(done) {
            var stream = props({ outputType: 'json' });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('{"\\"key\\"":"\\"value\\"","\\"new.key\\"":"\\"new.key.value\\""}');
                path.extname(file.path).should.equal('.json');
                done();
            });

            stream.write(replaceFile);
            stream.end();
        });

        it('should return valid JSON with nested props and quotation marks', function(done) {
            var stream = props({ outputType: 'json', nestedProps: true });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('{"\\"key\\"":"\\"value\\"","\\"new":{"key\\"":"\\"new.key.value\\""}}');
                path.extname(file.path).should.equal('.json');
                done();
            });

            stream.write(replaceFile);
            stream.end();
        });

        //json

        // nested properties

        it('should return valid JSON with nested properties', function(done) {
            var stream = props({ outputType: 'json', nestedProps: true });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('{"person":{"firstName":"Peter","lastName":"Parker","real":"false","age":"23"}}');
                path.extname(file.path).should.equal('.json');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JSON with nested properties and namespace', function(done) {
            var stream = props({ outputType: 'json', nestedProps: true, namespace: 'namespace' });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('{"namespace":{"person":{"firstName":"Peter","lastName":"Parker","real":"false","age":"23"}}}');
                path.extname(file.path).should.equal('.json');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JSON with nested properties, namespace and complex types', function(done) {
            var stream = props({ outputType: 'json', nestedProps: true, namespace: 'namespace', complexTypes: true });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('{"namespace":{"person":{"firstName":"Peter","lastName":"Parker","real":false,"age":23}}}');
                path.extname(file.path).should.equal('.json');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JSON with nested properties, namespace, complex types and pretty output', function(done) {
            var stream = props({ outputType: 'json', nestedProps: true, namespace: 'namespace', complexTypes: true, minify: false });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('{\n  "namespace": {\n    "person": {\n      "firstName": "Peter",\n      "lastName": "Parker",\n      "real": false,\n      "age": 23\n    }\n  }\n}');
                path.extname(file.path).should.equal('.json');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        // simple properties

        it('should return valid JSON with simple properties', function(done) {
            var stream = props({ outputType: 'json', nestedProps: false });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('{"person.firstName":"Peter","person.lastName":"Parker","person.real":"false","person.age":"23"}');
                path.extname(file.path).should.equal('.json');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JSON with simple properties and namespace', function(done) {
            var stream = props({ outputType: 'json', nestedProps: false, namespace: 'namespace' });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('{"namespace":{"person.firstName":"Peter","person.lastName":"Parker","person.real":"false","person.age":"23"}}');
                path.extname(file.path).should.equal('.json');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JSON with simple properties, namespace and complex types', function(done) {
            var stream = props({ outputType: 'json', nestedProps: false, namespace: 'namespace', complexTypes: true });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('{"namespace":{"person.firstName":"Peter","person.lastName":"Parker","person.real":false,"person.age":23}}');
                path.extname(file.path).should.equal('.json');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JSON with simple properties, namespace, complex types and pretty output', function(done) {
            var stream = props({ outputType: 'json', nestedProps: false, namespace: 'namespace', complexTypes: true, minify: false });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('{\n  "namespace": {\n    "person.firstName": "Peter",\n    "person.lastName": "Parker",\n    "person.real": false,\n    "person.age": 23\n  }\n}');
                path.extname(file.path).should.equal('.json');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        //special

        it('should return valid JSON with special characters with minification', function(done) {
            var stream = props({ outputType: 'json' });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('{"a#b!c=d:":"AAAA#BBBB!CCCC=DDDD:EEEE"}');
                path.extname(file.path).should.equal('.json');
                done();
            });

            stream.write(specialFile);
            stream.end();
        });

        //js

        it('should return valid JS with complex types', function(done) {
            var stream = props({ outputType: 'js', complexTypes: true });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('var props=props||{};props["person.firstName"]="Peter";props["person.lastName"]="Parker";props["person.real"]=false;props["person.age"]=23;');
                path.extname(file.path).should.equal('.js');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JS with nested properties', function(done) {
            var stream = props({ outputType: 'js', nestedProps: true, complexTypes: false, minify: false });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('var props = props || {};\nprops["person"] = props["person"] || {};\nprops["person"]["firstName"] = props["person"]["firstName"] || "Peter";\nprops["person"]["lastName"] = props["person"]["lastName"] || "Parker";\nprops["person"]["real"] = props["person"]["real"] || "false";\nprops["person"]["age"] = props["person"]["age"] || "23";\n');
                path.extname(file.path).should.equal('.js');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JS with nested properties and minified', function(done) {
            var stream = props({ outputType: 'js', nestedProps: true, complexTypes: false, minify: true });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('var props=props||{};props["person"]=props["person"]||{};props["person"]["firstName"]=props["person"]["firstName"]||"Peter";props["person"]["lastName"]=props["person"]["lastName"]||"Parker";props["person"]["real"]=props["person"]["real"]||"false";props["person"]["age"]=props["person"]["age"]||"23";');
                path.extname(file.path).should.equal('.js');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JS with nested properties, complex types', function(done) {
            var stream = props({ outputType: 'js', nestedProps: true, complexTypes: true, minify: false });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('var props = props || {};\nprops["person"] = props["person"] || {};\nprops["person"]["firstName"] = props["person"]["firstName"] || "Peter";\nprops["person"]["lastName"] = props["person"]["lastName"] || "Parker";\nprops["person"]["real"] = props["person"]["real"] || false;\nprops["person"]["age"] = props["person"]["age"] || 23;\n');
                path.extname(file.path).should.equal('.js');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JS with nested properties, complex types and minified', function(done) {
            var stream = props({ outputType: 'js', nestedProps: true, complexTypes: true });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('var props=props||{};props["person"]=props["person"]||{};props["person"]["firstName"]=props["person"]["firstName"]||"Peter";props["person"]["lastName"]=props["person"]["lastName"]||"Parker";props["person"]["real"]=props["person"]["real"]||false;props["person"]["age"]=props["person"]["age"]||23;');
                path.extname(file.path).should.equal('.js');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        //other

        //special

        it('should return valid JS with special characters, without minification', function(done) {
            var stream = props({ outputType: 'js', minify: false });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('var props = props || {};\nprops["a#b!c=d:"] = "AAAA#BBBB!CCCC=DDDD:EEEE";\n');
                path.extname(file.path).should.equal('.js');
                done();
            });

            stream.write(specialFile);
            stream.end();
        });

        it('should return valid JS with special characters, with minification', function(done) {
            var stream = props({ outputType: 'js' });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('var props=props||{};props["a#b!c=d:"]="AAAA#BBBB!CCCC=DDDD:EEEE";');
                path.extname(file.path).should.equal('.js');
                done();
            });

            stream.write(specialFile);
            stream.end();
        });

        //null file

        it('should do nothing when contents is null', function(done) {
            var stream = props();

            stream.once('data', function(file) {
                file.isNull().should.equal(true);
                path.extname(file.path).should.equal('');
                done();
            });

            stream.write(nullFile);
            stream.end();
        });

        //no extension

        it('should append the extension instead of replacing it if appendExt flag is active', function(done) {
            var stream = props({ outputType: 'json', nestedProps: true, appendExt: true });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('{"person":{"firstName":"Peter","lastName":"Parker","real":"false","age":"23"}}');
                path.basename(file.path).should.equal('noExt.1.json');
                done();
            });

            stream.write(noExtFile);
            stream.end();
        });

        //reserved word

        it('should reject reserved word for namespace', function(done) {
            var stream = props({ namespace: 'void' });

            stream.once('error', function(error) {
                error.message.should.equal('namespace option cannot be a reserved word.');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        //invalid identifier

        it('should rename the namespace if is not a valid identifier', function(done) {
            var stream = props({ outputType: 'js', namespace: '123' });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('var _123=_123||{};_123["person.firstName"]="Peter";_123["person.lastName"]="Parker";_123["person.real"]="false";_123["person.age"]="23";');
                path.extname(file.path).should.equal('.js');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return empty JS object with empty properties files', function(done) {
            var stream = props({ outputType: 'js' });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('var props=props||{};');
                path.extname(file.path).should.equal('.js');
                done();
            });

            stream.write(emptyFile);
            stream.end();
        });

        it('should return empty object JSON string with empty properties files', function(done) {
            var stream = props({ outputType: 'json' });

            stream.once('data', function(file) {
                file.contents.toString('utf8').should.equal('{}');
                path.extname(file.path).should.equal('.json');
                done();
            });

            stream.write(emptyFile);
            stream.end();
        });

    });

    // stream mode

    describe('in stream mode', function() {

        beforeEach(function() {
            propsFile = new File({
                path: 'test/props.properties',
                cwd: 'test',
                contents: fs.createReadStream('test/props.properties')
            });
            emptyFile = new File({
                path: 'test/empty.properties',
                cwd: 'test',
                contents: fs.createReadStream('test/empty.properties')
            });
            specialFile = new File({
                path: 'test/special.properties',
                cwd: 'test',
                contents: fs.createReadStream('test/special.properties')
            });
            nullFile = new File({
                cwd: 'test',
                contents: null
            });
        });

        // json

        // nested properties

        it('should return valid JSON with nested properties', function(done) {
            var stream = props({ outputType: 'json', nestedProps: true });

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal('{"person":{"firstName":"Peter","lastName":"Parker","real":"false","age":"23"}}');
                    path.extname(file.path).should.equal('.json');
                    done();
                }));
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JSON with nested properties and namespace', function(done) {
            var stream = props({ outputType: 'json', nestedProps: true, namespace: 'namespace' });

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal('{"namespace":{"person":{"firstName":"Peter","lastName":"Parker","real":"false","age":"23"}}}');
                    path.extname(file.path).should.equal('.json');
                    done();
                }));
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JSON with nested properties, namespace and complex types', function(done) {
            var stream = props({ outputType: 'json', nestedProps: true, namespace: 'namespace', complexTypes: true });

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal('{"namespace":{"person":{"firstName":"Peter","lastName":"Parker","real":false,"age":23}}}');
                    path.extname(file.path).should.equal('.json');
                    done();
                }));
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JSON with nested properties, namespace, complex types and pretty output', function(done) {
            var stream = props({ outputType: 'json', nestedProps: true, namespace: 'namespace', complexTypes: true, minify: false });

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal('{\n  "namespace": {\n    "person": {\n      "firstName": "Peter",\n      "lastName": "Parker",\n      "real": false,\n      "age": 23\n    }\n  }\n}');
                    path.extname(file.path).should.equal('.json');
                    done();
                }));
            });

            stream.write(propsFile);
            stream.end();
        });

        // simple properties

        it('should return valid JSON with simple properties', function(done) {
            var stream = props({ outputType: 'json', nestedProps: false });

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal('{"person.firstName":"Peter","person.lastName":"Parker","person.real":"false","person.age":"23"}');
                    path.extname(file.path).should.equal('.json');
                    done();
                }));
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JSON with simple properties and namespace', function(done) {
            var stream = props({ outputType: 'json', nestedProps: false, namespace: 'namespace' });

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal('{"namespace":{"person.firstName":"Peter","person.lastName":"Parker","person.real":"false","person.age":"23"}}');
                    path.extname(file.path).should.equal('.json');
                    done();
                }));
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JSON with simple properties, namespace and complex types', function(done) {
            var stream = props({ outputType: 'json', nestedProps: false, namespace: 'namespace', complexTypes: true });

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal('{"namespace":{"person.firstName":"Peter","person.lastName":"Parker","person.real":false,"person.age":23}}');
                    path.extname(file.path).should.equal('.json');
                    done();
                }));
            });

            stream.write(propsFile);
            stream.end();
        });

        it('should return valid JSON with simple properties, namespace, complex types and pretty output', function(done) {
            var stream = props({ outputType: 'json', nestedProps: false, namespace: 'namespace', complexTypes: true, minify: false });

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal('{\n  "namespace": {\n    "person.firstName": "Peter",\n    "person.lastName": "Parker",\n    "person.real": false,\n    "person.age": 23\n  }\n}');
                    path.extname(file.path).should.equal('.json');
                    done();
                }));
            });

            stream.write(propsFile);
            stream.end();
        });

        //special

        it('should return valid JSON with special characters with minification', function(done) {
            var stream = props({ outputType: 'json' });

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal('{"a#b!c=d:":"AAAA#BBBB!CCCC=DDDD:EEEE"}');
                    path.extname(file.path).should.equal('.json');
                    done();
                }));
            });

            stream.write(specialFile);
            stream.end();
        });

        //js

        //special

        it('should return valid JS with special characters, without minification', function(done) {
            var stream = props({ outputType: 'js', minify: false });

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal('var props = props || {};\nprops["a#b!c=d:"] = "AAAA#BBBB!CCCC=DDDD:EEEE";\n');
                    path.extname(file.path).should.equal('.js');
                    done();
                }));
            });

            stream.write(specialFile);
            stream.end();
        });

        it('should return valid JS with special characters, with minification', function(done) {
            var stream = props({ outputType: 'js' });

            stream.once('data', function(file) {
                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal('var props=props||{};props["a#b!c=d:"]="AAAA#BBBB!CCCC=DDDD:EEEE";');
                    path.extname(file.path).should.equal('.js');
                    done();
                }));
            });

            stream.write(specialFile);
            stream.end();
        });

        //other

        it('should reject reserved word for namespace', function(done) {
            var stream = props({ namespace: 'void' });

            stream.once('error', function(error) {
                error.message.should.equal('namespace option cannot be a reserved word.');
                done();
            });

            stream.write(propsFile);
            stream.end();
        });

        //invalid identifier

        it('should rename the namespace if is not a valid identifier', function(done) {
            var stream = props({ outputType: 'js', namespace: '123' });

            stream.once('data', function(file) {

                file.contents.pipe(es.wait(function(err, data) {
                    data.toString('utf8').should.equal('var _123=_123||{};_123["person.firstName"]="Peter";_123["person.lastName"]="Parker";_123["person.real"]="false";_123["person.age"]="23";');
                    path.extname(file.path).should.equal('.js');
                    done();
                }));

            });

            stream.write(propsFile);
            stream.end();
        });

    });
	
});