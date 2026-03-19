<?php
// api/reports/daily.php
require_once __DIR__ . '/../../api/cors.php';
require_once __DIR__ . '/../../config/database.php';
setCorsHeaders();
requireAuth();

$db   = new Database();
$conn = $db->getConnection();

$check_date = $_GET['date']     ?? date('Y-m-d');
$class_id   = (int)($_GET['class_id'] ?? 0);

$sem = $conn->query("SELECT * FROM semesters WHERE is_current = 1 LIMIT 1")->fetch();
$semester_id = $sem ? (int)$sem['semester_id'] : 0;

// Detect columns
$ar_cols = [];
try { $ar_cols = $conn->query("SHOW COLUMNS FROM attendance_records")->fetchAll(PDO::FETCH_COLUMN); } catch(Exception $e){}
$noteCol = in_array('remark', $ar_cols) ? 'remark' : (in_array('note', $ar_cols) ? 'note' : '');
$hasNote = $noteCol !== '';
$hasTime = in_array('check_in_time', $ar_cols);

$extra = '';
if($hasTime) $extra .= ', ar.check_in_time';
if($hasNote) $extra .= ", ar.$noteCol AS note";

$sql = "SELECT ar.status $extra,
               s.student_id, s.first_name_th, s.last_name_th, s.student_number,
               c.class_code, c.room
        FROM attendance_records ar
        JOIN students s ON ar.student_id = s.student_id
        JOIN classes  c ON ar.class_id   = c.class_id
        WHERE ar.check_in_date = ? AND ar.semester_id = ?";
$params = [$check_date, $semester_id];

if($class_id) { $sql .= " AND ar.class_id = ?"; $params[] = $class_id; }
$sql .= " ORDER BY c.class_code, s.student_number ASC";

$rows   = [];
$counts = ['มาเรียน'=>0,'ขาดเรียน'=>0,'สาย'=>0,'ลา'=>0];
try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach($rows as $r) { 
        $st = $r['status'] === 'มาสาย' ? 'สาย' : $r['status'];
        if(isset($counts[$st])) $counts[$st]++; 
    }
} catch(Exception $e) {}

jsonResponse([
    'success'    => true,
    'date'       => $check_date,
    'records'    => $rows,
    'counts'     => $counts,
    'total'      => count($rows),
]);
