module.exports = {
  root: true,
  // Kế thừa các cấu hình chuẩn của Next.js và Core Web Vitals
  extends: [
    "next",
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    // Bạn có thể thêm các rule tùy chỉnh ở đây nếu muốn
    "@typescript-eslint/no-unused-vars": "error", // Báo lỗi nếu khai báo biến mà không dùng
  },
};
