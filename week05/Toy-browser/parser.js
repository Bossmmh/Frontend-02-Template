const EOF = Symbol('EOF');
// const { match } = require('assert');
const css = require('css');

let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;

let stack = [{ type: 'document', children: [] }];

// 加入一个新的函数， addCSSRules, 这里我们把css规则暂存在一个数组里
let rules = [];
function addCSSRules(text) {
    var ast = css.parse(text);
    console.log(JSON.stringify(ast, null, "    "));
    rules.push(...ast.stylesheet.rules);
}
// 选择器如 div .a #a 
function match (element, selector) {
    if(!selector || !element.attributes){
        return false;
    }
    if(selector.charAt(0) == "#") {
        var attr = element.attributes.filter(attr => attr.name === 'id')[0];
        if(attr && attr.value === selector.replace("#", '')) {
            return true;
        }else if(selector.charAt(0) == '.') {
            var attr = element.attributes.filter(attr => attr.name === 'class')[0];
            if(attr && attr.value === selector.replace(".", "")) {
                return true;
            }
        }else {
            if(element.tagName === selector) {
                return true;
            }
        }

        return false;

    }
}

function specificity(selector) {
    // 优先级
    // [inline, id,, class, tagName]
    let p = [0,0,0,0];
    let selectorParts = selector.split(" ");
    for(let part of selectorParts) {
        if(part.charAt(0) == '#') {
            p[1] += 1;
        }else if(part.charAt(0) == '.') {
            p[2] += 1;
        }else {
            p[3] += 1;
        }
    }
    return p;

}

function compare(sp1, sp2) {
    // 优先级， 高位优先级高， 所以直接比较高位即可
    // [inline, id,, class, tagName]
    if(sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0]
    }else if(sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1]
    }else if(sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2]
    }else {
        return sp1[3] - sp2[3]
    }
}

function computeCSS(element) {
    console.log('======rules', rules);
    console.log("compute css for element", element);
    // stack.slice() 不传参数会把整个数组赋值一遍
    // reverse 是要从当前元素向外匹配，比如一个 div div #myid, 前边的div 不知道应用于哪个， 但是最后的myid 一定是应用于当前的元素
    var elements = stack.slice().reverse();
    if(!element.computedStyle) {
        element.computedStyle = {};
    }

    for(let rule of rules) {
        var selectorParts = rule.selectors[0].split(" ").reverse();

        if(!match(element, selectorParts[0])) {
            continue;
        }

        let matched = false;

        var j = 1;  // j 表示选择器的位置， i 表示元素的位置
        for(var i = 0; i< elements.length; i++) {
            if(match(elements[i], selectorParts[j])) {
                j++;
            }
        }
        if(j >= selectorParts.length){
            matched = true;
        }

        if(matched) {
            // 如果匹配到， 我们要加入
            console.log("+++Element", element, "matched rule", rule);
            let computedStyle = element.computedStyle;
            let sp = specificity(rule.selectors[0]);
            for (let declaration of rule.declarations) {
                if(!computedStyle[declaration.property]) {
                    computedStyle[declaration.property] = {};
                }
                if(!computedStyle[declaration.property].specificity) {
                    computedStyle[declaration.property].value = declaration.value;
                    computedStyle[declaration.property].specificity = sp;
                }else if(compare(computedStyle[declaration.property].specificity, sp) < 0) {
                    computedStyle[declaration.property].value = declaration.value;
                    computedStyle[declaration.property].specificity = sp;
                }
                // computedStyle[declaration.property].value = declaration.value;
            }
            console.log('====element.computedStyle', element.computedStyle);
        }
    }
    
}

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
        // top.children.push(element);
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

        computeCSS(element);

        top.children.push(element);

        if (!token.isSelfClosing) {
            stack.push(element);
        }
    } else if(token.type === 'endTag') {
        currentTextNode = null;
        if (token.tagName !== top.tagName) {
            console.log(top, token.tagName);
            throw new Error('Tag start end does not match!');
        } else {
            // 遇到style 标签时，执行添加css 规则操作
            if(top.tagName === 'style') {
                // 实际情况比较复杂， 这里只简易实现一下
                addCSSRules(top.children[0].content);
            }
            stack.pop();
        }
        currentTextNode = null;
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