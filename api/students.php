<?php
// api/students.php  — GET / POST / PUT / DELETE
require_once __DIR__ . '/../api/cors.php';
require_once __DIR__ . '/../config/database.php';
setCorsHeaders();
requireAuth();

$db   = new Database();
$conn = $db->getConnection();

// Detect PK column name
$pk = 'id';
try {
    $pkInfo = $conn->query("SHOW KEYS FROM students WHERE Key_name='PRIMARY'")->fetchAll();
    if(!empty($pkInfo)) $pk = $pkInfo[0]['Column_name'];
} catch(Exception $e){}

$method = $_SERVER['REQUEST_METHOD'];

// ─── GET ─────────────────────────────────────────────────────────
if($method === 'GET') {
    $class_id = (int)($_GET['class_id'] ?? 0);
    $search   = trim($_GET['search'] ?? '');

    $sql    = "SELECT s.`$pk` AS id, s.student_id, s.student_number,
                      s.first_name_th, s.last_name_th, s.gender,
                      c.class_id, c.class_code, c.room, d.dept_name_th
               FROM students s
               JOIN classes c ON s.class_id = c.class_id
               JOIN departments d ON c.dept_id = d.dept_id
               WHERE 1=1";
    $params = [];

    if($class_id) { $sql .= " AND s.class_id = ?"; $params[] = $class_id; }
    if($search) {
        $sql .= " AND (s.first_name_th LIKE ? OR s.last_name_th LIKE ? OR s.student_id LIKE ?)";
        $like = "%$search%";
        array_push($params, $like, $like, $like);
    }
    $sql .= " ORDER BY c.class_code, s.student_number ASC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    jsonResponse(['success' => true, 'students' => $stmt->fetchAll()]);
}

// ─── POST (create) ───────────────────────────────────────────────
if($method === 'POST') {
    $b = getBody();
    $student_id    = trim($b['student_id']    ?? '');
    $first_name_th = trim($b['first_name_th'] ?? '');
    $last_name_th  = trim($b['last_name_th']  ?? '');
    $class_id      = (int)($b['class_id']     ?? 0);
    $student_number= trim($b['student_number']?? '');
    $gender        = $b['gender'] ?? '';

    if(!$student_id || !$first_name_th || !$last_name_th || !$class_id)
        jsonError('ข้อมูลไม่ครบ: student_id, first_name_th, last_name_th, class_id จำเป็นต้องมี');

    $chk = $conn->prepare("SELECT COUNT(*) FROM students WHERE student_id = ?");
    $chk->execute([$student_id]);
    if($chk->fetchColumn()) jsonError('รหัสนักเรียนนี้มีอยู่แล้ว', 409);

    $conn->prepare(
        "INSERT INTO students (student_id, first_name_th, last_name_th, class_id, student_number, gender)
         VALUES (?, ?, ?, ?, ?, ?)"
    )->execute([$student_id, $first_name_th, $last_name_th, $class_id, $student_number, $gender]);

    jsonResponse(['success' => true, 'message' => 'เพิ่มนักเรียนสำเร็จ'], 201);
}

// ─── PUT (update) ────────────────────────────────────────────────
if($method === 'PUT') {
    $id = (int)($_GET['id'] ?? 0);
    if(!$id) jsonError('ไม่พบ id');
    $b = getBody();
    $first_name_th = trim($b['first_name_th'] ?? '');
    $last_name_th  = trim($b['last_name_th']  ?? '');
    $class_id      = (int)($b['class_id']     ?? 0);
    $student_number= trim($b['student_number']?? '');
    $gender        = $b['gender'] ?? '';

    if(!$first_name_th || !$last_name_th || !$class_id)
        jsonError('ข้อมูลไม่ครบ');

    $conn->prepare(
        "UPDATE students SET first_name_th=?, last_name_th=?, class_id=?, student_number=?, gender=?
         WHERE `$pk` = ?"
    )->execute([$first_name_th, $last_name_th, $class_id, $student_number, $gender, $id]);

    jsonResponse(['success' => true, 'message' => 'แก้ไขข้อมูลสำเร็จ']);
}

// ─── DELETE ─────────────────────────────────────────────────────
if($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if(!$id) jsonError('ไม่พบ id');
    $conn->prepare("DELETE FROM students WHERE `$pk` = ?")->execute([$id]);
    jsonResponse(['success' => true, 'message' => 'ลบนักเรียนสำเร็จ']);
}

jsonError('Method not allowed', 405);
