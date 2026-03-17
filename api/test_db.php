<?php
require_once 'config.php';

// ตั้งค่า header ให้เป็น JSON
header('Content-Type: application/json; charset=UTF-8');

$result = [
    'success' => false,
    'message' => '',
    'data' => null
];

try {
    // ทดสอบการเชื่อมต่อ
    $conn->query("SELECT 1");
    
    // ดึงข้อมูล users
    $users = $conn->query("SELECT user_id, username, email, role_id, is_active, is_approved FROM users LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    
    // ดึงข้อมูล teachers
    $teachers = $conn->query("SELECT t.teacher_id, t.teacher_code, t.first_name, t.last_name, u.username 
                              FROM teacher t 
                              LEFT JOIN users u ON t.user_id = u.user_id 
                              LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    
    // ดึงข้อมูล students
    $students = $conn->query("SELECT s.student_id, s.student_code, s.first_name, s.last_name, u.username 
                              FROM student s 
                              LEFT JOIN users u ON s.user_id = u.user_id 
                              LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    
    // นับจำนวนตาราง
    $tables = [
        'users' => $conn->query("SELECT COUNT(*) FROM users")->fetchColumn(),
        'profiles' => $conn->query("SELECT COUNT(*) FROM profiles")->fetchColumn(),
        'teacher' => $conn->query("SELECT COUNT(*) FROM teacher")->fetchColumn(),
        'student' => $conn->query("SELECT COUNT(*) FROM student")->fetchColumn(),
        'classes' => $conn->query("SELECT COUNT(*) FROM classes")->fetchColumn(),
        'departments' => $conn->query("SELECT COUNT(*) FROM departments")->fetchColumn(),
        'enrollments' => $conn->query("SELECT COUNT(*) FROM enrollments")->fetchColumn(),
        'attendance' => $conn->query("SELECT COUNT(*) FROM attendance")->fetchColumn(),
    ];
    
    $result['success'] = true;
    $result['message'] = 'เชื่อมต่อฐานข้อมูลสำเร็จ';
    $result['data'] = [
        'connection' => 'OK',
        'database' => 'defaultdb',
        'server_info' => $conn->getAttribute(PDO::ATTR_SERVER_VERSION),
        'table_counts' => $tables,
        'sample_users' => $users,
        'sample_teachers' => $teachers,
        'sample_students' => $students
    ];
    
} catch (Exception $e) {
    $result['message'] = 'เชื่อมต่อฐานข้อมูลล้มเหลว: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>