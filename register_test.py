import requests

url = "http://localhost:8080/api/v1/auth/register"
data = {
    "name": "ClinicFlow Demo",
    "phone": "9311736317",
    "owner_name": "Ayush",
    "owner_email": "demo@clinicflow.com",
    "password": "password123456"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    try:
        print(response.json())
    except:
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
