# Hướng Dẫn Chạy Dự Án

## 1. Yêu cầu môi trường
- Node.js ≥ 18
- npm ≥ 9
- (Tuỳ chọn) jq để format JSON khi chạy script test

## 2. Cài đặt dependencies
Chạy lệnh:
npm install

## 3. Chạy server
Khởi động API backend:
node app.js

Server mặc định chạy tại:
http://localhost:3000

## 4. Chạy script test API
Cấp quyền thực thi:
chmod +x test-api.sh
chmod +x test.sh

Chạy test:
./test-api.sh
./test.sh
