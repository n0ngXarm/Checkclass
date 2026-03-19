<?php
// api/dashboard.php
require_once __DIR__ . '/../api/cors.php';
require_once __DIR__ . '/../config/database.php';
setCorsHeaders();
$teacher = requireAuth();

$db   = new Database();
$conn = $db->getConnection();
$today = date('Y-m-d');

// Current semester
$sem = $conn->query("SELECT * FROM semesters WHERE is_current = 1 LIMIT 1")->fetch();
$semester_id = $sem ? (int)$sem['semester_id'] : 0;

$total_students = (int)$conn->query("SELECT COUNT(*) FROM students")->fetchColumn();

$present = $absent = $late = $leave = 0;
if($semester_id) {
    $st = $conn->prepare(
        "SELECT
            SUM(CASE WHEN ar.status IN ('มาเรียน','สาย') THEN 1 ELSE 0 END) AS present,
            SUM(CASE WHEN ar.status = 'ขาดเรียน'          THEN 1 ELSE 0 END) AS absent,
            SUM(CASE WHEN ar.status = 'สาย'               THEN 1 ELSE 0 END) AS late,
            SUM(CASE WHEN ar.status = 'ลา'                THEN 1 ELSE 0 END) AS leave_count
         FROM attendance_records ar
         WHERE ar.check_in_date = ? AND ar.semester_id = ?"
    );
    $st->execute([$today, $semester_id]);
    $row = $st->fetch();
    if($row) {
        $present = (int)($row['present']     ?? 0);
        $absent  = (int)($row['absent']      ?? 0);
        $late    = (int)($row['late']        ?? 0);
        $leave   = (int)($row['leave_count'] ?? 0);
    }
}

// 7-day trend
$trends = [];
if($semester_id) {
    $tr = $conn->prepare(
        "SELECT
            ar.check_in_date AS date,
            COUNT(*) AS total,
            SUM(CASE WHEN ar.status IN ('มาเรียน','สาย') THEN 1 ELSE 0 END) AS present,
            SUM(CASE WHEN ar.status = 'ขาดเรียน'          THEN 1 ELSE 0 END) AS absent
         FROM attendance_records ar
         WHERE ar.semester_id = ?
         GROUP BY ar.check_in_date
         ORDER BY ar.check_in_date DESC
         LIMIT 7"
    );
    $tr->execute([$semester_id]);
    $trends = array_reverse($tr->fetchAll());
}

jsonResponse([
    'success'         => true,
    'total_students'  => $total_students,
    'present_today'   => $present,
    'absent_today'    => $absent,
    'late_today'      => $late,
    'leave_today'     => $leave,
    'semester'        => $sem ?: null,
    'trends'          => $trends,
]);
