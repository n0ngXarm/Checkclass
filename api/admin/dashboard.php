<?php
require_once '../config.php';

// รับ token จาก Header
$headers = getallheaders();
$token = null;

if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
}

if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'No token provided']);
    exit;
}

// ใช้ token เป็น session_id
session_id($token);
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid session']);
    exit;
}

$user_id = $_SESSION['user_id'];
$year = $_GET['year'] ?? 2026;
$semester = $_GET['semester'] ?? '1';

try {
    // หา semester_id
    $stmt = $conn->prepare("SELECT semester_id FROM semesters WHERE academic_year = ? AND semester = ?");
    $stmt->execute([$year, $semester]);
    $semester_id = $stmt->fetchColumn();
    
    if (!$semester_id) {
        $semester_id = 1; // default
    }

    // 1. จำนวนนักเรียนทั้งหมด
    $total_students = $conn->query("SELECT COUNT(*) FROM student")->fetchColumn();

    // 2. จำนวนครูทั้งหมด
    $total_teachers = $conn->query("SELECT COUNT(*) FROM teacher")->fetchColumn();

    // 3. จำนวนห้องเรียนทั้งหมด
    $total_classes = $conn->query("SELECT COUNT(*) FROM classes WHERE academic_year = $year AND semester = '$semester'")->fetchColumn();

    // 4. จำนวนแผนก
    $total_departments = $conn->query("SELECT COUNT(*) FROM departments")->fetchColumn();

    // 5. จำนวนครูที่รออนุมัติ
    $pending_teachers = $conn->query("
        SELECT COUNT(*) FROM users 
        WHERE role_id = 2 AND is_approved = 0
    ")->fetchColumn();

// 6. สถิติการเข้าเรียนวันนี้
$today = date('Y-m-d');
$stmt = $conn->prepare("
    SELECT 
        COUNT(CASE WHEN status = 'มา' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'สาย' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'ขาด' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'ลา' THEN 1 END) as `leave`,
        COUNT(*) as total
    FROM attendance
    WHERE check_in_date = ? AND semester_id = ?
");
    $stmt->execute([$today, $semester_id]);
    $today_stats = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$today_stats['total']) {
        $today_stats = ['present' => 0, 'late' => 0, 'absent' => 0, 'leave' => 0, 'total' => 0];
    }

    // 7. สถิติแยกตามแผนก
    $dept_stats = $conn->query("
        SELECT 
            d.dept_name,
            COUNT(DISTINCT t.teacher_id) as teachers,
            COUNT(DISTINCT s.student_id) as students,
            COUNT(DISTINCT c.class_id) as classes
        FROM departments d
        LEFT JOIN teacher t ON d.dept_id = t.dept_id
        LEFT JOIN classes c ON d.dept_id = c.dept_id AND c.academic_year = $year AND c.semester = '$semester'
        LEFT JOIN enrollments e ON c.class_id = e.class_id AND e.semester_id = $semester_id
        LEFT JOIN student s ON e.student_id = s.student_id
        GROUP BY d.dept_id
        ORDER BY d.dept_name
    ")->fetchAll(PDO::FETCH_ASSOC);

    // 8. ประวัติการเช็คชื่อล่าสุด (10 รายการ)
    $recent = $conn->query("
        SELECT 
            a.attendance_id,
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
        WHERE a.semester_id = $semester_id
        ORDER BY a.check_in_date DESC, a.check_in_time DESC
        LIMIT 10
    ")->fetchAll(PDO::FETCH_ASSOC);

// 9. กราฟรายเดือน (6 เดือนล่าสุด)
$monthly = $conn->prepare("
    SELECT 
        DATE_FORMAT(check_in_date, '%Y-%m') as month,
        COUNT(CASE WHEN status = 'มา' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'สาย' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'ขาด' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'ลา' THEN 1 END) as `leave`,
        COUNT(*) as total
    FROM attendance
    WHERE semester_id = ?
    GROUP BY month
    ORDER BY month DESC
    LIMIT 6
");
    $monthly->execute([$semester_id]);
    $monthly_data = $monthly->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'overview' => [
            'total_students' => (int)$total_students,
            'total_teachers' => (int)$total_teachers,
            'total_classes' => (int)$total_classes,
            'total_departments' => (int)$total_departments,
            'pending_teachers' => (int)$pending_teachers
        ],
        'today' => $today_stats,
        'by_department' => $dept_stats,
        'recent' => $recent,
        'monthly' => $monthly_data
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>