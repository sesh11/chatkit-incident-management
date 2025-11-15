"""
Python test script for ChatKit Incident Management API.
"""
import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"


def test_request(
    description: str,
    method: str,
    endpoint: str,
    headers: Dict[str, str] = None,
    data: Dict[str, Any] = None
):
    """Make a test request and print results."""
    print(f"\n{'='*60}")
    print(f"{description}")
    print(f"{'='*60}")

    url = f"{BASE_URL}{endpoint}"
    default_headers = {"Content-Type": "application/json"}

    if headers:
        default_headers.update(headers)

    try:
        if method == "GET":
            response = requests.get(url, headers=default_headers)
        elif method == "POST":
            response = requests.post(url, headers=default_headers, json=data)
        else:
            print(f"Unknown method: {method}")
            return

        print(f"Status: {response.status_code}")
        print(f"Response:")
        print(json.dumps(response.json(), indent=2))

    except Exception as e:
        print(f"Error: {str(e)}")


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("ChatKit Incident Management API Tests")
    print("="*60)

    # Test 1: Health check
    test_request(
        "1. Health Check",
        "GET",
        "/health"
    )

    # Test 2: IT Admin - View technical logs
    test_request(
        "2. IT Admin - View Technical Logs",
        "POST",
        "/api/simple-chat",
        headers={"X-User-Role": "IT", "X-User-Id": "it-admin-001"},
        data={"message": "Show me the technical logs for incident INC-001"}
    )

    # Test 3: IT Admin - Restart service
    test_request(
        "3. IT Admin - Restart Service",
        "POST",
        "/api/simple-chat",
        headers={"X-User-Role": "IT", "X-User-Id": "it-admin-001"},
        data={"message": "Restart the Redis Cache service"}
    )

    # Test 4: Operations Director - Set priority
    test_request(
        "4. Operations Director - Set Priority",
        "POST",
        "/api/simple-chat",
        headers={"X-User-Role": "OPS", "X-User-Id": "ops-director-001"},
        data={"message": "Set incident INC-001 priority to P1"}
    )

    # Test 5: Finance Controller - View cost impact
    test_request(
        "5. Finance Controller - View Cost Impact",
        "POST",
        "/api/simple-chat",
        headers={"X-User-Role": "FINANCE", "X-User-Id": "finance-controller-001"},
        data={"message": "What is the cost impact of incident INC-001?"}
    )

    # Test 6: Customer Success - Notify customers
    test_request(
        "6. Customer Success - Notify Customers",
        "POST",
        "/api/simple-chat",
        headers={"X-User-Role": "CSM", "X-User-Id": "csm-manager-001"},
        data={"message": "Send a notification to enterprise customers about INC-001"}
    )

    # Test 7: Permission Denial - Finance tries to restart service
    test_request(
        "7. Permission Denial - Finance Tries to Restart Service",
        "POST",
        "/api/simple-chat",
        headers={"X-User-Role": "FINANCE", "X-User-Id": "finance-controller-001"},
        data={"message": "Restart the Redis Cache service"}
    )

    # Test 8: List incidents (IT view)
    test_request(
        "8. List Incidents - IT View",
        "GET",
        "/api/incidents",
        headers={"X-User-Role": "IT", "X-User-Id": "it-admin-001"}
    )

    # Test 9: List incidents (Finance view)
    test_request(
        "9. List Incidents - Finance View",
        "GET",
        "/api/incidents",
        headers={"X-User-Role": "FINANCE", "X-User-Id": "finance-controller-001"}
    )

    # Test 10: Get permissions for role
    test_request(
        "10. Get Permissions - IT Role",
        "GET",
        "/api/permissions/IT"
    )

    print("\n" + "="*60)
    print("Tests Complete!")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
