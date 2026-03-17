<?php
require_once '../config.php';
// รับ token จาก Header
$headers = getallheaders();
$token = null;

if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
}

if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'No token provided']);
    exit;
}

// ในระบบจริงควรตรวจสอบ token กับฐานข้อมูล
// แต่ตอนนี้ใช้ session แทน
session_id($token);
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized - Invalid session']);
    exit;
}

// ตรวจสอบว่าเป็น SUPER_ADMIN
$stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ?");
$stmt->execute([$_SESSION['user_id']]);
$role_id = $stmt->fetchColumn();

if ($role_id != 1) {
    sendJSON(['error' => 'Forbidden'], 403);
}

// GET: ดึงรายการครูที่รออนุมัติ
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->query("
        SELECT 
            u.user_id,
            u.username,
            u.email,
            u.created_at,
            p.title,
            p.first_name,
            p.last_name,
            p.phone,
            t.teacher_code,
            t.dept_id,
            d.dept_name
        FROM users u
        JOIN profiles p ON u.user_id = p.user_id
        JOIN teacher t ON u.user_id = t.user_id
        LEFT JOIN departments d ON t.dept_id = d.dept_id
        WHERE u.role_id = 2 AND u.is_approved = 0
        ORDER BY u.created_at DESC
    ");
    $pending = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendJSON($pending);
}

// POST: อนุมัติ/ปฏิเสธ
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJSONInput();
    $user_id = $input['user_id'];
    $action = $input['action']; // 'approve' or 'reject'
    
    if ($action === 'approve') {
        $stmt = $db->prepare("UPDATE users SET is_approved = 1 WHERE user_id = ?");
        $stmt->execute([$user_id]);
        sendJSON(['success' => true, 'message' => 'Teacher approved']);
    } elseif ($action === 'reject') {
        // ลบ user (cascade ไปลบ profile, teacher)
        $stmt = $db->prepare("DELETE FROM users WHERE user_id = ?");
        $stmt->execute([$user_id]);
        sendJSON(['success' => true, 'message' => 'Teacher rejected']);
    } else {
        sendJSON(['error' => 'Invalid action'], 400);
    }
}

sendJSON(['error' => 'Method not allowed'], 405);
?>