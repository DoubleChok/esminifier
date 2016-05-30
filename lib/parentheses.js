var ParathesesMap = {
    "CallExpression":{"FunctionExpression":true,"ConditionalExpression":true,"SequenceExpression":true},
    "MemberExpression":{"FunctionExpression":true,"ConditionalExpression":true,"SequenceExpression":true,"LogicalExpression":true,"BinaryExpression":true,"NewExpression":true},
    "LogicalExpression":{"AssignmentExpression":true,"ConditionalExpression":true,"SequenceExpression":true},
    "BinaryExpression":{"AssignmentExpression":true,"ConditionalExpression":true,"SequenceExpression":true},
    "UnaryExpression":{"AssignmentExpression":true,"LogicalExpression":true,"BinaryExpression":true,"ConditionalExpression":true,"SequenceExpression":true},
    "NewExpression:callee":{"LogicalExpression":true,"ConditionalExpression":true,"SequenceExpression":true},
    "NewExpression:arguments":{"SequenceExpression":true},
    "ConditionalExpression":{"SequenceExpression":true},
    "ArrayExpression":{"SequenceExpression":true},
    "AssignmentExpression":{"SequenceExpression":true}
};

var operatorweight = {
    "*":1,
    "/":1,
    "%":1,
    "+":2,
    "-":2,
    ">>":3,
    "<<":3,
    ">>>":3,
    "<":4,
    ">":4,
    "<=":4,
    ">=":4,
    "in":4,
    "instanceof":4,
    "==":5,
    "===":5,
    "!=":5,
    "!==":5,
    "&":6,
    "^":7,
    "|":8,
    "&&":9,
    "||":10,
};

var CustomHandling = {};


CustomHandling["BinaryExpression"] = function(parent,ast){
    
    if (ast.type === "BinaryExpression" || ast.type === "LogicalExpression" ){
        if (operatorweight[ast.operator] > operatorweight[parent.operator]){
            return true;
        } else if (operatorweight[ast.operator] === operatorweight[parent.operator] && parent.left !== ast){
            return true;
        }
    } else if (ParathesesMap[parent.type] && ParathesesMap[parent.type][ast.type]) {
        return true;
    }
    return false;
    
};

CustomHandling["LogicalExpression"] = CustomHandling["BinaryExpression"];

CustomHandling["UnaryExpression"] = function(parent,ast){
    if (ast.type === "UnaryExpression"){
        if (ast.operator === parent.operator && (ast.operator === "+" || ast.operator === "-")){
            return true;
        }
    } else if (ParathesesMap[parent.type] && ParathesesMap[parent.type][ast.type]) {
        return true;
    }
    return false;
    
};


CustomHandling["ConditionalExpression"] = function(parent,ast){
    if (ast === parent.test){
        if (ast.type === "ConditionalExpression" || ast.type === "AssignmentExpression"){
            return true;
        }
    }
    if (ParathesesMap[parent.type] && ParathesesMap[parent.type][ast.type]) {
        return true;
    }
    return false;
};

var ParathesesUnNessecaryForFunctionExpressionMap = {
    "LogicalExpression":true,
    "Property":true,
    "AssignmentExpression":true,
    "VariableDeclarator":true
};

CustomHandling["CallExpression"] = function(parent,ast){
    if (parent.arguments.indexOf(ast) !== -1 && ast.type !== "SequenceExpression"){
            return false;
    } else if (ast.type === "FunctionExpression" && parent.parent){
        var grandparent = parent.parent;
        if (ParathesesUnNessecaryForFunctionExpressionMap[grandparent.type]){
            return false;
        }
    }
    if (ParathesesMap[parent.type] && ParathesesMap[parent.type][ast.type]) {
        return true;
    }
    return false;

};

CustomHandling["MemberExpression"] = function(parent,ast){
    if (parent.computed && parent.property === ast ){
        return false;
    } else if (ParathesesMap[parent.type] && ParathesesMap[parent.type][ast.type]) {
        return true;
    }
    return false;
};
CustomHandling["NewExpression"] = function(parent,ast){
    if (parent.callee === ast){
        if (ParathesesMap["NewExpression:callee"] && ParathesesMap["NewExpression:callee"][ast.type]) {
            return true;
        }
    } else {
        if (ParathesesMap["NewExpression:arguments"] && ParathesesMap["NewExpression:arguments"][ast.type]) {
            return true;
        }
    }
    return false;
};



exports.needsParentheses = function(ast){
    var parent = ast.parent;
    if (parent){
        if (parent.type === "MemberExpression" && parent.computed && parent.property === ast ){
            return false;
        }

        if (CustomHandling[parent.type]){
            return CustomHandling[parent.type](parent,ast);
        } else if (ParathesesMap[parent.type] && ParathesesMap[parent.type][ast.type]) {
            return true;
        }
    }
    
    return false;
};
