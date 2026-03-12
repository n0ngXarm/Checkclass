<?php
require_once 'auth_check.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST' || !isset($_POST['save_class'])) {
    header("Location: index.php");
    exit;
}

$class_id = $_POST['class_id'];
$semester_id = $_POST['semester_id'];
$check_date = $_POST['check_date'];
$year = $_POST['year'];
$semester = $_POST['semester'];
$statuses = $_POST['status'] ?? [];
$notes = $_POST['note'] ?? [];

$success_count = 0;
$error_count = 0;

foreach ($statuses as $student_id => $status) {
    $note = $notes[$student_id] ?? '';
    
    try {
        // ตรวจสอบว่ามีข้อมูลเดิมหรือไม่
        $check = $conn->prepare("SELECT attendance_id FROM attendance 
                                 WHERE student_id = ? AND check_in_date = ? AND semester_id = ?");
        $check->execute([$student_id, $check_date, $semester_id]);
        $existing = $check->fetch();

        if ($existing) {
            // อัปเดตข้อมูลเดิม
            $sql = "UPDATE attendance SET 
                    status = :status, 
                    note = :note,
                    teacher_id = :teacher_id,
                    class_id = :class_id,
                    check_in_time = :time
                    WHERE attendance_id = :id";
            
            $stmt = $conn->prepare($sql);
            $result = $stmt->execute([
                ':status' => $status,
                ':note' => $note,
                ':teacher_id' => $current_teacher_id,
                ':class_id' => $class_id,
                ':time' => date('H:i:s'),
                ':id' => $existing['attendance_id']
            ]);
        } else {
            // เพิ่มข้อมูลใหม่
            $sql = "INSERT INTO attendance 
                    (student_id, teacher_id, class_id, check_in_date, check_in_time, status, note, semester_id) 
                    VALUES 
                    (:student_id, :teacher_id, :class_id, :date, :time, :status, :note, :semester_id)";
            
            $stmt = $conn->prepare($sql);
            $result = $stmt->execute([
                ':student_id' => $student_id,
                ':teacher_id' => $current_teacher_id,
                ':class_id' => $class_id,
                ':date' => $check_date,
                ':time' => date('H:i:s'),
                ':status' => $status,
                ':note' => $note,
                ':semester_id' => $semester_id
            ]);
        }
        
        if ($result) $success_count++;
        else $error_count++;
        
    } catch (Exception $e) {
        $error_count++;
    }
}

// เก็บข้อความแจ้งเตือน
$_SESSION['message'] = "✅ บันทึกสำเร็จ $success_count รายการ";
if ($error_count > 0) {
    $_SESSION['message'] .= " ❌ ล้มเหลว $error_count รายการ";
}

header("Location: index.php?year=$year&semester=$semester");
exit;
?>