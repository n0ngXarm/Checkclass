<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Unauthorized'], 401);
}

$year = $_GET['year'] ?? 2026;
$semester = $_GET['semester'] ?? '1';

// ดึงห้องเรียนทั้งหมด พร้อมแผนก
$stmt = $db->prepare("
    SELECT 
        c.class_id,
        c.class_name,
        c.academic_year,
        c.semester,
        d.dept_id,
        d.dept_name,
        d.dept_group,
        (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = c.class_id AND e.semester_id = s.semester_id) as student_count
    FROM classes c
    JOIN departments d ON c.dept_id = d.dept_id
    JOIN semesters s ON s.academic_year = c.academic_year AND s.semester = c.semester
    WHERE c.academic_year = ? AND c.semester = ?
    ORDER BY d.dept_name, c.class_name
");
$stmt->execute([$year, $semester]);
$classes = $stmt->fetchAll(PDO::FETCH_ASSOC);

sendJSON($classes);
?>