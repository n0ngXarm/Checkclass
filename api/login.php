<?php
require_once 'config.php';

// รับ JSON จาก request
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน']);
    exit();
}

$username = $input['username'];
$password = $input['password'];

try {
    // ค้นหาผู้ใช้
    $stmt = $conn->prepare("
        SELECT u.*, t.teacher_id, t.teacher_code, t.title as teacher_title, 
               t.first_name as teacher_firstname, t.last_name as teacher_lastname,
               s.student_id, s.student_code, s.title as student_title,
               s.first_name as student_firstname, s.last_name as student_lastname,
               s.class
        FROM users u
        LEFT JOIN teachers t ON u.user_id = t.user_id
        LEFT JOIN students s ON u.user_id = s.user_id
        WHERE u.username = ? AND u.password = ?
    ");
    $stmt->execute([$username, $password]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'error' => 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง']);
        exit();
    }

    // เริ่ม session
    session_start();
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];

    // สร้างข้อมูล user ที่จะส่งกลับ
    $userData = [
        'id' => $user['user_id'],
        'username' => $user['username'],
        'role' => $user['role']
    ];

    // เพิ่มข้อมูลเฉพาะตาม role
    if ($user['role'] === 'teacher') {
        $userData['teacher_id'] = $user['teacher_id'];
        $userData['teacher_code'] = $user['teacher_code'];
        $userData['title'] = $user['teacher_title'];
        $userData['first_name'] = $user['teacher_firstname'];
        $userData['last_name'] = $user['teacher_lastname'];
    } elseif ($user['role'] === 'student') {
        $userData['student_id'] = $user['student_id'];
        $userData['student_code'] = $user['student_code'];
        $userData['title'] = $user['student_title'];
        $userData['first_name'] = $user['student_firstname'];
        $userData['last_name'] = $user['student_lastname'];
        $userData['class'] = $user['class'];
    }

    echo json_encode([
        'success' => true,
        'user' => $userData
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>