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

curl -s -X GET http://localhost:3000/bookings/recommend/3 \
  -H "Authorization: Bearer $TOKEN" \
  | jq
echo