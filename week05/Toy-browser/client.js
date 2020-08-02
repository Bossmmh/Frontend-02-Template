const Request = require('./request');
const parser = require('./parser');

void async function() {
    const request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: 8088,
        path: '/',
        body: {
            name: 'liben'
        },
    });
    
    const response = await request.send();

    // console.log('response: ', response);

    const dom = parser.parseHTML(response.body);

    console.log(JSON.stringify(dom));
    
}();