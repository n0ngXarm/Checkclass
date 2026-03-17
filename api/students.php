<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Unauthorized'], 401);
}

// GET: ดึงรายการนักเรียนทั้งหมด
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $class_id = $_GET['class_id'] ?? null;
    $semester_id = $_GET['semester_id'] ?? null;
    
    $sql = "
        SELECT 
            s.student_id,
            s.student_code,
            s.title,
            s.first_name,
            s.last_name,
            u.user_id,
            u.username,
            u.email,
            u.is_approved,
            p.phone,
            p.avatar,
            e.class_id,
            e.status as enrollment_status,
            c.class_name,
            d.dept_name
        FROM student s
        LEFT JOIN users u ON s.user_id = u.user_id
        LEFT JOIN profiles p ON u.user_id = p.user_id
        LEFT JOIN enrollments e ON s.student_id = e.student_id
        LEFT JOIN classes c ON e.class_id = c.class_id
        LEFT JOIN departments d ON c.dept_id = d.dept_id
        WHERE 1=1
    ";
    
    $params = [];
    
    if ($class_id) {
        $sql .= " AND e.class_id = ?";
        $params[] = $class_id;
    }
    
    if ($semester_id) {
        $sql .= " AND e.semester_id = ?";
        $params[] = $semester_id;
    }
    
    $sql .= " ORDER BY s.student_code";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendJSON($students);
}

// POST: เพิ่มนักเรียนใหม่
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // ตรวจสอบสิทธิ์ (ต้องเป็น SUPER_ADMIN หรือ TEACHER)
    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $role_id = $stmt->fetchColumn();
    
    if ($role_id > 2) { // ไม่ใช่ SUPER_ADMIN หรือ TEACHER
        sendJSON(['error' => 'Forbidden'], 403);
    }
    
    $input = getJSONInput();
    
    // เริ่ม transaction
    $db->beginTransaction();
    
    try {
        // ตรวจสอบรหัสนักศึกษาซ้ำ
        $check = $db->prepare("SELECT student_id FROM student WHERE student_code = ?");
        $check->execute([$input['student_code']]);
        if ($check->fetch()) {
            sendJSON(['error' => 'Student code already exists'], 400);
        }
        
        // สร้าง user (role_id = 3 สำหรับนักเรียน)
        $stmt = $db->prepare("
            INSERT INTO users (username, email, password, role_id, is_active, is_approved) 
            VALUES (?, ?, ?, 3, 1, 1)
        ");
        $stmt->execute([
            $input['student_code'],
            $input['email'] ?? ($input['student_code'] . '@student.school.com'),
            password_hash('1234', PASSWORD_DEFAULT)
        ]);
        
        $user_id = $db->lastInsertId();
        
        // สร้าง profile
        $stmt = $db->prepare("
            INSERT INTO profiles (user_id, title, first_name, last_name, phone) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $user_id,
            $input['title'],
            $input['first_name'],
            $input['last_name'],
            $input['phone'] ?? ''
        ]);
        
        // สร้าง student
        $stmt = $db->prepare("
            INSERT INTO student (user_id, student_code, title, first_name, last_name) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $user_id,
            $input['student_code'],
            $input['title'],
            $input['first_name'],
            $input['last_name']
        ]);
        
        $student_id = $db->lastInsertId();
        
        // ลงทะเบียนเรียน (ถ้ามีการเลือกห้อง)
        if (!empty($input['class_id']) && !empty($input['semester_id'])) {
            $stmt = $db->prepare("
                INSERT INTO enrollments (student_id, class_id, semester_id, enrollment_date, status) 
                VALUES (?, ?, ?, CURDATE(), 'กำลังศึกษา')
            ");
            $stmt->execute([$student_id, $input['class_id'], $input['semester_id']]);
        }
        
        $db->commit();
        sendJSON(['success' => true, 'student_id' => $student_id]);
        
    } catch (Exception $e) {
        $db->rollBack();
        sendJSON(['error' => $e->getMessage()], 500);
    }
}

// PUT: แก้ไขนักเรียน
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    parse_str(file_get_contents("php://input"), $_PUT);
    $student_id = $_GET['id'] ?? null;
    
    if (!$student_id) {
        sendJSON(['error' => 'Student ID required'], 400);
    }
    
    $input = getJSONInput();
    
    // อัปเดต student
    $stmt = $db->prepare("
        UPDATE student SET 
            title = ?,
            first_name = ?,
            last_name = ?
        WHERE student_id = ?
    ");
    $stmt->execute([
        $input['title'],
        $input['first_name'],
        $input['last_name'],
        $student_id
    ]);
    
    // อัปเดต profile (ถ้ามี user_id)
    $stmt = $db->prepare("SELECT user_id FROM student WHERE student_id = ?");
    $stmt->execute([$student_id]);
    $user_id = $stmt->fetchColumn();
    
    if ($user_id) {
        $stmt = $db->prepare("
            UPDATE profiles SET 
                title = ?,
                first_name = ?,
                last_name = ?,
                phone = ?
            WHERE user_id = ?
        ");
        $stmt->execute([
            $input['title'],
            $input['first_name'],
            $input['last_name'],
            $input['phone'] ?? '',
            $user_id
        ]);
    }
    
    sendJSON(['success' => true, 'message' => 'Student updated']);
}

// DELETE: ลบนักเรียน
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // ตรวจสอบสิทธิ์ (SUPER_ADMIN เท่านั้น)
    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $role_id = $stmt->fetchColumn();
    
    if ($role_id != 1) {
        sendJSON(['error' => 'Forbidden'], 403);
    }
    
    $student_id = $_GET['id'] ?? null;
    
    if (!$student_id) {
        sendJSON(['error' => 'Student ID required'], 400);
    }
    
    // ตรวจสอบว่ามีประวัติเช็คชื่อหรือไม่
    $check = $db->prepare("SELECT COUNT(*) FROM attendance WHERE student_id = ?");
    $check->execute([$student_id]);
    $count = $check->fetchColumn();
    
    if ($count > 0) {
        sendJSON(['error' => 'Cannot delete student with attendance history'], 400);
    }
    
    // ลบ student (cascade ไปลบ enrollments)
    $stmt = $db->prepare("DELETE FROM student WHERE student_id = ?");
    $stmt->execute([$student_id]);
    
    sendJSON(['success' => true, 'message' => 'Student deleted']);
}

sendJSON(['error' => 'Method not allowed'], 405);
?>