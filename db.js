// db.js
const sql = require("mssql");

const config = {
  user: "quanly", // từ bạn cung cấp
  password: "quanly123",
  server: "GHEIUDAUCUAE\\MINHCHISQL", // chú ý dấu \\ cho tên máy chủ có dấu \
  database: "QUANLYNCC", // đảm bảo đã import từ file SQL bạn gửi
  options: {
    encrypt: false,               // không cần mã hóa (nếu chạy nội bộ)
    trustServerCertificate: true // tin cậy chứng chỉ tự ký
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ Đã kết nối tới SQL Server thành công");
    return pool;
  })
  .catch(err => {
    console.error("❌ Lỗi kết nối SQL Server:", err);
  });

module.exports = {
  sql,
  poolPromise
};


