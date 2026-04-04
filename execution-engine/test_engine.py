import requests

url = 'http://localhost:8080'

print('--- Pinging Server ---')
try:
    print('Ping response:', requests.get(url + '/ping').text)
except Exception as e:
    print('Failed to reach server:', e)

print('\n--- Testing Python Execution ---')
p_payload = {'language': 'python', 'code': 'print("Hello Python")'}
try:
    res = requests.post(url + '/execute', json=p_payload)
    print('Status:', res.status_code, 'Response:', res.json())
except Exception as e:
    print('Error:', e)

print('\n--- Testing C++ Execution ---')
c_payload = {'language': 'cpp', 'code': '#include <iostream>\nint main() { std::cout << "Hello C++" << std::endl; return 0; }'}
try:
    res = requests.post(url + '/execute', json=c_payload)
    print('Status:', res.status_code, 'Response:', res.json())
except Exception as e:
    print('Error:', e)

print('\n--- Testing Python Timeout ---')
err_payload = {'language': 'python', 'code': 'while True: pass'}
try:
    res = requests.post(url + '/execute', json=err_payload)
    print('Status:', res.status_code, 'Response:', res.json())
except Exception as e:
    print('Error:', e)
