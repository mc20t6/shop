## Tao auth

nest g module auth
nest g controller auth
nest g service auth

## Database

Ket noi MongoDB Atlas bang `MONGODB_URI` trong file `.env`.

Code database nam trong:

- `src/database/mongodb`: cau hinh ket noi MongoDB
- `src/database/entities`: Mongoose schema/entity
- `src/database/repositories`: repository thao tac database

## Cai thu vien login/register

npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/bcrypt
npm install class-validator class-transformer

## lenh test

npm run test
npm run test:cov

## Cách Build và Chạy Thử Container

docker build -t nestjs-app:latest .
docker run -d -p 3001:3001 --name my-nest-app nestjs-app:latest
http://localhost:3001/healthz

## Cài đặt thư viện Swagger

npm install @nestjs/swagger swagger-ui-express

## Cai mongoose

npm i @nestjs/mongoose mongoose @nestjs/config
