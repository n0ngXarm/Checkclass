<?php
require_once 'config.php';
// GET: ดึงรายการแผนก (อนุญาตให้เข้าถึงได้ทุกคนเพื่อใช้ในการสมัครสมาชิก)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->query("
        SELECT 
            dept_id,
            dept_name,
            dept_group,
            (SELECT COUNT(*) FROM teacher WHERE dept_id = d.dept_id) as teacher_count,
            (SELECT COUNT(*) FROM classes WHERE dept_id = d.dept_id) as class_count
        FROM departments d
        ORDER BY dept_group, dept_name
    ");
    $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendJSON($departments);
}

// ปกป้องเฉพาะ POST (เพิ่มแผนก)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        sendJSON(['error' => 'Unauthorized'], 401);
    }

    // ตรวจสอบสิทธิ์ (SUPER_ADMIN เท่านั้น)
    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $role_id = $stmt->fetchColumn();
    
    if ($role_id != 1) {
        sendJSON(['error' => 'Forbidden'], 403);
    }
    
    $input = getJSONInput();
    
    // ตรวจสอบชื่อซ้ำ
    $check = $db->prepare("SELECT dept_id FROM departments WHERE dept_name = ?");
    $check->execute([$input['dept_name']]);
    if ($check->fetch()) {
        sendJSON(['error' => 'Department name already exists'], 400);
    }
    
    $stmt = $db->prepare("
        INSERT INTO departments (dept_name, dept_group) 
        VALUES (?, ?)
    ");
    $stmt->execute([$input['dept_name'], $input['dept_group'] ?? 'อื่นๆ']);
    
    sendJSON(['success' => true, 'dept_id' => $db->lastInsertId()]);
}

sendJSON(['error' => 'Method not allowed'], 405);
?>