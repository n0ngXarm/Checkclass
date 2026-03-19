<?php
// api/attendance.php — GET (existing records) / POST (save batch)
require_once __DIR__ . '/../api/cors.php';
require_once __DIR__ . '/../config/database.php';
setCorsHeaders();
$teacher = requireAuth();

$db   = new Database();
$conn = $db->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Detect optional columns
$ar_cols = [];
try {
    $ar_cols = $conn->query("SHOW COLUMNS FROM attendance_records")->fetchAll(PDO::FETCH_COLUMN);
} catch(Exception $e){}
$hasNote = in_array('note', $ar_cols);
$hasTime = in_array('check_in_time', $ar_cols);

// Current semester
$sem = $conn->query("SELECT * FROM semesters WHERE is_current = 1 LIMIT 1")->fetch();
$semester_id = $sem ? (int)$sem['semester_id'] : 0;

// ─── GET ─────────────────────────────────────────────────────────
if($method === 'GET') {
    $class_id   = (int)($_GET['class_id'] ?? 0);
    $check_date = $_GET['date'] ?? date('Y-m-d');

    if(!$class_id) jsonError('class_id จำเป็นต้องมี');

    $select = "SELECT ar.student_id, ar.status";
    if($hasTime) $select .= ", ar.check_in_time";
    if($hasNote) $select .= ", ar.note";

    $stmt = $conn->prepare(
        "$select FROM attendance_records ar
         WHERE ar.class_id = ? AND ar.check_in_date = ? AND ar.semester_id = ?"
    );
    $stmt->execute([$class_id, $check_date, $semester_id]);
    $records = [];
    foreach($stmt->fetchAll() as $r) {
        $records[$r['student_id']] = $r;
    }

    // Get students in class
    $stu_stmt = $conn->prepare(
        "SELECT student_id, first_name_th, last_name_th, student_number, nickname, gender
         FROM students WHERE class_id = ? ORDER BY student_number ASC"
    );
    $stu_stmt->execute([$class_id]);
    $students = $stu_stmt->fetchAll();

    jsonResponse([
        'success'     => true,
        'students'    => $students,
        'records'     => $records,
        'check_date'  => $check_date,
        'semester_id' => $semester_id,
    ]);
}

// ─── POST (batch save) ───────────────────────────────────────────
if($method === 'POST') {
    $b          = getBody();
    $class_id   = (int)($b['class_id']   ?? 0);
    $check_date = $b['date'] ?? date('Y-m-d');
    $entries    = $b['entries'] ?? []; // [{student_id, status, time, note}]

    if(!$class_id || empty($entries)) jsonError('ข้อมูลไม่ครบ: class_id, entries');

    $conn->beginTransaction();
    try {
        foreach($entries as $entry) {
            $student_id = $entry['student_id'] ?? '';
            $status     = $entry['status']     ?? 'มาเรียน';
            $allowed    = ['มาเรียน','ขาดเรียน','สาย','ลา'];
            if(!$student_id || !in_array($status, $allowed)) continue;

            if($hasNote && $hasTime) {
                $time = !empty($entry['time']) ? $entry['time'] : null;
                $note = !empty($entry['note']) ? trim($entry['note']) : null;
                $stmt = $conn->prepare(
                    "INSERT INTO attendance_records
                        (student_id, class_id, teacher_id, semester_id, check_in_date, status, check_in_time, note)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                        status=VALUES(status), check_in_time=VALUES(check_in_time), note=VALUES(note)"
                );
                $stmt->execute([$student_id, $class_id, $teacher['id'], $semester_id, $check_date, $status, $time, $note]);
            } else {
                $stmt = $conn->prepare(
                    "INSERT INTO attendance_records
                        (student_id, class_id, teacher_id, semester_id, check_in_date, status)
                     VALUES (?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE status=VALUES(status)"
                );
                $stmt->execute([$student_id, $class_id, $teacher['id'], $semester_id, $check_date, $status]);
            }
        }
        $conn->commit();
        jsonResponse(['success' => true, 'saved' => count($entries)]);
    } catch(Exception $e) {
        $conn->rollBack();
        jsonError('บันทึกล้มเหลว: ' . $e->getMessage(), 500);
    }
}

jsonError('Method not allowed', 405);
