const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    let body = [];

    req.on('data', (chunk) => {
        console.log('data: ', chunk.toString());
        body.push(chunk.toString());
    })
    .on('end', () => {
        res.writeHead(200, {
            'Content-Type': 'text/html',
        });
        const buffer = fs.readFileSync('./index.html');
        res.write(buffer.toString());
        res.end();
    })
    .on('error', (err) => {
        console.log('err: ', err);
    });
});

server
.on('error', (err) => {
    console.log('err: ', err);
})
.listen(8088);

console.log('the server is started');