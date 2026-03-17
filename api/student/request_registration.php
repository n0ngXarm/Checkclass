<?php
require_once '../config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];

// ตรวจสอบว่าเป็นนักเรียน
$stmt = $conn->prepare("SELECT role_id FROM users WHERE user_id = ?");
$stmt->execute([$user_id]);
if ($stmt->fetchColumn() != 3) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden - Student only']);
    exit;
}

// GET: ดึงข้อมูลการขอลงทะเบียนของนักเรียน
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("
        SELECT r.*, 
               c.class_name, 
               d.dept_name,
               sem.semester_name,
               CONCAT(t.first_name, ' ', t.last_name) as approver_name
        FROM student_registration_requests r
        JOIN student s ON r.student_id = s.student_id
        JOIN classes c ON r.desired_class_id = c.class_id
        JOIN departments d ON c.dept_id = d.dept_id
        JOIN semesters sem ON r.desired_semester_id = sem.semester_id
        LEFT JOIN users u ON r.approved_by = u.user_id
        LEFT JOIN teacher t ON u.user_id = t.user_id
        WHERE s.user_id = ?
        ORDER BY r.requested_at DESC
    ");
    $stmt->execute([$user_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// POST: ขอลงทะเบียนใหม่
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $class_id = $input['class_id'];
    $semester_id = $input['semester_id'];
    $reason = $input['reason'] ?? '';
    
    // หา student_id จาก user_id
    $stmt = $conn->prepare("SELECT student_id FROM student WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $student_id = $stmt->fetchColumn();
    
    if (!$student_id) {
        http_response_code(404);
        echo json_encode(['error' => 'Student not found']);
        exit;
    }
    
    // ตรวจสอบว่ามีคำขอที่ pending อยู่หรือไม่
    $check = $conn->prepare("
        SELECT request_id FROM student_registration_requests 
        WHERE student_id = ? AND desired_semester_id = ? AND status = 'pending'
    ");
    $check->execute([$student_id, $semester_id]);
    if ($check->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'มีคำขอที่รอการอนุมัติอยู่แล้ว']);
        exit;
    }
    
    // สร้างคำขอ
    $stmt = $conn->prepare("
        INSERT INTO student_registration_requests 
        (student_id, desired_class_id, desired_semester_id, reason) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$student_id, $class_id, $semester_id, $reason]);
    
    echo json_encode([
        'success' => true,
        'message' => 'ส่งคำขอลงทะเบียนเรียบร้อย',
        'request_id' => $conn->lastInsertId()
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>