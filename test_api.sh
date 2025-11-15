#!/bin/bash
# Test script for ChatKit Incident Management API

BASE_URL="http://localhost:8000"

echo "========================================="
echo "ChatKit Incident Management API Tests"
echo "========================================="
echo ""

# Test 1: Health check
echo "1. Health Check"
echo "---------------"
curl -s "$BASE_URL/health" | jq '.'
echo ""
echo ""

# Test 2: IT Admin - View technical logs
echo "2. IT Admin - View Technical Logs"
echo "----------------------------------"
curl -s -X POST "$BASE_URL/api/simple-chat" \
  -H "Content-Type: application/json" \
  -H "X-User-Role: IT" \
  -H "X-User-Id: it-admin-001" \
  -d '{"message": "Show me the technical logs for incident INC-001"}' | jq '.'
echo ""
echo ""

# Test 3: IT Admin - Restart service
echo "3. IT Admin - Restart Service"
echo "------------------------------"
curl -s -X POST "$BASE_URL/api/simple-chat" \
  -H "Content-Type: application/json" \
  -H "X-User-Role: IT" \
  -H "X-User-Id: it-admin-001" \
  -d '{"message": "Restart the Redis Cache service"}' | jq '.'
echo ""
echo ""

# Test 4: Operations Director - Set priority
echo "4. Operations Director - Set Priority"
echo "--------------------------------------"
curl -s -X POST "$BASE_URL/api/simple-chat" \
  -H "Content-Type: application/json" \
  -H "X-User-Role: OPS" \
  -H "X-User-Id: ops-director-001" \
  -d '{"message": "Set incident INC-001 priority to P1"}' | jq '.'
echo ""
echo ""

# Test 5: Finance Controller - View cost impact
echo "5. Finance Controller - View Cost Impact"
echo "-----------------------------------------"
curl -s -X POST "$BASE_URL/api/simple-chat" \
  -H "Content-Type: application/json" \
  -H "X-User-Role: FINANCE" \
  -H "X-User-Id: finance-controller-001" \
  -d '{"message": "What is the cost impact of incident INC-001?"}' | jq '.'
echo ""
echo ""

# Test 6: Customer Success - Notify customers
echo "6. Customer Success - Notify Customers"
echo "---------------------------------------"
curl -s -X POST "$BASE_URL/api/simple-chat" \
  -H "Content-Type: application/json" \
  -H "X-User-Role: CSM" \
  -H "X-User-Id: csm-manager-001" \
  -d '{"message": "Send a notification to enterprise customers about INC-001 saying we are working on the database issue"}' | jq '.'
echo ""
echo ""

# Test 7: Permission Denial - Finance tries to restart service
echo "7. Permission Denial - Finance Tries to Restart Service"
echo "--------------------------------------------------------"
curl -s -X POST "$BASE_URL/api/simple-chat" \
  -H "Content-Type: application/json" \
  -H "X-User-Role: FINANCE" \
  -H "X-User-Id: finance-controller-001" \
  -d '{"message": "Restart the Redis Cache service"}' | jq '.'
echo ""
echo ""

# Test 8: List incidents (IT view)
echo "8. List Incidents - IT View"
echo "----------------------------"
curl -s "$BASE_URL/api/incidents" \
  -H "X-User-Role: IT" \
  -H "X-User-Id: it-admin-001" | jq '.'
echo ""
echo ""

# Test 9: List incidents (Finance view)
echo "9. List Incidents - Finance View"
echo "---------------------------------"
curl -s "$BASE_URL/api/incidents" \
  -H "X-User-Role: FINANCE" \
  -H "X-User-Id: finance-controller-001" | jq '.'
echo ""
echo ""

# Test 10: Get permissions for role
echo "10. Get Permissions - IT Role"
echo "------------------------------"
curl -s "$BASE_URL/api/permissions/IT" | jq '.'
echo ""
echo ""

echo "========================================="
echo "Tests Complete!"
echo "========================================="
