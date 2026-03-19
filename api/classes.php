<?php
// api/classes.php
require_once __DIR__ . '/../api/cors.php';
require_once __DIR__ . '/../config/database.php';
setCorsHeaders();
requireAuth();

$db   = new Database();
$conn = $db->getConnection();

$stmt = $conn->query(
    "SELECT c.class_id, c.class_code, c.room,
            el.level_name_th, d.dept_name_th, d.dept_id
     FROM classes c
     JOIN education_levels el ON c.level_id = el.level_id
     JOIN departments d ON c.dept_id = d.dept_id
     ORDER BY el.level_order, c.class_code ASC"
);
jsonResponse(['success' => true, 'classes' => $stmt->fetchAll()]);
