import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from users.models import User
import traceback

c = Client()
user = User.objects.filter(role='ADULT').first()
c.force_login(user)

try:
    response = c.post('/api/planner/sessions/', {
        'subject_name': 'Test',
        'topic_name': 'Test Topic',
        'date': '2026-08-28',
        'start_time': '15:00:00',
        'end_time': '16:00:00'
    }, content_type='application/json', HTTP_HOST='127.0.0.1:8000')
    if response.status_code >= 400:
        print(f"Status Code: {response.status_code}")
        # Parse the Django debug HTML and extract the exception
        import re
        html = response.content.decode('utf-8')
        match = re.search(r'Exception Value:\s*</dt>\s*<dd>\s*(.*?)\s*</dd>', html, re.DOTALL)
        if match:
            print("EXCEPTION VALUE:", match.group(1))
        
        match = re.search(r'<textarea id="traceback_area".*?>(.*?)</textarea>', html, re.DOTALL)
        if match:
            import html as html_lib
            print("TRACEBACK:", html_lib.unescape(match.group(1)))
except Exception as e:
    traceback.print_exc()
