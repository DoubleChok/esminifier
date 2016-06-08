
exports.addParenting = function(ast){
    addparent(ast,null);
    return ast;
};

var addparent= function(ast,parent){
    if (parentCodes[ast.type]){
        ast.parent = parent;
        parentCodes[ast.type](ast);
    } else {
        console.log(ast.type);
    }
};

var parentCodes = {};

parentCodes["Program"]= function(ast){
    for(var i = 0; i < ast.body.length; i++) {
        addparent(ast.body[i],ast);
    }
};

parentCodes["VariableDeclaration"]= function(ast){
    for(var i = 0; i < ast.declarations.length; i++) {
        addparent(ast.declarations[i],ast);
    }
};

parentCodes["VariableDeclarator"]= function(ast){
    addparent(ast.id,ast);
    if (ast.init){
        addparent(ast.init, ast);
    }
};

parentCodes["Identifier"]= function(ast){};
parentCodes["EmptyStatement"]= function(ast){};

parentCodes["BinaryExpression"] = function(ast) {
    addparent(ast.left,ast);
    addparent(ast.right,ast);
};

parentCodes["Literal"]= function(ast){};

parentCodes["IfStatement"] = function(ast){
    addparent(ast.test,ast);
    addparent(ast.consequent,ast);
    if (ast.alternate) {
        addparent(ast.alternate,ast);
    }
};

parentCodes["ObjectExpression"] = function(ast){
    for(var i = 0; i < ast.properties.length; i++) {
        addparent(ast.properties[i],ast);
    }
};

parentCodes["Property"] = function(ast){
    addparent(ast.key,ast);
    addparent(ast.value,ast);
};

parentCodes["LogicalExpression"] = function(ast) {
    addparent(ast.left,ast);
    addparent(ast.right,ast);
};

parentCodes["BlockStatement"]= function(ast){
    for(var i = 0; i < ast.body.length; i++) {
        addparent(ast.body[i],ast);
    }
};

parentCodes["ExpressionStatement"]= function(ast){
    addparent(ast.expression,ast);
};

parentCodes["MemberExpression"]= function(ast){
    addparent(ast.object,ast);
    addparent(ast.property,ast);
};

parentCodes["AssignmentExpression"]= function(ast){
    addparent(ast.left,ast);
    addparent(ast.right,ast);
};

parentCodes["CallExpression"]= function(ast){
    addparent(ast.callee,ast);
    for(var i = 0; i < ast.arguments.length; i++) {
        addparent(ast.arguments[i],ast);
    }
};
parentCodes["FunctionExpression"] = function(ast){
    if (ast.id){
        addparent(ast.id,ast);
    }
    for(var i = 0; i < ast.params.length; i++) {
        addparent(ast.params[i],ast);
    }
    addparent(ast.body,ast);
};
parentCodes["FunctionDeclaration"] = parentCodes["FunctionExpression"];

parentCodes["ThisExpression"] = function(ast){};

parentCodes["ArrayExpression"] = function(ast){
    for(var i = 0; i < ast.elements.length; i++) {
        addparent(ast.elements[i],ast);
    }
};

parentCodes["NewExpression"] = function(ast){
    addparent(ast.callee,ast);
    for(var i = 0; i < ast.arguments.length; i++) {
        addparent(ast.arguments[i],ast);
    }

};

parentCodes["UnaryExpression"] = function(ast){
    addparent(ast.argument,ast);
};
parentCodes["UpdateExpression"] = parentCodes["UnaryExpression"];

parentCodes["ReturnStatement"] = function(ast){
    if (ast.argument) {
        addparent(ast.argument,ast);  
    }
};

parentCodes["ConditionalExpression"] = function(ast){
    addparent(ast.test,ast);
    addparent(ast.consequent,ast);
    addparent(ast.alternate,ast); 
};

parentCodes["ConditionalExpression"] = function(ast){
    addparent(ast.test,ast);
    addparent(ast.consequent,ast);
    addparent(ast.alternate,ast);
};

parentCodes["ForStatement"] = function(ast){
    if (ast.init){
        addparent(ast.init,ast);
    }
    if (ast.test){
        addparent(ast.test,ast);
    }
    if (ast.update){
        addparent(ast.update,ast);  
    }
    addparent(ast.body,ast);  
};

parentCodes["SequenceExpression"]= function(ast){
    for(var i = 0; i < ast.expressions.length; i++) {
        addparent(ast.expressions[i],ast);
    }
};

parentCodes["ForInStatement"]= function(ast){
    addparent(ast.left,ast);
    addparent(ast.right,ast);
    addparent(ast.body,ast);  
};

parentCodes["WhileStatement"]= function(ast){
    addparent(ast.test,ast);
    addparent(ast.body,ast); 
};

parentCodes["DoWhileStatement"]= function(ast){
    addparent(ast.body,ast);  
    addparent(ast.test,ast);
};

parentCodes["ContinueStatement"]= function(ast){};

parentCodes["BreakStatement"]= function(ast){
    if (ast.label){
        addparent(ast.label,ast);
    }
};


parentCodes["ThrowStatement"]= function(ast){
    addparent(ast.argument,ast);
};

parentCodes["LabeledStatement"]= function(ast){
    addparent(ast.label,ast);
    addparent(ast.body,ast);
};

parentCodes["SwitchStatement"]= function(ast){
    addparent(ast.discriminant,ast);
    for(var i = 0; i < ast.cases.length; i++) {
        addparent(ast.cases[i],ast);
    }
};

parentCodes["SwitchCase"]= function(ast){
    if (ast.test){
        addparent(ast.test,ast);
    }
    for(var i = 0; i < ast.consequent.length; i++) {
        addparent(ast.consequent[i],ast);
    }
};

parentCodes["TryStatement"]= function(ast){
    addparent(ast.block,ast);
    if (ast.handler){
        addparent(ast.handler,ast);
    }
    if (ast.finalizer){
        addparent(ast.finalizer,ast);
    }
};

parentCodes["CatchClause"]= function(ast){
    addparent(ast.param,ast);
    addparent(ast.body,ast);
};

parentCodes["DebuggerStatement"]= function(ast){};
