<?php
require_once '../config.php';
session_start();

// ตรวจสอบว่าเป็น SUPER_ADMIN
$stmt = $conn->prepare("SELECT role_id FROM users WHERE user_id = ?");
$stmt->execute([$_SESSION['user_id']]);
if ($stmt->fetchColumn() != 1) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden - Admin only']);
    exit;
}

// GET: ดึงคำขอที่รออนุมัติ
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = $_GET['type'] ?? 'all'; // registration, profile, all
    
    $result = [];
    
    if ($type === 'all' || $type === 'registration') {
        // คำขอลงทะเบียน
        $reg = $conn->query("
            SELECT 
                r.*,
                s.student_code,
                CONCAT(s.title, s.first_name, ' ', s.last_name) as student_name,
                c.class_name,
                d.dept_name,
                sem.semester_name,
                u.username,
                p.phone
            FROM student_registration_requests r
            JOIN student s ON r.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            JOIN profiles p ON u.user_id = p.user_id
            JOIN classes c ON r.desired_class_id = c.class_id
            JOIN departments d ON c.dept_id = d.dept_id
            JOIN semesters sem ON r.desired_semester_id = sem.semester_id
            WHERE r.status = 'pending'
            ORDER BY r.requested_at DESC
        ")->fetchAll(PDO::FETCH_ASSOC);
        $result['registration'] = $reg;
    }
    
    if ($type === 'all' || $type === 'profile') {
        // คำขอแก้ไขโปรไฟล์
        $profile = $conn->query("
            SELECT 
                r.*,
                u.username,
                u.email,
                p.first_name,
                p.last_name,
                p.phone,
                s.address
            FROM profile_update_requests r
            JOIN users u ON r.user_id = u.user_id
            LEFT JOIN profiles p ON u.user_id = p.user_id
            LEFT JOIN student s ON u.user_id = s.user_id
            WHERE r.status = 'pending'
            ORDER BY r.requested_at DESC
        ")->fetchAll(PDO::FETCH_ASSOC);
        $result['profile'] = $profile;
    }
    
    echo json_encode($result);
    exit;
}

// POST: อนุมัติ/ปฏิเสธ
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $request_type = $input['type']; // registration, profile
    $request_id = $input['request_id'];
    $action = $input['action']; // approve, reject
    $reason = $input['reason'] ?? '';
    
    $conn->beginTransaction();
    
    try {
        if ($request_type === 'registration') {
            // อนุมัติคำขอลงทะเบียน
            $stmt = $conn->prepare("
                SELECT student_id, desired_class_id, desired_semester_id 
                FROM student_registration_requests 
                WHERE request_id = ? AND status = 'pending'
            ");
            $stmt->execute([$request_id]);
            $request = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$request) {
                throw new Exception('Request not found');
            }
            
            if ($action === 'approve') {
                // ลงทะเบียนเรียนจริง
                $stmt = $conn->prepare("
                    INSERT INTO enrollments 
                    (student_id, class_id, semester_id, enrollment_date, status) 
                    VALUES (?, ?, ?, CURDATE(), 'กำลังศึกษา')
                    ON DUPLICATE KEY UPDATE status = 'กำลังศึกษา'
                ");
                $stmt->execute([
                    $request['student_id'],
                    $request['desired_class_id'],
                    $request['desired_semester_id']
                ]);
            }
            
            // อัปเดตสถานะคำขอ
            $stmt = $conn->prepare("
                UPDATE student_registration_requests 
                SET status = ?, approved_by = ?, approved_at = NOW(), reason = ?
                WHERE request_id = ?
            ");
            $stmt->execute([$action, $_SESSION['user_id'], $reason, $request_id]);
            
        } elseif ($request_type === 'profile') {
            // อนุมัติคำขอแก้ไขโปรไฟล์
            $stmt = $conn->prepare("
                SELECT user_id, field_name, new_value 
                FROM profile_update_requests 
                WHERE request_id = ? AND status = 'pending'
            ");
            $stmt->execute([$request_id]);
            $request = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$request) {
                throw new Exception('Request not found');
            }
            
            if ($action === 'approve') {
                if ($request['field_name'] === 'phone') {
                    $stmt = $conn->prepare("UPDATE profiles SET phone = ? WHERE user_id = ?");
                    $stmt->execute([$request['new_value'], $request['user_id']]);
                } elseif ($request['field_name'] === 'address') {
                    $stmt = $conn->prepare("UPDATE student SET address = ? WHERE user_id = ?");
                    $stmt->execute([$request['new_value'], $request['user_id']]);
                }
            }
            
            // อัปเดตสถานะคำขอ
            $stmt = $conn->prepare("
                UPDATE profile_update_requests 
                SET status = ?, approved_by = ?, approved_at = NOW(), reason = ?
                WHERE request_id = ?
            ");
            $stmt->execute([$action, $_SESSION['user_id'], $reason, $request_id]);
        }
        
        $conn->commit();
        echo json_encode(['success' => true]);
        
    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>