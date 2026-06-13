# ==============================================
# STAGE 1: BẢN BUILD (Tải thư viện & Biên dịch code)
# ==============================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy các file cấu hình package để cài dependencies trước (tận dụng cache của Docker)
COPY package*.json ./

# Cài đặt TẤT CẢ thư viện bao gồm cả devDependencies để phục vụ việc build
RUN npm ci

# Copy toàn bộ code nguồn của dự án vào container
COPY . .

# Biên dịch code TypeScript sang JavaScript (tạo ra thư mục /dist)
RUN npm run build

# Xóa các thư viện devDependencies, chỉ giữ lại thư viện chạy production để giảm dung lượng
RUN npm prune --production


# ==============================================
# STAGE 2: BẢN RUN (Chỉ chứa những thứ cần để chạy app)
# ==============================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Thiết lập biến môi trường production
ENV NODE_ENV=production

# Chỉ copy những file thực sự cần thiết từ giai đoạn builder sang
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Mở port mà app NestJS dang chay
EXPOSE 3001

# Lệnh khởi chạy ứng dụng trực tiếp từ file JavaScript đã compile
CMD ["node", "dist/main"]
