<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];

// GET: ดึงข้อมูลการเช็คชื่อ
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $date = $_GET['date'] ?? date('Y-m-d');
    $class = $_GET['class'] ?? '';

    try {
        $sql = "
            SELECT 
                a.attendance_id,
                s.student_id,
                a.status,
                a.note,
                a.check_time,
                s.student_code,
                s.title,
                s.first_name,
                s.last_name,
                s.class
            FROM attendance a
            RIGHT JOIN students s ON a.student_id = s.student_id AND a.check_date = ?
            WHERE 1=1
        ";
        
        $params = [$date];
        
        if (!empty($class)) {
            $sql .= " AND s.class = ?";
            $params[] = $class;
        }
        
        $sql .= " ORDER BY s.student_code";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($attendance);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    exit();
}

// POST: บันทึกการเช็คชื่อ
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($role !== 'teacher' && $role !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['attendance']) || !is_array($input['attendance'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data']);
        exit();
    }

    $date = $input['date'] ?? date('Y-m-d');
    $time = date('H:i:s');

    // หา teacher_id จาก user_id
    $stmt = $conn->prepare("SELECT teacher_id FROM teachers WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $teacher_id = $stmt->fetchColumn();

    if (!$teacher_id) {
        http_response_code(403);
        echo json_encode(['error' => 'Teacher not found']);
        exit();
    }

    $conn->beginTransaction();

    try {
        foreach ($input['attendance'] as $item) {
            $student_id = $item['student_id'];
            $status = $item['status'];
            $note = $item['note'] ?? '';

            // ตรวจสอบว่ามีข้อมูลเดิมหรือไม่
            $check = $conn->prepare("SELECT attendance_id FROM attendance WHERE student_id = ? AND check_date = ?");
            $check->execute([$student_id, $date]);
            $existing = $check->fetch();

            if ($existing) {
                // อัปเดต
                $stmt = $conn->prepare("
                    UPDATE attendance 
                    SET status = ?, note = ?, teacher_id = ?, check_time = ?
                    WHERE attendance_id = ?
                ");
                $stmt->execute([$status, $note, $teacher_id, $time, $existing['attendance_id']]);
            } else {
                // เพิ่มใหม่
                $stmt = $conn->prepare("
                    INSERT INTO attendance (student_id, teacher_id, check_date, check_time, status, note)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([$student_id, $teacher_id, $date, $time, $status, $note]);
            }
        }

        $conn->commit();
        echo json_encode(['success' => true]);

    } catch (PDOException $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>