const http = require('http');

async function sendRequest(path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      port: 8080,
      path: path,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let result = '';
      res.on('data', chunk => result += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: result }));
    });

    req.on('error', e => reject(e));

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  try {
    console.log('--- Pinging Server ---');
    console.log(await sendRequest('/ping'));

    console.log('\n--- Testing Python Execution ---');
    console.log(await sendRequest('/execute', { language: 'python', code: 'print("Hello Python")' }));

    console.log('\n--- Testing C++ Execution ---');
    console.log(await sendRequest('/execute', { language: 'cpp', code: '#include <iostream>\nint main() { std::cout << "Hello C++" << std::endl; return 0; }' }));

    console.log('\n--- Testing Python Timeout ---');
    const start = Date.now();
    console.log(await sendRequest('/execute', { language: 'python', code: 'while True: pass' }));
    console.log(`Timeout test took ${Date.now() - start}ms`);

  } catch (err) {
    console.error(err);
  }
})();
