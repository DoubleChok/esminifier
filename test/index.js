var esminify = require("../");
var fs = require("fs");
var esprima = require("esprima");
var mkdirp = require("mkdirp");
var diff = require('deep-diff').diff;

var libraries = ["Three.js", "Three.min.js", "pdf.js", "pdf.worker.js","babylon.js","ammo.js"];
        
mkdirp("./test/minifiedlibs/", function(){

    for (var i = 0; i < libraries.length; i++  ){
        try {
    
            var source = fs.readFileSync("./test/libs/" + libraries[i]);
            
            console.log(libraries[i] + " starts minifying.");
            var minified = esminify.minify(source);
            fs.writeFileSync("./test/minifiedlibs/" + libraries[i],minified,"utf8"); 
            console.log(libraries[i] + " is minified. Starting to check it now. ");
            
            checkForDifferencesInAst(source,minified);
            checkForDifferencesInSource(libraries[i]);
            
            console.log(libraries[i] + " is checked.");
    
        } catch(e) {
            
            console.dir(e);
            
        }
    }
});


function checkForDifferencesInAst(source,minified){
    var parsed = esprima.parse(source);
    try {
        var minifiedparsed = esprima.parse(minified);
    } catch (e) {
        console.log(minified.substring(e.index - 200,e.index));
        console.log(minified.substring(e.index,e.index + 200));
        throw e;
    }
    var difference = diff(parsed,minifiedparsed);
    reportDiffs(source,difference);
}

function checkForDifferencesInSource(libraryName){
    var index = 0;
    var minified = fs.readFileSync("./test/minifiedlibs/" + libraryName);
    var sourceToCompare = fs.readFileSync("./test/testlibs/" + libraryName);
    while(index < minified.length && index < sourceToCompare.length ){
        if (minified[index] !== sourceToCompare[index]){
            console.log("");
            console.log(minified.toString("utf8",index - 200,index));
            console.log(minified.toString("utf8",index,index + 200));
            console.log("vs");
            console.log(sourceToCompare.toString("utf8",index - 200,index));
            console.log(sourceToCompare.toString("utf8",index,index + 200));
            break;
        }
        index++;
    }
}




function reportDiffs(source,diffs){
    if (diffs){
        var lines = esprima.parse(source,{loc:true});
        for (var i = 0; i < diffs.length; i++ ){
            console.log("Difference on lines " + generatelinesfromdiff(lines,diffs[i]) + " is: ");
            console.dir(JSON.stringify(diffs[i]));
        }
    }
}

function generatelinesfromdiff(ast,diff) {
    var ancestors = getAncestors(ast, diff);
    var Smallestast = ancestors.pop();
    while (!Smallestast.type){
        Smallestast = ancestors.pop();
    }
    return [Smallestast.loc.start.line,Smallestast.loc.start.column,
        Smallestast.loc.end.line, Smallestast.loc.end.column];
}
function getAncestors(ast,diff){
    var ancestors= [];
    var temp = ast;
    var path = diff.path;
    
    do {
        temp = temp[path.shift()];
        ancestors.push(temp);
    } while(path.length > 0 && temp);
    
    return ancestors;
        
}
