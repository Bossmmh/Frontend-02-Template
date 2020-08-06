function getStyle(element) {
    if(!element.style) {
        element.style = {};
    }

    for(let prop in element.computedStyle) {
        var p = element.computedStyle.value;
        element.style[prop] = element.computedStyle[prop].value;

        if(element.style[prop].toString().match(/px$/)) {
            element.style[props] = parseInt(element.style[prop]);
        }

        if(element.style[prop].toString().match(/^[0-9 \.]+$/)) {
            element.style[props] = parseInt(element.style[prop]);
        }
    }

    return element.style;
}

function layout(element) {
    if(!element.computedStyle) {
        return;
    }
    var elementStyle = getStyle(element);

    if(elementStyle.display !== 'flex') {return}
    var items = element.children.filter(e => e.type === 'element')

    items.sort(function(a, b) {
        return (a.order || 0) - (b.order || 0);
    })

    var style = elementStyle;

    ['width', 'height'].forEach(size => {
        if(style[size] === 'auto' || style[size] === '') {
            style[size] = ull;
        }
    })

    if(!style.flexDirection || style.flexDirection === 'auto') {
        style.flexDirection = 'row';
    }
    if(!style.aliginItems || style.aliginItems == 'auto') {
        style.aliginItems = 'stretch';
    }
    if(!style.justifyContent || style.justifyContent === 'auto') {
        style.justifyContent = 'flex-start';
    }

    if(!style.flexWrap || style.flexWrap === 'auto') {
        style.flexWrap = 'nowarp';
    }

    if(!style.aliginContent || style.aliginContent === 'auto') {
        style.aliginContent = 'stretch';
    }

    let mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase;
    if(style.flexDirection === 'row') {  // 主轴为水平， 起点在左端
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;  // 不是+1,是为了强调是正1
        mainBase = 0;  // 从左开始或者是从右开始的这样的一个值

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }

    if(style.flexDirection === 'row-reverse') { // 主轴为水平， 起点在有段
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }

    if(style.flexDirection === 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'botom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    if(style.flexDirection === 'column-reverse') {
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }
    if(style.flexWrap === 'wrap-reverse') {
        var tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossSign = -1;
    }else {
        crossBase = 0;
        crossSign = 1;
    }
    
    let isAutoMainSize = false;
    if(!style[mainSize]) {
        elementStyle[mainSize] = 0;
        for(var i = 0; i< items.length; i++) {
            var item = items[i];
            if(itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)) {
                elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize]
            }
        }

        isAutoMainSize = true;
    }

    let flexLine = [];
    let flexLines = [flexLine];
    var mainSpace = elementStyle[mainSize];
    let crossSpace = 0;

    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let itemStyle = getStyle(item);

        if(itemStyle[mainSize] === null) {
            itemStyle[mainSize] = 0;
        }

        if(itemStyle.flex) {
            // flex 属性， 说明元素是可伸缩的， 所以一定可以放进去
            flexLine.push(item);
        }
        else if(style.flexWrap === 'nowrap' && isAutoMainSize) {
            mainSize -= itemStyle[mainSize];
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                // 下边的意思： 比如除了算行， 还要算行高
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            flexLine.push(item);
        }else {
            // 换行
            if(itemStyle[mainSize] > style[mainSize]) {
                // 元素比父级尺寸还大的情况
                itemStyle[mainSize] = style[mainSize];
            }
            if(mainSpace < itemStyle[mainSize]) {
                // 主轴里边剩下的空间不足以放下一个元素， 换行
                flexLine.mainSpace = mainSpace; // 主轴的空间存到这个行上
                flexLine.crossSpace = crossSpace; // 交叉轴的空间也放在这个行上
                flexLine = [item]; // 创建新行， 同时将item，放进去
                flexLines.push(flexLine);  // 把新的flexLine放进去所有行里边
                // 重置下边两个属性
                mainSpace = style[mainSize];
                crossSpace = 0;
            }else {
                // 可以放进去的情况
                flexLine.push(item);
            }
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                // 从计算交叉轴尺寸
                crossBase = Math.max(crossSpace, itemStyle[crossSize]);
            }
            mainSpace -= itemStyle[mainSize];
        }
    }

    flexLine.mainSpace = mainSpace;
    console.log('====items', items);
    if(style.flexWrap === 'nowarp' || isAutoMainSize) {
        flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSize] : crossSpace;
    }else {
        flexLine.crossSpace = crossSpace;
    }

    if(mainSpace < 0) {
        // 小于0 只会发生在单行的情况
        // overflow(happens only if container is single line), scale every item
        let scale = style[mainSize]/(style[mainSize]- mainSpace);
        let currentMain = mainBase;
        for(let i = 0; i< items.length; i++) {
            let item = items[i];
            let itemStyle = getStyle(item);

            if(itemStyle.flex) {
                itemStyle[mainSize] = 0;
            }

            itemStyle[mainSize] = itemStyle[mainSize] * scale; 

            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
            currentMain = itemStyle[mainEnd];
        }
    }else {
        // process each flex line
        flexLines.forEach(function (items) {
            let mainSpace = items.mainSpace;
            let flexTotal = 0;
            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                let itemStyle = getStyle(item);

                if(itemStyle.flex !== null && itemStyle.flex !== (void 0)) {
                    flexTotal += itemStyle.flex;
                    continue;
                }
            }
            if(flexTotal > 0) {
                // there is flexible flex items
                let currentMain = mainSpace;
                for(var i = 0; i < items.length; i++) {
                    let item = item[i];
                    let itemStyle = getStyle(item);
                    if(itemStyle.flex) {
                        itemStyle[mainSize] = (mainSpace/flexTotal) * itemStyle.flex;
                    }
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd];
                }
            }else {
                // there is *no* flexible felx items, which means, justifityContent shou work
                if(style.justifyContent === 'flex-start') {
                    let currentMain = mainBase;
                    let step = 0;
                }
                if(style.justifyContent === 'flex-end') {
                    let currentMain = mainSpace * mainSign + mainBase;
                    let step = 0;
                }
                if(style.justifyContent === 'center') {
                    let currentMain = mainBase/2 * mainSign + mainBase;
                    let step = 0;
                }

                if(style.justifyContent === 'space-between') {
                    let step = mainSpace / (items.length -1) * mainSign;
                    let currentMain = mainSpace;
                }

                if(style.justifyContent === 'space-around') {
                    let step = mainSpace / items.length * mainSign;
                    let currentMain = step /2 + mainBase;
                }

                for(let i = 0; i < items.length; i ++) {
                    let item = items[i];
                    let itemStyle = getStyle(item);
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd] + step;
                }
            }
        })
    }

}

module.exports = layout;