import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function
async function serveFile(filePath, contentType, res) {
    try {
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (error) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>');
    }
}

const server = http.createServer(async (req, res) => {
    const url = req.url;

    if (url === '/' || url === '/index.html') {
        await serveFile(path.join(__dirname, 'public', 'index.html'), 'text/html', res);
    }
    else if (url === '/about') {
        await serveFile(path.join(__dirname, 'public', 'about.html'), 'text/html', res);
    }
    else if (url === '/style.css') {
        await serveFile(path.join(__dirname, 'public', 'style.css'), 'text/css', res);
    }
    else if (url.startsWith('/images/')) {
        const ext = path.extname(url);
        const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
        await serveFile(path.join(__dirname, 'public', url), contentType, res);
    }
    else if (url === '/api/data') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Hello!', time: new Date().toISOString() }));
    }
    else if (url === '/api/contact' && req.method === 'POST') {
        let body = '';

        // Collect data chunks
        req.on('data', chunk => {
            body += chunk.toString();
        });

        // Process when complete
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log('Received:', data);

                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Data received!'
                }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Not Found</h1>');
    }

    server.listen(3000, () => {
        console.log('Server running on http:localhost:3000/');
    });
});