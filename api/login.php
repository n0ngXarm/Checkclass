<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน']);
    exit;
}

$username = $input['username'];
$password = $input['password'];

try {
    $stmt = $conn->prepare("
        SELECT u.*, 
               p.first_name, p.last_name, p.title, p.phone, p.avatar,
               r.role_name, r.permissions,
               t.teacher_id, t.teacher_code, t.dept_id,
               s.student_id, s.student_code, s.level, s.major_code, s.enrollment_year
        FROM users u
        LEFT JOIN profiles p ON u.user_id = p.user_id
        LEFT JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN teacher t ON u.user_id = t.user_id
        LEFT JOIN student s ON u.user_id = s.user_id
        WHERE u.username = ? AND u.is_active = 1
    ");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'ไม่พบบัญชีผู้ใช้นี้']);
        exit;
    }

    // ตรวจสอบรหัสผ่าน
    if ($password !== $user['password']) {
        http_response_code(401);
        echo json_encode(['error' => 'รหัสผ่านไม่ถูกต้อง']);
        exit;
    }

    // ตรวจสอบการอนุมัติ (ยกเว้น admin)
    if ($user['role_id'] != 1 && !$user['is_approved']) {
        http_response_code(403);
        echo json_encode(['error' => 'บัญชีนี้รอการอนุมัติจากผู้อำนวยการ']);
        exit;
    }

    session_start();
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role_id'] = $user['role_id'];
    $_SESSION['role_name'] = $user['role_name'];
    
    $session_id = session_id();

    // กำหนด redirect path ตาม role
    $redirectPath = match($user['role_id']) {
        1 => '/dashboard',      // ผอ.
        2 => '/teacher/dashboard', // ครู
        3 => '/student/dashboard', // นักเรียน
        default => '/dashboard'
    };

    unset($user['password']);

    echo json_encode([
        'success' => true,
        'token' => $session_id,
        'user' => $user,
        'redirect' => $redirectPath
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>