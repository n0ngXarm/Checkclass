<?php
// api/get_students.php – JSON API: GET ?class_id=<int>
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

require_once __DIR__ . '/../api/cors.php'; // Use the same cors handler
require_once __DIR__ . '/../config/database.php';

setCorsHeaders();
$teacher = requireAuth();

$class_id = (int)($_GET['class_id'] ?? 0);

$db   = new Database();
$conn = $db->getConnection();

$sql = "SELECT s.student_id, s.student_code, s.first_name_th, s.last_name_th,
               s.student_number, s.gender,
               c.class_code, c.room
        FROM students s
        JOIN classes c ON s.class_id = c.class_id";
$params = [];

if($class_id) {
    $sql .= " WHERE s.class_id = ?";
    $params[] = $class_id;
}
$sql .= " ORDER BY c.class_code, s.student_number ASC";

$stmt = $conn->prepare($sql);
$stmt->execute($params);

jsonResponse(['success' => true, 'students' => $stmt->fetchAll()]);
?>
