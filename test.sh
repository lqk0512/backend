#!/bin/bash

# ======= Cấu hình =======
USERNAME="john"
PASSWORD="john123"
STUDENT_ID=3          # userId của student
API_URL="http://localhost:3000"
BOOKING1_ID=2  
BOOKING2_ID=1

# ======= Login =======
TOKEN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Login failed!"
  exit 1
fi

echo "✅ Login thành công. Token: $TOKEN"
echo

# ======= Hủy slot hiện tại (không xóa booking) =======
echo "=== Hủy slot hiện tại của booking $BOOKING1_ID ==="
curl -s -X PUT $API_URL/bookings/cancel/$BOOKING1_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
echo

# ======= Lấy danh sách slot trống của tutor =======
echo "=== Lấy danh sách slot trống của tutor để đổi ==="
RESPONSE=$(curl -s -X GET $API_URL/bookings/free-slots/$BOOKING2_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# Lấy slot_id đầu tiên trống
NEW_SLOT_ID=$(echo "$RESPONSE" | jq -r '.freeSlots[0].slot_id')

if [ -z "$NEW_SLOT_ID" ] || [ "$NEW_SLOT_ID" = "null" ]; then
  echo "❌ Không có slot trống để đổi"
  exit 0
fi

echo "📌 Đổi booking $BOOKING2_ID sang slot $NEW_SLOT_ID..."

# ======= Đổi slot =======
curl -s -X PUT $API_URL/bookings/reschedule \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"booking_id\":$BOOKING2_ID, \"new_slot_id\":$NEW_SLOT_ID}" | jq
echo

# ======= Kiểm tra lại booking của student =======
echo "=== Danh sách booking của student ==="
curl -s -X GET $API_URL/bookings/student/$STUDENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
echo
