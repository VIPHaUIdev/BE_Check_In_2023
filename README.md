# BE CHECKIN BIRTHDAY VIP 2023
Project backend checkin sinh nhật năm 2023 của VIP

## Cài đặt
1. Cài đặt NodeJS (nên sử dụng v18)
2. Cài đặt MYSQL (nếu biết dùng docker thì sử dụng file docker-compose.yml để cài đặt cho nhanh)

## Cấu hình
1. Tạo file .env dựa vào file mẫu (.env.example) bằng câu lệnh dưới

```bash
cp .env.example .env

```

* Chú thích 
```
DATABASE_URL="postgresql://hit:18082010@127.0.0.1:5432/hit?schema=public" // url kết nối postgresql
JWT_SECRET=hoangdz // mã bí mật secret
JWT_ACCESS_EXPIRATION_MINUTES=30 // thời gian hết hạn token
```

2. Tải các dependencies.
```bash
npm install
```
## Mục lục
- [Đặc trưng](#đặc-trưng)
- [Dòng lệnh](#dòng-lệnh)
- [Liên hệ](#liên-hệ)

## Đặc trưng
- **Framework**: [NestJS](https://nestjs.com/) 
- **Database**: [MySQL](https://www.mysql.com/)
- **ORM**: [Prisma](https://www.prisma.io)
- **Validation**: [class-validator](https://github.com/nestjs/class-validator)
- **Docker support**

## Dòng lệnh
1. Chạy môi trường dev
```bash
npm run start:dev
```
2. Chạy môi trường production
```bash
npm start
```

3. Migrate database
```bash
npm run migrate
```

4. Thêm dữ liệu mẫu vào database
```bash
npm run seed
```

5. Docker
```bash
# Cài và chạy mysql
sudo docker compose up mysql -d
```
## Liên hệ
Nếu trong quá trình triển khai cần hỗ trợ liên hệ theo danh sách phía dưới