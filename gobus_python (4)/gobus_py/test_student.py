import http.client, json, sys

sys.stdout.reconfigure(encoding='utf-8')

c = http.client.HTTPConnection('localhost', 3000)

def api(method, path, body=None):
    headers = {'Content-Type': 'application/json'}
    c.request(method, path, json.dumps(body) if body else None, headers)
    r = c.getresponse()
    # Read full response including headers for debugging
    data = r.read().decode('utf-8')
    try:
        return json.loads(data), r.status
    except:
        return data, r.status

# 1. Login
data, status = api('POST', '/api/auth/login', {'email': 'test_student@test.com', 'password': '123456'})
print("LOGIN status:", status)
print("LOGIN data:", json.dumps(data, ensure_ascii=False))

# 2. Student verify
data2, status2 = api('POST', '/api/auth/student-verify', {'student_id': '20240001', 'school': 'DH Bach Khoa'})
print("VERIFY status:", status2)
print("VERIFY data:", json.dumps(data2, ensure_ascii=False))

# 3. Check /api/auth/me
data3, status3 = api('GET', '/api/auth/me')
print("ME status:", status3)
print("ME data:", json.dumps(data3, ensure_ascii=False))
print("ME student_verified type:", repr(data3.get('student_verified')))