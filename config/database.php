<?php
class Database
{
    private $host = "mysql-39ead0ed-pisitpong04-f1bb.f.aivencloud.com";
    private $port = 19984;
    private $db_name = "attendance_system";
    private $username = "avnadmin";
    private $password = "AVNS_vFanweHIa3KlQxJ9yvC";
    private $conn;

    public function getConnection()
    {
        $this->conn = null;
        try {
            // สำหรับ Aiven Cloud ที่ต้องใช้ SSL
            $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . ";charset=utf8mb4";

            // SSL Options สำหรับ Aiven
            $options = [
                PDO::MYSQL_ATTR_SSL_CA => __DIR__ . '/ca.pem',
                PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 5, // 5 seconds timeout
                PDO::ATTR_PERSISTENT => true, // Reuses DB connections to greatly speed up remote SSL connections
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            $this->conn->exec("set names utf8mb4");
        } catch (PDOException $e) {
            error_log("Connection error: " . $e->getMessage());
            die("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล กรุณาติดต่อผู้ดูแลระบบ");
        }
        return $this->conn;
    }
}
?>