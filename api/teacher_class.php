<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Unauthorized'], 401);
}

// GET: ดึงข้อมูลการสอน
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $teacher_id = $_GET['teacher_id'] ?? null;
    $class_id = $_GET['class_id'] ?? null;
    $year = $_GET['year'] ?? 2026;
    $semester = $_GET['semester'] ?? '1';
    
    $sql = "
        SELECT 
            tc.*,
            t.teacher_code,
            CONCAT(t.academic_title, t.personal_title, t.first_name, ' ', t.last_name) as teacher_name,
            c.class_name,
            d.dept_name
        FROM teacher_class tc
        JOIN teacher t ON tc.teacher_id = t.teacher_id
        JOIN classes c ON tc.class_id = c.class_id
        JOIN departments d ON c.dept_id = d.dept_id
        WHERE tc.academic_year = ? AND tc.semester = ?
    ";
    
    $params = [$year, $semester];
    
    if ($teacher_id) {
        $sql .= " AND tc.teacher_id = ?";
        $params[] = $teacher_id;
    }
    if ($class_id) {
        $sql .= " AND tc.class_id = ?";
        $params[] = $class_id;
    }
    
    $sql .= " ORDER BY d.dept_name, c.class_name, t.teacher_code";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendJSON($assignments);
}

// POST: เพิ่ม/แก้ไขการสอน
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // ตรวจสอบสิทธิ์ (SUPER_ADMIN เท่านั้น)
    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $role_id = $stmt->fetchColumn();
    
    if ($role_id != 1) {
        sendJSON(['error' => 'Forbidden'], 403);
    }
    
    $input = getJSONInput();
    
    // ตรวจสอบว่ามีข้อมูลซ้ำหรือไม่
    $check = $db->prepare("
        SELECT tc_id FROM teacher_class 
        WHERE teacher_id = ? AND class_id = ? AND academic_year = ? AND semester = ?
    ");
    $check->execute([
        $input['teacher_id'],
        $input['class_id'],
        $input['academic_year'],
        $input['semester']
    ]);
    
    if ($check->fetch()) {
        // อัปเดต
        $stmt = $db->prepare("
            UPDATE teacher_class SET 
                is_homeroom = ?
            WHERE teacher_id = ? AND class_id = ? AND academic_year = ? AND semester = ?
        ");
        $stmt->execute([
            $input['is_homeroom'] ?? 0,
            $input['teacher_id'],
            $input['class_id'],
            $input['academic_year'],
            $input['semester']
        ]);
    } else {
        // เพิ่มใหม่
        $stmt = $db->prepare("
            INSERT INTO teacher_class (teacher_id, class_id, academic_year, semester, is_homeroom) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $input['teacher_id'],
            $input['class_id'],
            $input['academic_year'],
            $input['semester'],
            $input['is_homeroom'] ?? 0
        ]);
    }
    
    sendJSON(['success' => true]);
}

// DELETE: ลบการสอน
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $tc_id = $_GET['id'] ?? null;
    
    if (!$tc_id) {
        sendJSON(['error' => 'Assignment ID required'], 400);
    }
    
    $stmt = $db->prepare("DELETE FROM teacher_class WHERE tc_id = ?");
    $stmt->execute([$tc_id]);
    
    sendJSON(['success' => true]);
}

sendJSON(['error' => 'Method not allowed'], 405);
?>