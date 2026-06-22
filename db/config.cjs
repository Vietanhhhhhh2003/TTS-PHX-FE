// sequelize-cli chạy ngoài Next nên phải tự nạp biến môi trường từ .env.local
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const common = {
  use_env_variable: "DATABASE_URL", // CLI sẽ lấy chuỗi kết nối từ biến này
  dialect: "postgres",
};

module.exports = {
  development: common,
  test: common,
  production: common,
};
