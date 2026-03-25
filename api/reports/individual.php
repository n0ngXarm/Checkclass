<?php
// api/reports/individual.php
require_once __DIR__ . '/../../api/cors.php';
require_once __DIR__ . '/../../config/database.php';
setCorsHeaders();
requireAuth();

$db   = new Database();
$conn = $db->getConnection();

$student_id = trim($_GET['student_id'] ?? '');
if(!$student_id) jsonError('student_id จำเป็นต้องมี');

$sem = $conn->query("SELECT * FROM semesters WHERE is_current = 1 LIMIT 1")->fetch();
$semester_id = $sem ? (int)$sem['semester_id'] : 0;

// Student info
$stu = $conn->prepare(
    "SELECT s.*, c.class_code, c.room, d.dept_name_th
     FROM students s
     JOIN classes c ON s.class_id = c.class_id
     JOIN departments d ON c.dept_id = d.dept_id
     WHERE s.student_id = ? OR s.student_code = ? LIMIT 1"
);
$stu->execute([$student_id, $student_id]);
$student = $stu->fetch();
if(!$student) jsonError('ไม่พบนักเรียน', 404);

// History
$ar_cols = [];
try { $ar_cols = $conn->query("SHOW COLUMNS FROM attendance_records")->fetchAll(PDO::FETCH_COLUMN); } catch(Exception $e){}
$extra = '';
$noteCol = in_array('remark', $ar_cols) ? 'remark' : (in_array('note', $ar_cols) ? 'note' : '');
if(in_array('check_in_time', $ar_cols)) $extra .= ', ar.check_in_time';
if($noteCol !== '')                     $extra .= ", ar.$noteCol AS note";

$hist = [];
$counts = ['มาเรียน'=>0,'ขาดเรียน'=>0,'สาย'=>0,'ลา'=>0,'total'=>0];
try {
    $stmt = $conn->prepare(
        "SELECT ar.check_in_date AS date, ar.status $extra
         FROM attendance_records ar
         WHERE ar.student_id = ? AND ar.semester_id = ?
         ORDER BY ar.check_in_date DESC"
    );
    $stmt->execute([$student['student_id'], $semester_id]);
    $hist = $stmt->fetchAll();
    foreach($hist as $h) {
        $counts['total']++;
        $st = $h['status'] === 'มาสาย' ? 'สาย' : $h['status'];
        if(isset($counts[$st])) $counts[$st]++;
    }
} catch(Exception $e) {}

$present = $counts['มาเรียน'] + $counts['สาย'];
$pct     = $counts['total'] > 0 ? round($present / $counts['total'] * 100) : 0;

jsonResponse([
    'success'  => true,
    'student'  => $student,
    'records'  => $hist,
    'counts'   => $counts,
    'pct'      => $pct,
]);
