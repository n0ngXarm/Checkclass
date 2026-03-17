<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Unauthorized'], 401);
}

// GET: ดึงข้อมูลการลงทะเบียน
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $student_id = $_GET['student_id'] ?? null;
    $class_id = $_GET['class_id'] ?? null;
    $semester_id = $_GET['semester_id'] ?? null;
    
    $sql = "
        SELECT 
            e.*,
            s.student_code,
            CONCAT(s.title, s.first_name, ' ', s.last_name) as student_name,
            c.class_name,
            d.dept_name,
            sem.semester_name
        FROM enrollments e
        JOIN student s ON e.student_id = s.student_id
        JOIN classes c ON e.class_id = c.class_id
        JOIN departments d ON c.dept_id = d.dept_id
        JOIN semesters sem ON e.semester_id = sem.semester_id
        WHERE 1=1
    ";
    
    $params = [];
    
    if ($student_id) {
        $sql .= " AND e.student_id = ?";
        $params[] = $student_id;
    }
    if ($class_id) {
        $sql .= " AND e.class_id = ?";
        $params[] = $class_id;
    }
    if ($semester_id) {
        $sql .= " AND e.semester_id = ?";
        $params[] = $semester_id;
    }
    
    $sql .= " ORDER BY sem.academic_year DESC, sem.semester, c.class_name";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendJSON($enrollments);
}

// POST: เพิ่ม/แก้ไขการลงทะเบียน
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJSONInput();
    
    // ตรวจสอบว่ามีข้อมูลซ้ำหรือไม่
    $check = $db->prepare("
        SELECT enrollment_id FROM enrollments 
        WHERE student_id = ? AND class_id = ? AND semester_id = ?
    ");
    $check->execute([$input['student_id'], $input['class_id'], $input['semester_id']]);
    
    if ($check->fetch()) {
        // อัปเดต
        $stmt = $db->prepare("
            UPDATE enrollments SET 
                status = ?,
                enrollment_date = ?
            WHERE student_id = ? AND class_id = ? AND semester_id = ?
        ");
        $stmt->execute([
            $input['status'] ?? 'กำลังศึกษา',
            $input['enrollment_date'] ?? date('Y-m-d'),
            $input['student_id'],
            $input['class_id'],
            $input['semester_id']
        ]);
    } else {
        // เพิ่มใหม่
        $stmt = $db->prepare("
            INSERT INTO enrollments (student_id, class_id, semester_id, enrollment_date, status) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $input['student_id'],
            $input['class_id'],
            $input['semester_id'],
            $input['enrollment_date'] ?? date('Y-m-d'),
            $input['status'] ?? 'กำลังศึกษา'
        ]);
    }
    
    sendJSON(['success' => true]);
}

// DELETE: ลบการลงทะเบียน
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $enrollment_id = $_GET['id'] ?? null;
    
    if (!$enrollment_id) {
        sendJSON(['error' => 'Enrollment ID required'], 400);
    }
    
    $stmt = $db->prepare("DELETE FROM enrollments WHERE enrollment_id = ?");
    $stmt->execute([$enrollment_id]);
    
    sendJSON(['success' => true]);
}

sendJSON(['error' => 'Method not allowed'], 405);
?>