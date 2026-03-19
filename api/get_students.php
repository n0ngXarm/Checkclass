<?php
// api/get_students.php – JSON API: GET ?class_id=<int>
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/database.php';

if(session_status() === PHP_SESSION_NONE) session_start();
if(!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$class_id = (int)($_GET['class_id'] ?? 0);

$db   = new Database();
$conn = $db->getConnection();

if($class_id) {
    $stmt = $conn->prepare(
        "SELECT s.id, s.student_id, s.first_name_th, s.last_name_th,
                s.student_number, s.gender,
                c.class_code, c.room
         FROM students s
         JOIN classes c ON s.class_id = c.class_id
         WHERE s.class_id = ?
         ORDER BY s.student_number ASC"
    );
    $stmt->execute([$class_id]);
} else {
    $stmt = $conn->query(
        "SELECT s.id, s.student_id, s.first_name_th, s.last_name_th,
                s.student_number, s.gender,
                c.class_code, c.room
         FROM students s
         JOIN classes c ON s.class_id = c.class_id
         ORDER BY c.class_code, s.student_number ASC"
    );
}

echo json_encode($stmt->fetchAll(), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
