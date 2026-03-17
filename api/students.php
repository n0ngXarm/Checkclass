<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    // ดึงรายชื่อนักเรียนทั้งหมด
    $stmt = $conn->query("
        SELECT student_id, student_code, title, first_name, last_name, class
        FROM students
        ORDER BY student_code
    ");
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($students);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>