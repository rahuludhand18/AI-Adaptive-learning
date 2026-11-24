import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from users.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import traceback

def run_test():
    c = Client()
    user = User.objects.filter(role='ADULT').first()
    if not user:
        user = User.objects.create_user(
            username='test_adult_user@example.com',
            email='test_adult_user@example.com',
            password='TestPassword123!',
            role='ADULT'
        )
    
    token = str(RefreshToken.for_user(user).access_token)
    
    try:
        response = c.post(
            '/api/planner/sessions/',
            {
                'subject_name': 'Test',
                'topic_name': 'Test Topic',
                'date': '2026-08-28',
                'start_time': '15:00:00',
                'end_time': '16:00:00'
            },
            content_type='application/json',
            HTTP_HOST='127.0.0.1:8000',
            HTTP_AUTHORIZATION=f'Bearer {token}'
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code >= 400:
            import re
            html = response.content.decode('utf-8')
            match = re.search(r'Exception Value:\s*</dt>\s*<dd>\s*(.*?)\s*</dd>', html, re.DOTALL)
            if match:
                print("EXCEPTION VALUE:", match.group(1))
            
            match = re.search(r'<textarea id="traceback_area".*?>(.*?)</textarea>', html, re.DOTALL)
            if match:
                import html as html_lib
                print("TRACEBACK:", html_lib.unescape(match.group(1)))
        else:
            print("Response:", response.json())
    except Exception as e:
        traceback.print_exc()

if __name__ == '__main__':
    run_test()
