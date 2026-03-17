<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Unauthorized'], 401);
}

// GET: ดึงรายการภาคเรียน
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->query("
        SELECT 
            semester_id,
            academic_year,
            semester,
            semester_name,
            is_active,
            start_date,
            end_date
        FROM semesters
        ORDER BY academic_year DESC, 
                 FIELD(semester, '1', '2', 'summer')
    ");
    $semesters = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendJSON($semesters);
}

// POST: เพิ่มภาคเรียนใหม่ (SUPER_ADMIN เท่านั้น)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // ตรวจสอบสิทธิ์
    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $role_id = $stmt->fetchColumn();
    
    if ($role_id != 1) {
        sendJSON(['error' => 'Forbidden'], 403);
    }
    
    $input = getJSONInput();
    
    $stmt = $db->prepare("
        INSERT INTO semesters (academic_year, semester, semester_name, is_active, start_date, end_date) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $input['academic_year'],
        $input['semester'],
        $input['semester_name'],
        $input['is_active'] ?? 0,
        $input['start_date'] ?? null,
        $input['end_date'] ?? null
    ]);
    
    sendJSON(['success' => true, 'semester_id' => $db->lastInsertId()]);
}

sendJSON(['error' => 'Method not allowed'], 405);
?>