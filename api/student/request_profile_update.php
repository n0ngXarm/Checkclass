<?php
require_once '../config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];

// GET: ดึงคำขอแก้ไขโปรไฟล์ของตัวเอง
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("
        SELECT r.*,
               CONCAT(t.first_name, ' ', t.last_name) as approver_name
        FROM profile_update_requests r
        LEFT JOIN users u ON r.approved_by = u.user_id
        LEFT JOIN teacher t ON u.user_id = t.user_id
        WHERE r.user_id = ?
        ORDER BY r.requested_at DESC
    ");
    $stmt->execute([$user_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// POST: ขอแก้ไขโปรไฟล์
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $field_name = $input['field_name'];
    $new_value = $input['new_value'];
    $reason = $input['reason'] ?? '';
    
    // ตรวจสอบว่ามีคำขอที่ pending อยู่หรือไม่
    $check = $conn->prepare("
        SELECT request_id FROM profile_update_requests 
        WHERE user_id = ? AND field_name = ? AND status = 'pending'
    ");
    $check->execute([$user_id, $field_name]);
    if ($check->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'มีคำขอแก้ไขฟิลด์นี้ที่รอการอนุมัติอยู่แล้ว']);
        exit;
    }
    
    // ดึงค่าเก่า
    if ($field_name === 'phone') {
        $stmt = $conn->prepare("SELECT phone FROM profiles WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $old_value = $stmt->fetchColumn();
    } elseif ($field_name === 'address') {
        $stmt = $conn->prepare("SELECT address FROM student WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $old_value = $stmt->fetchColumn();
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid field name']);
        exit;
    }
    
    // สร้างคำขอ
    $stmt = $conn->prepare("
        INSERT INTO profile_update_requests 
        (user_id, field_name, old_value, new_value, reason) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$user_id, $field_name, $old_value, $new_value, $reason]);
    
    echo json_encode([
        'success' => true,
        'message' => 'ส่งคำขอแก้ไขโปรไฟล์เรียบร้อย',
        'request_id' => $conn->lastInsertId()
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>