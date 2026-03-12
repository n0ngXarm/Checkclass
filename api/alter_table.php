<?php
include 'config.php';
try {
    $conn->exec("ALTER TABLE student MODIFY student_code VARCHAR(50)");
    echo "✅ อัปเดตตารางสำเร็จ! สามารถใช้รหัสนักเรียนยาวขึ้นได้แล้วครับ";
} catch (Exception $e) {
    echo "❌ เกิดข้อผิดพลาด: " . $e->getMessage();
}
?>
