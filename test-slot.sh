#!/bin/bash

API="http://localhost:3000"
USERNAME="alice"
PASSWORD="alice123"

echo "=== 🔐 Đăng nhập tutor ==="
TOKEN=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Không login được"
  exit 1
fi

echo "✅ Login OK. TOKEN: $TOKEN"
echo ""

# ==============================
# 1) Tạo slot
# ==============================
echo "=== 🟩 Tạo slot mới ==="

START_TIME=$(date -u -v+1d -v10H -v0M +"%Y-%m-%dT%H:%M:%SZ")
END_TIME=$(date -u -v+1d -v11H -v0M +"%Y-%m-%dT%H:%M:%SZ")

echo "START_TIME = $START_TIME"
echo "END_TIME   = $END_TIME"

CREATE_SLOT=$(curl -s -X POST $API/tutors/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"start_time\":\"$START_TIME\",\"end_time\":\"$END_TIME\"}")

echo "Created slot:"
echo "$CREATE_SLOT" | jq

SLOT_ID=$(echo "$CREATE_SLOT" | jq -r '.slot_id')
echo "➡️  Slot ID mới: $SLOT_ID"
echo ""

# ==============================
# 2) Xem slot của chính tutor
# ==============================
echo "=== 📘 Lấy danh sách slot của tutor ==="

curl -s -X GET $API/tutors/my-slots \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# ==============================
# 3) Cập nhật slot
# ==============================
echo "=== 🟦 Cập nhật slot $SLOT_ID ==="

curl -s -X PUT $API/tutors/slot/$SLOT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"start_time":"2025-01-05T10:00","end_time":"2025-01-05T11:00"}' | jq

echo ""

# ==============================
# 4) Xoá slot
# ==============================
echo "=== 🟥 Xoá slot $SLOT_ID ==="

curl -s -X DELETE $API/tutors/slot/$SLOT_ID \
  -H "Authorization: Bearer $TOKEN" | jq

echo ""
echo "=== 🎉 Test hoàn tất ==="
