var esprima = require("esprima");
var parenting = require("./lib/parenting");
var generator = require("./lib/generator");

exports.minify = function(source,config) {
    var parsed = esprima.parse(source);
    var parented = parenting.addParenting(parsed);
    if (config.manipulate === false) {
        
    }
    return generator.generate(parented);
};