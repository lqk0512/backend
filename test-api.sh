#!/bin/bash

API_URL="http://localhost:3000"

# --- Tutor login ---
TUTOR_USERNAME="alice"
TUTOR_PASSWORD="alice123"

echo "--- Tutor login ---"
TUTOR_TOKEN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TUTOR_USERNAME\",\"password\":\"$TUTOR_PASSWORD\"}" | jq -r '.token')

echo "Tutor TOKEN: $TUTOR_TOKEN"

# -----------------------------
# Tutor: view all my slots (booked + available)
# -----------------------------
echo "--- Tutor: My Slots ---"
curl -s -X GET $API_URL/tutors/my-slots \
  -H "Authorization: Bearer $TUTOR_TOKEN" \
  -H "Content-Type: application/json" | jq

# --- Create new slot ---
echo "--- Creating new slot ---"

# macOS date: nếu dùng Ubuntu, đổi `-v+1d -v10H -v0M` -> `-d 'tomorrow 10:00' +%Y-%m-%dT%H:%M:%SZ`
START_TIME=$(date -u -v+1d -v10H -v0M +"%Y-%m-%dT%H:%M:%SZ")
END_TIME=$(date -u -v+1d -v11H -v0M +"%Y-%m-%dT%H:%M:%SZ")

echo "START_TIME = $START_TIME"
echo "END_TIME   = $END_TIME"

CREATE_SLOT=$(curl -s -X POST $API_URL/tutors/create \
  -H "Authorization: Bearer $TUTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"start_time\":\"$START_TIME\",\"end_time\":\"$END_TIME\"}")

echo "Created slot:"
echo "$CREATE_SLOT" | jq

SLOT_ID=$(echo "$CREATE_SLOT" | jq -r '.slot_id')
TUTOR_ID=$(echo "$CREATE_SLOT" | jq -r '.tutor_id')


#!/bin/bash

# ======= Cấu hình =======
USERNAME="john"
PASSWORD="john123"
STUDENT_ID=3          # userId của student
API_URL="http://localhost:3000"
SUBJECT="math"        # môn học muốn book

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

# ======= Lấy danh sách tutor theo môn + slot trống =======
echo "=== Danh sách tutor dạy môn $SUBJECT có slot trống ==="

TUTORS=$(curl -s -X GET $API_URL/tutors/subject/$SUBJECT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# Lấy tutor_id của tutor có ít nhất 1 slot trống
TUTOR_ID=$(echo "$TUTORS" | jq -r '.[] | select(.freeSlots | length > 0) | .tutor_id' | head -n1)

if [ -z "$TUTOR_ID" ]; then
  echo "❌ Không có tutor nào dạy môn $SUBJECT và có slot trống"
  exit 0
fi

# Lấy slot_id đầu tiên trống của tutor
SLOT_ID=$(echo "$TUTORS" | jq -r ".[] | select(.tutor_id==$TUTOR_ID) | .freeSlots[0].slot_id")

echo "📌 Booking slot $SLOT_ID của tutor $TUTOR_ID..."
BOOKING=$(curl -s -X POST $API_URL/bookings/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"tutor_id\":$TUTOR_ID, \"slot_id\":$SLOT_ID}")

echo "✅ Booking result:"
echo "$BOOKING" | jq
echo

# ======= Lấy danh sách booking của student =======
echo "=== Danh sách booking của student ==="
curl -s -X GET $API_URL/bookings/student/$STUDENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
echo
# ========================