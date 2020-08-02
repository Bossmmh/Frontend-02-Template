const EOF = Symbol('EOF');

let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;

let stack = [{ type: 'document', children: [] }];

const emit = (token) => {
    let top = stack[stack.length - 1];

    if (token.type === 'startTag') {
        currentTextNode = null;
        let element = {
            type: 'element',
            children: [],
            attributes: [],
        };

        element.tagName = token.tagName;
        top.children.push(element);
        // element.parent = top;

        for (let a in token) {
            console.log(a);
            if (a !== 'tagName' && a !== 'type') {
                element.attributes.push({
                    name: a,
                    value: token[a],
                });
            }
        }

        if (!token.isSelfClosing) {
            stack.push(element);
        }
    } else if(token.type === 'endTag') {
        currentTextNode = null;
        if (token.tagName !== top.tagName) {
            console.log(top, token.tagName);
            throw new Error('Tag start end does not match!');
        } else {
            stack.pop();
        }
    } else if (token.type === 'text') {
        if (currentTextNode === null) {
            currentTextNode = {
                type: 'text',
                content: '',
            };
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
    // console.log(token);
};

const data = (c) => {
    if (c === '<') {
        return tagOpen;
    } else if (c === EOF) {
        emit({
            type: 'EOF'
        });
        return;
    } else {
        emit({
            type: 'text',
            content: c,
        });
        return data;
    }
};

const tagOpen = (c) => {
    if (c === '/') {
        return endTagOpen;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: '',
        };
        return tagName(c);
    } else {
        return;
    }
};

const endTagOpen = (c) => {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: '',
        };
        return tagName(c);
    }
};

const tagName = (c) => {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === '/') {
        currentToken.isSelfClosing = true;
        return selfClosingStartTag;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if (c === '>') {
        emit(currentToken);
        return data;
    } else {
        return;
    }
};

// <html lang="en">
const beforeAttributeName = (c) => {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === '/' || c === '>' || c === EOF) {
        return afterAttributeName(c);
    } else if (c === '=') {
        return beforeAttributeName;
    } else {
        currentAttribute = {
            name: '',
            value: '',
        };
        return attributeName(c);
    }
};

const attributeName = (c) => {
    if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
        return afterAttributeName(c);
    } else if (c === '=') {
        return beforeAttributeValue;
    } else if (c === '"' || c === '\'' || c === '<') {

    } else if (c === '\u0000') {

    } else {
        currentAttribute.name += c;
        return attributeName;
    }
};

const beforeAttributeValue = (c) => {
    if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
        return afterAttributeName(c);
    } else if (c === '\'') {
        return singleQuotedAttributeValue;
    } else if (c === '"') {
        return doubleQuotedAttributeValue;
    } else if (c === '>') {

    } else {
        return unquotedAttributeValue(c);
    }
};

const singleQuotedAttributeValue = (c) => {
    if (c === '\'') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterAttributeName;
    } else if (c === '\u0000') {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c;
        return singleQuotedAttributeValue;
    }
};

const doubleQuotedAttributeValue = (c) => {
    if (c === '"') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterAttributeName;
    } else if (c === '\u0000') {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
};

const unquotedAttributeValue = (c) => {
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if (c === '/') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    } else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === '\u0000') {

    } else if (c === '\'' || c === '"' || c === '<' || c === '=') {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c;
        return unquotedAttributeValue;
    }
};

const afterAttributeName = (c) => {
    if (c.match(/^[\t\f\n ]$/)) {
        return afterAttributeName;
    } else if (c === '/') {
        return selfClosingStartTag;
    } else if (c === '=') {
        return beforeAttributeValue;
    } else if (c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === EOF) {

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: '',
            value: '',
        };
        return attributeName(c);
    }
};

const selfClosingStartTag = (c) => {
    if (c === '>') {
        return data;
    }
};

const parseHTML = (html) => {
    console.log('html: ', html);
    let state = data;
    for (let c of html) {
        state = state(c);
    }

    state = state(EOF);

    console.log('----done----');

    return stack[0];
};

exports.parseHTML = parseHTML;