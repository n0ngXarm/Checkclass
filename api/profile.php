<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Unauthorized'], 401);
}

$year = $_GET['year'] ?? 2026;
$semester = $_GET['semester'] ?? '1';
$class_id = $_GET['class_id'] ?? null;
$student_id = $_GET['student_id'] ?? null;
$start_date = $_GET['start_date'] ?? null;
$end_date = $_GET['end_date'] ?? null;

// หา semester_id
$stmt = $db->prepare("SELECT semester_id FROM semesters WHERE academic_year = ? AND semester = ?");
$stmt->execute([$year, $semester]);
$semester_id = $stmt->fetchColumn();

// สรุปภาพรวม
$summary = [];

// 1. จำนวนนักเรียนทั้งหมด
$sql = "SELECT COUNT(DISTINCT s.student_id) as total_students FROM student s";
if ($class_id) {
    $sql .= " JOIN enrollments e ON s.student_id = e.student_id AND e.class_id = ? AND e.semester_id = ?";
}
$stmt = $db->prepare($sql);
if ($class_id) {
    $stmt->execute([$class_id, $semester_id]);
} else {
    $stmt->execute();
}
$summary['total_students'] = $stmt->fetchColumn();

// 2. สถิติการเข้าเรียน
$sql = "
    SELECT 
        COUNT(CASE WHEN status = 'มา' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'สาย' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'ขาด' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'ลา' THEN 1 END) as leave,
        COUNT(*) as total
    FROM attendance a
    WHERE a.semester_id = ?
";

$params = [$semester_id];

if ($class_id) {
    $sql .= " AND a.class_id = ?";
    $params[] = $class_id;
}
if ($student_id) {
    $sql .= " AND a.student_id = ?";
    $params[] = $student_id;
}
if ($start_date) {
    $sql .= " AND a.check_in_date >= ?";
    $params[] = $start_date;
}
if ($end_date) {
    $sql .= " AND a.check_in_date <= ?";
    $params[] = $end_date;
}

$stmt = $db->prepare($sql);
$stmt->execute($params);
$stats = $stmt->fetch(PDO::FETCH_ASSOC);

$summary = array_merge($summary, $stats);

// ดึงรายละเอียด
$sql = "
    SELECT 
        a.check_in_date,
        a.check_in_time,
        a.status,
        a.note,
        s.student_code,
        CONCAT(s.title, s.first_name, ' ', s.last_name) as student_name,
        c.class_name,
        CONCAT(t.academic_title, t.personal_title, t.first_name, ' ', t.last_name) as teacher_name
    FROM attendance a
    JOIN student s ON a.student_id = s.student_id
    JOIN classes c ON a.class_id = c.class_id
    JOIN teacher t ON a.teacher_id = t.teacher_id
    WHERE a.semester_id = ?
";

$params = [$semester_id];

if ($class_id) {
    $sql .= " AND a.class_id = ?";
    $params[] = $class_id;
}
if ($student_id) {
    $sql .= " AND a.student_id = ?";
    $params[] = $student_id;
}
if ($start_date) {
    $sql .= " AND a.check_in_date >= ?";
    $params[] = $start_date;
}
if ($end_date) {
    $sql .= " AND a.check_in_date <= ?";
    $params[] = $end_date;
}

$sql .= " ORDER BY a.check_in_date DESC, a.check_in_time DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$details = $stmt->fetchAll(PDO::FETCH_ASSOC);

sendJSON([
    'summary' => $summary,
    'details' => $details
]);
?>