var parentheses = require("./parentheses");

exports.generate = function(ast){
    
   return generate(ast);
    
}; 

var generate = function(ast){
    if (GeneratorCodes[ast.type]){
        var generated =  GeneratorCodes[ast.type](ast);
        if (parentheses.needsParentheses(ast)){
            generated = "(" + generated + ")";
        }
        return generated;
    } else {
        if (!ast.type){
            throw new Error("astType.type is undefined");
        }
        console.log(ast.type + " is not implemented");
        return "";
    }
};

var endsWithBlockStatement = function(ast){
    if (ast.type === "BlockStatement"){
        return true;
    }
    if (ast.type === "EmptyStatement") {
        return true;
    }
    if (ast.type === "FunctionDeclaration" || ast.type ==="SwitchStatement" || ast.type === "TryStatement") {
        return true;
    }
    if (ast.type === "IfStatement") {
        if (ast.alternate){
            return endsWithBlockStatement(ast.alternate);
        } else {
            return endsWithBlockStatement(ast.consequent);
        }
    }
    if (ast.type === "ForStatement" || ast.type === "ForInStatement" || ast.type === "WhileStatement" || ast.type === "LabeledStatement") {
        return endsWithBlockStatement(ast.body);
    }

    return false;
};
var needsSeperator = function(ast) {
    if (ast.parent.body.indexOf(ast) === ast.parent.body.length -1) {
        
        return false;
    }
    if (endsWithBlockStatement(ast)) {
        return false;
    }
    return true;
};
var needsSeperatorCases = function(ast) {
/*    if (ast.parent.consequent.indexOf(ast) === ast.parent.consequent.length -1) {
        return false;
    }*/
    if (endsWithBlockStatement(ast)) {
        return false;
    }
    return true;
};

var GeneratorCodes = {};

GeneratorCodes["Program"]= function(ast){
    var returnValue = "";
    for(var i = 0; i < ast.body.length; i++) {
        returnValue += generate(ast.body[i]);
        if (needsSeperator(ast.body[i])) {
            returnValue += ";";
        }
    }
    return returnValue;
};

GeneratorCodes["VariableDeclaration"]= function(ast){
    var returnValue = "var ";
    for(var i = 0; i < ast.declarations.length; i++) {
        returnValue += generate(ast.declarations[i]);
        if ( i < ast.declarations.length - 1) {
            returnValue += ",";
        }
    }
    return returnValue;
};

GeneratorCodes["VariableDeclarator"]= function(ast){
    var returnValue = generate(ast.id);
    if (ast.init){
        returnValue += "=";
        returnValue += generate(ast.init);
    }
    return returnValue;
};

GeneratorCodes["Identifier"]= function(ast){
    return ast.name;
};

GeneratorCodes["BinaryExpression"] = function(ast) {
    var returnValue = generate(ast.left);
    if (/^[A-Z]/gi.test(ast.operator) && /[^\/\"\'\[\{\-\+\!\(\)\]\}]$/g.test(returnValue)){
        returnValue += " ";
    }
    returnValue += ast.operator;
    var right = generate(ast.right);
    if (/[A-Z]$/gi.test(ast.operator) && /^[^\/\"\'\[\{\-\+\!\(\)\]\}]/g.test(right)){
        returnValue += " ";
    } else if (right[0] === ast.operator) {
        returnValue += " ";
    }
    returnValue += right;
    return returnValue;
};

GeneratorCodes["Literal"]= function(ast){
    return ast.raw;
};

GeneratorCodes["IfStatement"] = function(ast){
    var returnValue = "if(";
    returnValue += generate(ast.test);
    returnValue += ")";
    returnValue += generate(ast.consequent);
    if (ast.alternate) {
        if (!endsWithBlockStatement(ast.consequent)){
            returnValue += ";";
        }
        returnValue += "else";
        var alternate = generate(ast.alternate);
        if  (/^[^\/\"\'\[\{\-\+\!\(\.]/g.test(alternate)){
            returnValue += " ";
        }
        returnValue += alternate;
    }
    return returnValue;
};

GeneratorCodes["ObjectExpression"] = function(ast){
    var returnValue = "{";
    for(var i = 0; i < ast.properties.length; i++) {
        returnValue += generate(ast.properties[i]);
        if (ast.properties.length - 1 !== i ){
            returnValue += ",";
        }
    }
    returnValue += "}";
    return returnValue;
};

GeneratorCodes["Property"] = function(ast){
    switch(ast.kind){
        case "init":
            return GeneratorCodes["Property:init"](ast);
        case "get":
            return GeneratorCodes["Property:get"](ast);
        case "set":
            return GeneratorCodes["Property:set"](ast);
        default:
            throw new Error(ast.kind + " is not implement as property kind");
    }
};
    
    
GeneratorCodes["Property:init"] = function(ast){
    var returnValue = generate(ast.key);
    returnValue += ":";
    returnValue += generate(ast.value);
    return returnValue;
}; 

GeneratorCodes["Property:get"] = function(ast){
    var returnValue = "get ";
    returnValue += generate(ast.key);
    returnValue += "()";
    returnValue += generate(ast.value.body);
    return returnValue;
};

GeneratorCodes["Property:set"] = function(ast){
    var returnValue = "set ";
    returnValue += generate(ast.key);
    returnValue += "(";
    returnValue += generate(ast.value.params[0]);
    returnValue += ")";
    returnValue += generate(ast.value.body);
    return returnValue;
};

GeneratorCodes["LogicalExpression"] = function(ast) {
    var returnValue = generate(ast.left);
    returnValue += ast.operator;
    returnValue += generate(ast.right);
    return returnValue;
};

GeneratorCodes["BlockStatement"]= function(ast){
    var returnValue = "{";
    for(var i = 0; i < ast.body.length; i++) {
        returnValue += generate(ast.body[i]);
        if ( ast.body.length - 1 !== i ){
            if (needsSeperator(ast.body[i])) {
                returnValue += ";";
            }
        }
    }
    returnValue += "}";
    return returnValue;
};

GeneratorCodes["ExpressionStatement"]= function(ast){
    return generate(ast.expression);
};

GeneratorCodes["MemberExpression"]= function(ast){
    var returnValue = generate(ast.object);
    if (ast.computed){
        returnValue += "[";
        returnValue += generate(ast.property);
        returnValue += "]";
        
    } else {
        returnValue += ".";
        returnValue += generate(ast.property);
    }
    return returnValue;
};

GeneratorCodes["AssignmentExpression"]= function(ast){
    var returnValue = generate(ast.left);
    returnValue += ast.operator;
    returnValue += generate(ast.right);
    return returnValue;
};

GeneratorCodes["CallExpression"]= function(ast){
    var returnValue = generate(ast.callee);
    returnValue += "(";
    for(var i = 0; i < ast.arguments.length; i++) {
        returnValue += generate(ast.arguments[i]);
        if (ast.arguments.length - 1 !== i ){
            returnValue += ",";
        }
    }
    returnValue += ")";
    
    return returnValue;
};
GeneratorCodes["FunctionExpression"] = function(ast){
    var returnValue = "function"
    if (ast.id){
        returnValue += " ";
        returnValue += generate(ast.id);
    }
    returnValue += "(";
    for(var i = 0; i < ast.params.length; i++) {
        returnValue += generate(ast.params[i]);
        if (ast.params.length - 1 !== i ){
            returnValue += ",";
        }
    }
    returnValue += ")";
    returnValue += generate(ast.body);
    return returnValue;
};
GeneratorCodes["FunctionDeclaration"] = GeneratorCodes["FunctionExpression"];

GeneratorCodes["ThisExpression"] = function(ast){
    return "this";
};

GeneratorCodes["ArrayExpression"] = function(ast){
    var returnValue = "[";
    for(var i = 0; i < ast.elements.length; i++) {
        returnValue += generate(ast.elements[i]);
        if (ast.elements.length - 1 !== i ){
            returnValue += ",";
        }
    }
    returnValue += "]";
    return returnValue;
};

var NoParenthesesListForNewExpression = {
    "AssignmentExpression":true,
    "VariableDeclarator":true,
    "ConditionalExpression":true,
    "MemberExpression":true,
    "LogicalExpression":true,
    "ArrayExpression":true,
    "Property":true,
    "ReturnStatement":true,
    "CallExpression":true,
    "NewExpression":true,
    "SequenceExpression":true
};

GeneratorCodes["NewExpression"] = function(ast){
    var returnValue = "new ";
    returnValue += generate(ast.callee);
    if (ast.arguments.length){
        returnValue += "(";
        for(var i = 0; i < ast.arguments.length; i++) {
            returnValue += generate(ast.arguments[i]);
            if (ast.arguments.length - 1 !== i ){
                returnValue += ",";
            }
        }
        returnValue += ")";
    } else if (!NoParenthesesListForNewExpression[ast.parent.type]){
        returnValue += "()";
    }
    return returnValue;
};

GeneratorCodes["UnaryExpression"] = function(ast){
    var returnValue = "";
    if (ast.prefix){
        returnValue += ast.operator;
        if (/[^\+\-\!\~]$/g.test(returnValue)){
            returnValue += " ";
        }
    }
    returnValue += generate(ast.argument);
    if (!ast.prefix){
/*        if (/^[^\+\-]/g.test(ast.operator)){
            returnValue += " ";
        }*/
        returnValue += ast.operator;
    }
    return returnValue;
};
GeneratorCodes["UpdateExpression"] = GeneratorCodes["UnaryExpression"];

GeneratorCodes["ReturnStatement"] = function(ast){
    var returnValue = "return";
    if (ast.argument) {
        var argument = generate(ast.argument);
        if (/^[^\/\"\'\[\{\-\+\!\(\.]/g.test(argument)){
            returnValue += " ";
        }
        returnValue += argument;  
    }
    return returnValue;
};

GeneratorCodes["ConditionalExpression"] = function(ast){
    var returnValue = generate(ast.test);
    returnValue += "?";
    returnValue += generate(ast.consequent);
    returnValue += ":";
    returnValue += generate(ast.alternate);  
    return returnValue;
};

GeneratorCodes["ForStatement"] = function(ast){
    var returnValue = "for(";
    if (ast.init){
        returnValue += generate(ast.init);
    }
    returnValue += ";";
    if (ast.test){
        returnValue += generate(ast.test);
    }
    returnValue += ";";
    if (ast.update){
        returnValue += generate(ast.update);  
    }
    returnValue += ")";
    returnValue += generate(ast.body);  
    return returnValue;
};

GeneratorCodes["SequenceExpression"]= function(ast){
    var returnValue = "";
    for(var i = 0; i < ast.expressions.length; i++) {
        returnValue += generate(ast.expressions[i]);
        if ( i < ast.expressions.length - 1) {
            returnValue += ",";
        }
    }
    return returnValue;
};

GeneratorCodes["ForInStatement"]= function(ast){
    var returnValue = "for(";
    returnValue += generate(ast.left);
    returnValue += " in ";
    returnValue += generate(ast.right);
    returnValue += ")";
    returnValue += generate(ast.body);  
    return returnValue;

};

GeneratorCodes["WhileStatement"]= function(ast){
    var returnValue = "while(";
    returnValue += generate(ast.test);
    returnValue += ")";
    returnValue += generate(ast.body);  
    return returnValue;
};

GeneratorCodes["DoWhileStatement"]= function(ast){
    var returnValue = "do";
    var body = generate(ast.body);
    if (body[0] !== "{"){
        returnValue += " ";
    }
    returnValue += body;  
    if (!endsWithBlockStatement(ast.body)) {
        returnValue += ";";
    }
    returnValue += "while(";
    returnValue += generate(ast.test);
    returnValue += ")";
    return returnValue;
};

GeneratorCodes["ContinueStatement"]= function(ast){
    var returnValue = "continue";
    if (ast.label){
        returnValue += " ";
        returnValue += generate(ast.label);
    } 
    return returnValue;
};

GeneratorCodes["BreakStatement"]= function(ast){
    var returnValue = "break";
    if (ast.label){
        returnValue += " ";
        returnValue += generate(ast.label);
    } 
    return returnValue;
};

GeneratorCodes["ThrowStatement"]= function(ast){
    var returnValue = "throw";
    var argument = generate(ast.argument);
    if (/^[^\/\"\'\[\{\-\+\!\(]/g.test(argument)){
        returnValue += " ";
    }
    returnValue += argument;  

    return returnValue;
};

GeneratorCodes["LabeledStatement"]= function(ast){
    var returnValue = "";
    returnValue += generate(ast.label);
    returnValue += ":";
    returnValue += generate(ast.body);
    
    return returnValue;
};

GeneratorCodes["SwitchStatement"]= function(ast){
    var returnValue = "switch(";
    returnValue += generate(ast.discriminant);
    returnValue += "){";
    for(var i = 0; i < ast.cases.length; i++) {
        returnValue += generate(ast.cases[i]);
        //console.log(generate);
        if (ast.cases[i].consequent.length !== 0 && needsSeperatorCases(ast.cases[i].consequent[ast.cases[i].consequent.length -1]) && i !== ast.cases.length -1) {
            returnValue += ";";
        }
    }
    returnValue += "}";
    
    return returnValue;
};

GeneratorCodes["SwitchCase"]= function(ast){
    var returnValue = "",i = 0;
    if (ast.test){
        returnValue += "case";
        var test = generate(ast.test);
        if (/^[^\/\"\'\[\{\-\+\!\(]/g.test(test)){
            returnValue += " ";
        }
        returnValue += test;
        returnValue += ":";
        for(i = 0; i < ast.consequent.length; i++) {
            returnValue += generate(ast.consequent[i]);
            if (i < ast.consequent.length -1 && needsSeperatorCases(ast.consequent[i])) {
                returnValue += ";";
            }
        }
    } else {
        returnValue += "default:";
        for(i = 0; i < ast.consequent.length; i++) {
            returnValue += generate(ast.consequent[i]);
            if (i < ast.consequent.length -1 &&  needsSeperatorCases(ast.consequent[i])) {
               // console.log("test");
                returnValue += ";";
            }
        }
    }
    return returnValue;
};

GeneratorCodes["TryStatement"]= function(ast){
    var returnValue = "try";
    returnValue += generate(ast.block);
    if (ast.handler){
        returnValue += generate(ast.handler);
    }
    if (ast.finalizer){
        returnValue += "finally"
        returnValue += generate(ast.finalizer);
    }
    
    return returnValue;
};

GeneratorCodes["CatchClause"]= function(ast){
    var returnValue = "catch(";
    returnValue += generate(ast.param);
    returnValue += ")";
    returnValue += generate(ast.body);
    return returnValue;
};

GeneratorCodes["EmptyStatement"]= function(ast){
    return ";";
};
GeneratorCodes["DebuggerStatement"]= function(ast){
    return "debugger";
};
