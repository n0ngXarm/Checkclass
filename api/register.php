<?php
require_once 'config.php';

// Registration is open to anyone
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Method not allowed'], 405);
}

$input = getJSONInput();

// Basic validation
$required = ['teacher_code', 'username', 'password', 'first_name', 'last_name', 'dept_id'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        sendJSON(['error' => "Field '$field' is required"], 400);
    }
}

// Start transaction
$db->beginTransaction();

try {
    // Check if username already exists
    $checkUser = $db->prepare("SELECT user_id FROM users WHERE username = ?");
    $checkUser->execute([$input['username']]);
    if ($checkUser->fetch()) {
        sendJSON(['error' => 'Username already exists'], 400);
    }

    // Check if teacher code already exists
    $checkCode = $db->prepare("SELECT teacher_id FROM teacher WHERE teacher_code = ?");
    $checkCode->execute([$input['teacher_code']]);
    if ($checkCode->fetch()) {
        sendJSON(['error' => 'Teacher code already exists'], 400);
    }

    // 1. Create User (role_id = 2 for Teacher, is_approved = 0 for pending)
    $stmt = $db->prepare("
        INSERT INTO users (username, email, password, role_id, is_active, is_approved) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $input['username'],
        $input['email'] ?? ($input['username'] . '@school.com'),
        password_hash($input['password'], PASSWORD_DEFAULT),
        2, // Teacher
        1, // is_active
        0  // is_approved (pending)
    ]);
    
    $user_id = $db->lastInsertId();
    
    // 2. Create Profile
    $stmt = $db->prepare("
        INSERT INTO profiles (user_id, title, first_name, last_name, phone) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $user_id,
        $input['title'] ?? '',
        $input['first_name'],
        $input['last_name'],
        $input['phone'] ?? ''
    ]);
    
    // 3. Create Teacher entry
    $stmt = $db->prepare("
        INSERT INTO teacher (user_id, teacher_code, academic_title, personal_title, first_name, last_name, dept_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $user_id,
        $input['teacher_code'],
        $input['academic_title'] ?? '',
        $input['title'] ?? '',
        $input['first_name'],
        $input['last_name'],
        $input['dept_id']
    ]);
    
    $db->commit();
    sendJSON(['success' => true, 'message' => 'Registration successful, pending approval']);
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    // Return specific DB error if possible
    sendJSON(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
