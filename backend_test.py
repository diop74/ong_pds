import requests
import sys
import json
from datetime import datetime

class PorteDuSavoirAPITester:
    def __init__(self, base_url="https://udditaare-ganndal.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                print(f" Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")

            return success, response.json() if success and response.text else {}

        except Exception as e:
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            print(f" Failed - Error: {str(e)}")
            return False, {}

    def test_seed_data(self):
        """Initialize seed data"""
        print("\n Initializing seed data...")
        success, response = self.run_test("Seed Data", "POST", "seed", 200)
        return success

    def test_admin_login(self):
        """Test admin login and get token"""
        print("\n Testing Admin Authentication...")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@portedusavoir.org", "password": "Admin123!"}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_public_endpoints(self):
        """Test all public endpoints"""
        print("\n📊 Testing Public Endpoints...")
        
        # Stats
        self.run_test("Public Stats", "GET", "stats", 200)
        
        # Projects
        self.run_test("Get Projects", "GET", "projects", 200)
        
        # Articles
        self.run_test("Get Articles", "GET", "articles", 200)
        
        # Members
        self.run_test("Get Members", "GET", "members", 200)
        
        # Documents
        self.run_test("Get Documents", "GET", "documents", 200)
        
        # Site Content
        self.run_test("Get Site Content", "GET", "content", 200)

    def test_contact_functionality(self):
        """Test contact form"""
        print("\n📧 Testing Contact Functionality...")
        
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Message",
            "message": "This is a test message from automated testing."
        }
        
        self.run_test("Send Contact Message", "POST", "contact", 200, data=contact_data)

    def test_member_application(self):
        """Test member application"""
        print("\n👥 Testing Member Application...")
        
        member_data = {
            "name": "Test Member",
            "email": "testmember@example.com",
            "phone": "+222 12 34 56 78",
            "motivation": "Je souhaite contribuer à l'éducation dans ma communauté."
        }
        
        success, response = self.run_test("Apply for Membership", "POST", "members/apply", 200, data=member_data)
        return response.get('id') if success else None

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        if not self.token:
            print(" No admin token available, skipping admin tests")
            return
            
        print("\n🔒 Testing Admin Endpoints...")
        
        # Admin stats
        self.run_test("Admin Stats", "GET", "admin/stats", 200, auth_required=True)
        
        # Get contact messages
        self.run_test("Get Contact Messages", "GET", "contact", 200, auth_required=True)
        
        # Get pending members
        self.run_test("Get Pending Members", "GET", "members/pending", 200, auth_required=True)

    def test_project_crud(self):
        """Test project CRUD operations"""
        if not self.token:
            print(" No admin token available, skipping project CRUD tests")
            return
            
        print("\n📁 Testing Project CRUD...")
        
        # Create project
        project_data = {
            "title": "Test Project",
            "description": "This is a test project created by automated testing.",
            "objectives": "Test the project creation functionality",
            "status": "en_cours",
            "date": "2024-01-01"
        }
        
        success, response = self.run_test("Create Project", "POST", "projects", 200, data=project_data, auth_required=True)
        
        if success and 'id' in response:
            project_id = response['id']
            print(f"   Created project ID: {project_id}")
            
            # Get specific project
            self.run_test("Get Specific Project", "GET", f"projects/{project_id}", 200)
            
            # Update project
            updated_data = {**project_data, "title": "Updated Test Project"}
            self.run_test("Update Project", "PUT", f"projects/{project_id}", 200, data=updated_data, auth_required=True)
            
            # Delete project
            self.run_test("Delete Project", "DELETE", f"projects/{project_id}", 200, auth_required=True)

    def test_article_crud(self):
        """Test article CRUD operations"""
        if not self.token:
            print(" No admin token available, skipping article CRUD tests")
            return
            
        print("\n📰 Testing Article CRUD...")
        
        # Create article
        article_data = {
            "title": "Test Article",
            "content": "This is a test article created by automated testing. It contains sample content to verify the article creation functionality.",
            "excerpt": "Test article excerpt",
            "category": "Test",
            "published": True
        }
        
        success, response = self.run_test("Create Article", "POST", "articles", 200, data=article_data, auth_required=True)
        
        if success and 'id' in response:
            article_id = response['id']
            print(f"   Created article ID: {article_id}")
            
            # Get specific article
            self.run_test("Get Specific Article", "GET", f"articles/{article_id}", 200)
            
            # Update article
            updated_data = {**article_data, "title": "Updated Test Article"}
            self.run_test("Update Article", "PUT", f"articles/{article_id}", 200, data=updated_data, auth_required=True)
            
            # Delete article
            self.run_test("Delete Article", "DELETE", f"articles/{article_id}", 200, auth_required=True)

    def test_upload_endpoints(self):
        """Test file upload endpoints"""
        if not self.token:
            print(" No admin token available, skipping upload tests")
            return
            
        print("\n Testing Upload Endpoints...")
        
        # Test image upload endpoint (without actual file - just endpoint availability)
        print("   Testing image upload endpoint availability...")
        url = f"{self.base_url}/api/upload/image"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            # Test with no file (should return 422 - validation error)
            response = requests.post(url, headers=headers, timeout=10)
            if response.status_code == 422:
                print(" Image upload endpoint available (422 - missing file expected)")
                self.tests_passed += 1
            else:
                print(f"  Image upload endpoint returned {response.status_code} (expected 422)")
            self.tests_run += 1
        except Exception as e:
            print(f" Image upload endpoint error: {e}")
            self.tests_run += 1
            self.failed_tests.append({'name': 'Image Upload Endpoint', 'error': str(e)})
        
        # Test document upload endpoint (without actual file - just endpoint availability)
        print("   Testing document upload endpoint availability...")
        url = f"{self.base_url}/api/upload/document"
        
        try:
            # Test with no file (should return 422 - validation error)
            response = requests.post(url, headers=headers, timeout=10)
            if response.status_code == 422:
                print(" Document upload endpoint available (422 - missing file expected)")
                self.tests_passed += 1
            else:
                print(f"  Document upload endpoint returned {response.status_code} (expected 422)")
            self.tests_run += 1
        except Exception as e:
            print(f" Document upload endpoint error: {e}")
            self.tests_run += 1
            self.failed_tests.append({'name': 'Document Upload Endpoint', 'error': str(e)})

    def test_member_management(self):
        """Test admin member management (create/update members directly)"""
        if not self.token:
            print(" No admin token available, skipping member management tests")
            return
            
        print("\n👥 Testing Admin Member Management...")
        
        # Create member directly (admin function)
        member_data = {
            "name": "Test Admin Member",
            "email": "testadmin@example.com",
            "phone": "+222 98 76 54 32",
            "member_type": "actif",
            "bio": "Test member created by admin for testing purposes."
        }
        
        success, response = self.run_test("Admin Create Member", "POST", "members", 200, data=member_data, auth_required=True)
        
        if success and 'id' in response:
            member_id = response['id']
            print(f"   Created member ID: {member_id}")
            
            # Update member
            updated_data = {
                **member_data,
                "name": "Updated Test Admin Member",
                "member_type": "fondateur",
                "bio": "Updated bio for test member."
            }
            self.run_test("Admin Update Member", "PUT", f"members/{member_id}", 200, data=updated_data, auth_required=True)
            
            # Clean up - delete the test member
            self.run_test("Delete Test Member", "DELETE", f"members/{member_id}", 200, auth_required=True)

    def test_static_file_serving(self):
        """Test that uploads directory is accessible"""
        print("\n📁 Testing Static File Serving...")
        
        # Test uploads directory accessibility (should return 404 for non-existent file, not 403)
        url = f"{self.base_url}/uploads/images/nonexistent.jpg"
        
        try:
            response = requests.get(url, timeout=10)
            # 404 means the static serving is working but file doesn't exist (expected)
            # 403 would mean static serving is blocked
            if response.status_code in [404, 200]:
                print("✅ Static file serving is configured (uploads directory accessible)")
                self.tests_passed += 1
            else:
                print(f"⚠️  Static serving returned {response.status_code} (expected 404 or 200)")
            self.tests_run += 1
        except Exception as e:
            print(f" Static file serving error: {e}")
            self.tests_run += 1
            self.failed_tests.append({'name': 'Static File Serving', 'error': str(e)})

    def print_summary(self):
        """Print test summary"""
        print(f"\n" + "="*60)
        print(f" TEST SUMMARY")
        print(f"="*60)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            print(f"\nFAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"{i}. {test['name']}")
                if 'error' in test:
                    print(f"   Error: {test['error']}")
                else:
                    print(f"   Expected: {test['expected']}, Got: {test['actual']}")
                    print(f"   Response: {test['response']}")
        
        return len(self.failed_tests) == 0

def main():
    print(" Starting Porte du Savoir API Testing...")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tester = PorteDuSavoirAPITester()
    
    # Run all tests
    tester.test_seed_data()
    tester.test_admin_login()
    tester.test_public_endpoints()
    tester.test_contact_functionality()
    tester.test_member_application()
    tester.test_admin_endpoints()
    tester.test_project_crud()
    tester.test_article_crud()
    tester.test_upload_endpoints()
    tester.test_member_management()
    tester.test_static_file_serving()
    
    # Print summary and return appropriate exit code
    success = tester.print_summary()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())