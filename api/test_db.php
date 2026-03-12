<?php
require_once 'config.php';

echo "<h1>🔍 ทดสอบการเชื่อมต่อฐานข้อมูล</h1>";

try {
    // ทดสอบการเชื่อมต่อ
    $conn->query("SELECT 1");
    echo "<p style='color:green;'>✅ เชื่อมต่อฐานข้อมูลสำเร็จ</p>";
    
    // แสดงข้อมูลในแต่ละตาราง
    $tables = ['departments', 'semesters', 'teacher', 'classes', 'student', 'enrollments', 'attendance', 'teacher_class'];
    
    echo "<h2>📊 สรุปจำนวนข้อมูล</h2>";
    echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
    echo "<tr><th>ตาราง</th><th>จำนวน</th></tr>";
    
    foreach ($tables as $table) {
        try {
            $count = $conn->query("SELECT COUNT(*) FROM $table")->fetchColumn();
            $color = $count > 0 ? 'green' : 'orange';
            echo "<tr>";
            echo "<td>$table</td>";
            echo "<td style='color:$color; font-weight:bold;'>$count</td>";
            echo "</tr>";
        } catch (Exception $e) {
            echo "<tr><td>$table</td><td style='color:red;'>ไม่มีตาราง</td></tr>";
        }
    }
    echo "</table>";
    
    // ทดสอบ query ตัวอย่าง
    echo "<h2>📝 ทดสอบ query ตัวอย่าง</h2>";
    
    // 1. ดูข้อมูลครู
    echo "<h3>👩‍🏫 ข้อมูลครู</h3>";
    $teachers = $conn->query("SELECT teacher_id, teacher_code, academic_title, personal_title, first_name, last_name, password FROM teacher LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    if ($teachers) {
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>ID</th><th>รหัส</th><th>ชื่อ</th><th>รหัสผ่าน</th></tr>";
        foreach ($teachers as $t) {
            echo "<tr>";
            echo "<td>{$t['teacher_id']}</td>";
            echo "<td>{$t['teacher_code']}</td>";
            echo "<td>{$t['academic_title']}{$t['personal_title']}{$t['first_name']} {$t['last_name']}</td>";
            echo "<td>{$t['password']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>❌ ไม่มีข้อมูลครู</p>";
    }
    
    // 2. ดูข้อมูลนักเรียน
    echo "<h3>👨‍🎓 ข้อมูลนักเรียน</h3>";
    $students = $conn->query("SELECT student_id, student_code, title, first_name, last_name FROM student LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    if ($students) {
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>ID</th><th>รหัส</th><th>ชื่อ</th></tr>";
        foreach ($students as $s) {
            echo "<tr>";
            echo "<td>{$s['student_id']}</td>";
            echo "<td>{$s['student_code']}</td>";
            echo "<td>{$s['title']}{$s['first_name']} {$s['last_name']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>❌ ไม่มีข้อมูลนักเรียน</p>";
    }
    
    // 3. ทดสอบ login
    echo "<h3>🔐 ทดสอบ login (T001/1234)</h3>";
    $login = $conn->prepare("SELECT * FROM teacher WHERE teacher_code = ? AND password = ?");
    $login->execute(['T001', '1234']);
    if ($login->fetch()) {
        echo "<p style='color:green;'>✅ login สำเร็จ</p>";
    } else {
        echo "<p style='color:red;'>❌ login ล้มเหลว (อาจไม่มีข้อมูล)</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red;'>❌ เกิดข้อผิดพลาด: " . $e->getMessage() . "</p>";
}
?>

<p><a href="index.php">🏠 กลับหน้าหลัก</a></p>