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
echo

# --- Xem tất cả slot của tutor ---
echo "--- Tutor: My Slots ---"
curl -s -X GET $API_URL/tutors/my-slots \
  -H "Authorization: Bearer $TUTOR_TOKEN" \
  -H "Content-Type: application/json" | jq
echo

# --- Tạo slot mới ---
echo "--- Creating new slot ---"
START_TIME=$(date -u -v+1d -v10H -v0M +"%Y-%m-%dT%H:%M:%SZ")
END_TIME=$(date -u -v+1d -v11H -v0M +"%Y-%m-%dT%H:%M:%SZ")
ROOM="A101"
SUBJECT="math"
MAX_STUDENTS=3

CREATE_SLOT=$(curl -s -X POST $API_URL/tutors/create \
  -H "Authorization: Bearer $TUTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"start_time\":\"$START_TIME\",\"end_time\":\"$END_TIME\",\"room\":\"$ROOM\",\"subject\":\"$SUBJECT\",\"max_students\":$MAX_STUDENTS}")

echo "Created slot:"
echo "$CREATE_SLOT" | jq


# --- Student login ---
USERNAME="john"
PASSWORD="john123"
STUDENT_ID=3
SUBJECT="math"

# --- Login ---
TOKEN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Login failed!"
  exit 1
fi

echo "Login OK"
echo

# --- Lấy danh sách tutor theo môn và slot trống ---
echo "=== Tutors teaching $SUBJECT with available slots ==="

TUTORS=$(curl -s -X GET $API_URL/tutors/subject/$SUBJECT \
  -H "Authorization: Bearer $TOKEN")

# Lấy tutor_id có slot trống (current_students < max_students)
TUTOR_ID=$(echo "$TUTORS" | jq -r '.[] | select(.freeSlots | length > 0) | .tutor_id' | head -n1)
SLOT_ID=$(echo "$TUTORS" | jq -r ".[] | select(.tutor_id==$TUTOR_ID) | .freeSlots[0].slot_id")

echo "📌 Booking slot $SLOT_ID of tutor $TUTOR_ID..."
BOOKING=$(curl -s -X POST $API_URL/bookings/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"tutor_id\":$TUTOR_ID, \"slot_id\":$SLOT_ID}")

echo "Booking result:"
echo "$BOOKING" | jq
echo

# --- Xem danh sách booking hiện tại của student ---
echo "=== My bookings ==="
curl -s -X GET $API_URL/bookings/student/$STUDENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
echo

# --- Xem danh sách booking của tutor ---
echo "=== Tutor's bookings ==="
curl -s -X GET $API_URL/tutors/bookings/$TUTOR_ID \
  -H "Authorization: Bearer $TUTOR_TOKEN" \
  -H "Content-Type: application/json" | jq
echo