<?php
// test_db.php
require_once 'config/database.php';

echo "<h2>ทดสอบการเชื่อมต่อฐานข้อมูล</h2>";

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    if($conn) {
        echo "<p style='color:green'>✅ เชื่อมต่อฐานข้อมูลสำเร็จ!</p>";
        
        // ทดสอบ Query ง่ายๆ
        $query = "SELECT COUNT(*) as total FROM teachers";
        $stmt = $conn->query($query);
        $result = $stmt->fetch();
        echo "<p>จำนวนครูในระบบ: " . $result['total'] . " คน</p>";
        
        $query = "SELECT COUNT(*) as total FROM students";
        $stmt = $conn->query($query);
        $result = $stmt->fetch();
        echo "<p>จำนวนนักเรียนในระบบ: " . $result['total'] . " คน</p>";
    }
} catch(Exception $e) {
    echo "<p style='color:red'>❌ ไม่สามารถเชื่อมต่อฐานข้อมูล: " . $e->getMessage() . "</p>";
}
?>