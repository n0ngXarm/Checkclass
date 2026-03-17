<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Unauthorized'], 401);
}

// GET: ดึงข้อมูลเช็คชื่อของวันนี้
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $class_id = $_GET['class_id'] ?? null;
    $date = $_GET['date'] ?? date('Y-m-d');
    
    if (!$class_id) {
        sendJSON(['error' => 'class_id required'], 400);
    }
    
    // หา semester_id
    $stmt = $db->prepare("
        SELECT semester_id FROM semesters 
        WHERE academic_year = YEAR(?) AND semester = ?
    ");
    $stmt->execute([$date, '1']); // hardcode semester 1
    $semester_id = $stmt->fetchColumn();
    
    // ดึงนักเรียนในห้อง พร้อมสถานะเช็คชื่อวันนี้
    $stmt = $db->prepare("
        SELECT 
            s.student_id,
            s.student_code,
            s.title,
            s.first_name,
            s.last_name,
            a.attendance_id,
            a.status,
            a.note,
            a.check_in_time
        FROM enrollments e
        JOIN student s ON e.student_id = s.student_id
        LEFT JOIN attendance a ON a.student_id = s.student_id 
            AND a.check_in_date = ? 
            AND a.semester_id = ?
        WHERE e.class_id = ? 
            AND e.semester_id = ?
            AND e.status = 'กำลังศึกษา'
        ORDER BY s.student_code
    ");
    $stmt->execute([$date, $semester_id, $class_id, $semester_id]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendJSON([
        'date' => $date,
        'class_id' => $class_id,
        'students' => $students
    ]);
}

// POST: บันทึกเช็คชื่อ
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJSONInput();
    
    $class_id = $input['class_id'];
    $date = $input['date'] ?? date('Y-m-d');
    $attendances = $input['attendances'] ?? [];
    
    // หา semester_id
    $stmt = $db->prepare("
        SELECT semester_id FROM semesters 
        WHERE academic_year = YEAR(?) AND semester = ?
    ");
    $stmt->execute([$date, '1']);
    $semester_id = $stmt->fetchColumn();
    
    // หา teacher_id จาก user_id
    $stmt = $db->prepare("SELECT teacher_id FROM teacher WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $teacher_id = $stmt->fetchColumn();
    
    $db->beginTransaction();
    
    try {
        foreach ($attendances as $att) {
            $student_id = $att['student_id'];
            $status = $att['status'];
            $note = $att['note'] ?? '';
            
            // ตรวจสอบว่ามีข้อมูลเดิมหรือไม่
            $check = $db->prepare("
                SELECT attendance_id FROM attendance 
                WHERE student_id = ? AND check_in_date = ? AND semester_id = ?
            ");
            $check->execute([$student_id, $date, $semester_id]);
            $existing = $check->fetch();
            
            if ($existing) {
                // อัปเดต
                $stmt = $db->prepare("
                    UPDATE attendance SET 
                        status = ?,
                        note = ?,
                        teacher_id = ?,
                        check_in_time = ?
                    WHERE attendance_id = ?
                ");
                $stmt->execute([$status, $note, $teacher_id, date('H:i:s'), $existing['attendance_id']]);
            } else {
                // เพิ่มใหม่
                $stmt = $db->prepare("
                    INSERT INTO attendance 
                    (student_id, teacher_id, class_id, check_in_date, check_in_time, status, note, semester_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([$student_id, $teacher_id, $class_id, $date, date('H:i:s'), $status, $note, $semester_id]);
            }
        }
        
        $db->commit();
        sendJSON(['success' => true, 'message' => 'Attendance saved']);
        
    } catch (Exception $e) {
        $db->rollBack();
        sendJSON(['error' => $e->getMessage()], 500);
    }
}

sendJSON(['error' => 'Method not allowed'], 405);
?>