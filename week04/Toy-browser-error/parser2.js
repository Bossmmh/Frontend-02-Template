let currentToken = null;
let currentAttribute = null;

let stack = [{type: 'document', children: []}];

function emit(token) {
    let top = stack[stack.length - 1];
    
    if(token.type == 'startTag') {
        let element = {
            type: 'element',
            children: [],
            attributes: []
        }

        element.tagName = token.tagName;

        for(let p in token) {
            if(p != 'type' && p != 'tagName') {
                element.attributes.push({
                    name: p,
                    value: token[p]
                })
            }
        }

        top.children.push(element);
        element.parent = top;

        if(!token.isSelfClosing) {
            stack.push(element);
        }

        currentTextNode = null;
    }else if( token.type == 'endTag') {
        if(top.tagName != token.tagName) {
            throw new Error("Tag start end doesn't match!");
        }else  {
            stack.pop();
        }
        currentTextNode = null;
    }else if(token.type == 'text') {
        if(currentTextNode == null) {
            currentTextNode = {
                type: 'text',
                content: ''
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}
const EOF = Symbol("EOF"); // EOF: end of line

function data(c) {
    if(c == "<") {
        return tagOpen;
    }else if(c == EOF) {
        emit({
            type: 'EOF'
        })
        return ;
    }else {
        emit({
            type: 'text',
            content: c
        })
        return data;
    }
}
function tagOpen(c) {
    if(c == '/') {
        return endTagOpen;
    }else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: ''
        }
        return tagName(c);
    }else {
        return ;
    }
}
function endTagOpen(c) {
    if(c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: ''
        }
        return tagName(c);
    }else if(c == '>') {

    }else if(c == EOF) {

    }else {

    }
}
// <html name = 'a'></html>
function tagName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    }else if(c == '/') {
        return selfClosingStartTag;
    }else if(c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c; //.toLowercase()
        return tagName;
    }else if(c == '>') {
        return data;
    }else {
        return tagName;
    }
}

function beforeAttributeName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    }else if(c == '>' || c == '/' || c == EOF) {
        return afterAttributeName;
    }else if(c == '=') {
        
    }else {
        currentAttribute = {
            name: '',
            value: ''
        }
        return attributeName(c);
    }
}
function attributeName(c) {
    if(c.match(/^[\t\n\f]$/) || c == '/' || c == '>' || c == EOF) {
        return afterAttributeName(c);
    }else if(c == " ") {
        return attributeName;
    }
    else if(c == '=') {
        return beforeAttributeValue;
    }else if(c == '\u0000') {

    }else if(c == "\"" || c == "'" || c == "<") {

    }else {
        currentAttribute.name += c;
        return attributeName;
    }
}
function afterAttributeName(c) {
    // return data(c);
}
function beforeAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
        return beforeAttributeValue;
    }else if(c == "\"") {
        // 使用双引号的情况
        return doubleQuoteAttributeValue;
    }else if(c == "\'") {
        // 使用单引号情况
        return singleQuoteAttributeValue;
    }else if(c == '>') {

    }else {
        // 无引号情况
        return UnquoteAttributeValue(c);
    }
}

function doubleQuoteAttributeValue(c) {
    if(c == '\"') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuoteAttributeValue;
    }else if(c == "\u0000") {

    }else if(c == EOF) {

    }else {
        currentAttribute.value += c;
        return doubleQuoteAttributeValue;
    }
}
function singleQuoteAttributeValue(c) {
    if(c == '\'') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuoteAttributeValue;
    }else if(c == "\u0000") {

    }else if(c == EOF) {

    }else {
        currentAttribute.value += c;
        // TODO 老师写的下边第一行
        // return doubleQuoteAttributeValue;
        return singleQuoteAttributeValue;
    }
}
function afterQuoteAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    }else if(c == '/') {
        return selfClosingStartTag;
    }else if(c == '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if(c == EOF) {

    }else {
        currentAttribute.value += c;
        // TODO: 单双引号合并了
        return doubleQuoteAttributeValue;
    }
}
function UnquoteAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    }else if(c == '/') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    }else if(c == '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if(c == '\u0000') {

    }else if(c == "\'" || c == "'" || c == "<" || c == "=" || c == "`") {

    }else if(c == EOF) {

    }else {
        currentAttribute.value += c;
        return UnquoteAttributeValue;
    }
}
// </div>
function selfClosingStartTag(c) {
    if(c == '>') {
        currentToken.isSelfClosing = true;
        return data;
    }else if (c == 'EOF') {

    }else {

    }
}
module.exports.parseHTML = function parseHTML(html) {
    console.log('=====html',html);
    let state = data;
    for(let c of html) {
        state = state(c)
    }
}