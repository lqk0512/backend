#!/bin/bash#!/bin/bash

API="http://localhost:3000"
USERNAME="alice"
PASSWORD="alice123"

echo "=== 🔐 Tutor Login ==="
TOKEN=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi

echo "✅ Login successful. TOKEN: $TOKEN"
echo ""

# ==============================
# 1) Create new slot
# ==============================
echo "=== 🟩 Create New Slot ==="

# macOS date command; nếu Ubuntu thay `-v+1d -v10H -v0M` bằng `-d 'tomorrow 10:00'`
START_TIME=$(date -u -v+1d -v10H -v0M +"%Y-%m-%dT%H:%M:%SZ")
END_TIME=$(date -u -v+1d -v11H -v0M +"%Y-%m-%dT%H:%M:%SZ")

CREATE_SLOT=$(curl -s -X POST $API/tutors/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"start_time\":\"$START_TIME\",\"end_time\":\"$END_TIME\",\"room\":\"A101\",\"subject\":\"math\",\"max_students\":3}")

echo "Created slot:"
echo "$CREATE_SLOT" | jq

SLOT_ID=$(echo "$CREATE_SLOT" | jq -r '.slot_id')
echo "➡️  New Slot ID: $SLOT_ID"
echo ""

# ==============================
# 2) View all my slots
# ==============================
echo "=== 📘 My Slots ==="
curl -s -X GET $API/tutors/my-slots \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# ==============================
# 3) Update slot
# ==============================
echo "=== 🟦 Update Slot $SLOT_ID ==="

curl -s -X PUT $API/tutors/slot/$SLOT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"start_time":"2025-12-01T10:00","end_time":"2025-12-01T11:00","room":"B202","subject":"physics","max_students":5}' | jq
echo ""

# ==============================
# 4) Delete slot
# ==============================
echo "=== 🟥 Delete Slot $SLOT_ID ==="

curl -s -X DELETE $API/tutors/slot/$SLOT_ID \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 🎉 Test completed ==="

