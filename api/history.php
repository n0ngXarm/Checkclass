<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];

try {
    if ($role === 'student') {
        // นักเรียนดูประวัติของตัวเอง
        $stmt = $conn->prepare("
            SELECT a.check_date, a.check_time, a.status, a.note,
                   t.first_name as teacher_firstname, t.last_name as teacher_lastname
            FROM attendance a
            JOIN teachers t ON a.teacher_id = t.teacher_id
            WHERE a.student_id = (SELECT student_id FROM students WHERE user_id = ?)
            ORDER BY a.check_date DESC, a.check_time DESC
        ");
        $stmt->execute([$user_id]);

    } elseif ($role === 'teacher') {
        // ครูดูประวัติของนักเรียนทั้งหมด (หรือกรองตามห้อง)
        $class = $_GET['class'] ?? '';
        
        $sql = "
            SELECT a.check_date, a.check_time, a.status, a.note,
                   s.student_code, s.title, s.first_name, s.last_name, s.class,
                   t.first_name as teacher_firstname, t.last_name as teacher_lastname
            FROM attendance a
            JOIN students s ON a.student_id = s.student_id
            JOIN teachers t ON a.teacher_id = t.teacher_id
            WHERE 1=1
        ";
        
        $params = [];
        
        if (!empty($class)) {
            $sql .= " AND s.class = ?";
            $params[] = $class;
        }
        
        $sql .= " ORDER BY a.check_date DESC, a.check_time DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

    } elseif ($role === 'admin') {
        // admin ดูได้ทั้งหมด
        $stmt = $conn->query("
            SELECT a.check_date, a.check_time, a.status, a.note,
                   s.student_code, s.title, s.first_name, s.last_name, s.class,
                   t.first_name as teacher_firstname, t.last_name as teacher_lastname
            FROM attendance a
            JOIN students s ON a.student_id = s.student_id
            JOIN teachers t ON a.teacher_id = t.teacher_id
            ORDER BY a.check_date DESC, a.check_time DESC
        ");
    }

    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($history);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>