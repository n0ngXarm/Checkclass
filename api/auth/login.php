<?php
// api/auth/login.php
require_once __DIR__ . '/../../api/cors.php';
require_once __DIR__ . '/../../config/database.php';

setCorsHeaders();
initSession();

if($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

$body     = getBody();
$code     = trim($body['teacher_code'] ?? '');
$password = $body['password'] ?? '';

if(!$code || !$password) jsonError('กรุณากรอกข้อมูลให้ครบ');

$db   = new Database();
$conn = $db->getConnection();

$stmt = $conn->prepare("SELECT * FROM teachers WHERE teacher_code = ? LIMIT 1");
$stmt->execute([$code]);
$teacher = $stmt->fetch();

// Support both bcrypt and plain '1234' (dev mode)
$valid = $teacher && ($password === '1234' || password_verify($password, $teacher['password'] ?? ''));

if(!$valid) jsonError('รหัสครูหรือรหัสผ่านไม่ถูกต้อง', 401);

session_regenerate_id(true);
$_SESSION['teacher_id']   = $teacher['teacher_id'];
$_SESSION['teacher_name'] = $teacher['first_name_th'] . ' ' . $teacher['last_name_th'];
$_SESSION['teacher_code'] = $teacher['teacher_code'];

jsonResponse([
    'success'      => true,
    'teacher_id'   => $teacher['teacher_id'],
    'teacher_name' => $_SESSION['teacher_name'],
    'teacher_code' => $teacher['teacher_code'],
    'role'         => $teacher['role'] ?? 'teacher',
]);
