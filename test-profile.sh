# ======= Cấu hình =======
USERNAME="john"
PASSWORD="john123"
STUDENT_ID=3          # userId của student
API_URL="http://localhost:3000"
TUTOR_USERNAME="alice"
TUTOR_PASSWORD="alice123"

echo "--- Tutor login ---"
TUTOR_TOKEN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TUTOR_USERNAME\",\"password\":\"$TUTOR_PASSWORD\"}" | jq -r '.token')

echo "Tutor TOKEN: $TUTOR_TOKEN"
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
# ======= Lấy thông tin profile =======
echo "=== Thông tin profile của user ==="
curl -s -X GET $API_URL/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq
echo
# ======= Lấy thông tin profile của tutor =======
echo "=== Thông tin profile của tutor ==="
curl -s -X GET $API_URL/auth/profile \
  -H "Authorization: Bearer $TUTOR_TOKEN" \
  -H "Content-Type: application/json" | jq
echo