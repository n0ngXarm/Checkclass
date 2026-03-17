<?php
require_once 'config.php';
session_start();

// ตรวจสอบสิทธิ์ (อย่างง่าย)
if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Unauthorized'], 401);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // ดึงรายการครูทั้งหมด
    $stmt = $db->query("
        SELECT 
            t.teacher_id,
            t.teacher_code,
            t.academic_title,
            t.personal_title,
            t.first_name,
            t.last_name,
            t.dept_id,
            d.dept_name,
            u.user_id,
            u.username,
            u.email,
            u.is_approved,
            p.phone,
            p.avatar
        FROM teacher t
        LEFT JOIN users u ON t.user_id = u.user_id
        LEFT JOIN profiles p ON u.user_id = p.user_id
        LEFT JOIN departments d ON t.dept_id = d.dept_id
        ORDER BY t.teacher_code
    ");
    
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendJSON($teachers);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // เพิ่มครูใหม่ (ต้องเป็น SUPER_ADMIN)
    // ตรวจสอบ role
    $stmt = $db->prepare("SELECT role_id FROM users WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $role_id = $stmt->fetchColumn();
    
    if ($role_id != 1) { // SUPER_ADMIN
        sendJSON(['error' => 'Forbidden'], 403);
    }
    
    $input = getJSONInput();
    
    // เริ่ม transaction
    $db->beginTransaction();
    
    try {
        // สร้าง user
        $stmt = $db->prepare("
            INSERT INTO users (username, email, password, role_id, is_active, is_approved) 
            VALUES (?, ?, ?, 2, 1, 1)
        ");
        $stmt->execute([
            $input['teacher_code'],
            $input['email'] ?? ($input['teacher_code'] . '@school.com'),
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
            $input['academic_title'] . $input['personal_title'],
            $input['first_name'],
            $input['last_name'],
            $input['phone'] ?? ''
        ]);
        
        // สร้าง teacher
        $stmt = $db->prepare("
            INSERT INTO teacher (user_id, teacher_code, academic_title, personal_title, first_name, last_name, dept_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $user_id,
            $input['teacher_code'],
            $input['academic_title'] ?? '',
            $input['personal_title'],
            $input['first_name'],
            $input['last_name'],
            $input['dept_id'] ?? null
        ]);
        
        $db->commit();
        sendJSON(['success' => true, 'teacher_id' => $db->lastInsertId()]);
        
    } catch (Exception $e) {
        $db->rollBack();
        sendJSON(['error' => $e->getMessage()], 500);
    }
}

sendJSON(['error' => 'Method not allowed'], 405);
?>