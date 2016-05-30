var esprima = require("esprima");
var parenting = require("./lib/parenting");
var generator = require("./lib/generate");

exports.minify = function(source) {
    var parsed = esprima.parse(source);
    var parented = parenting.addParenting(parsed);
    return generator.generate(parented);
};