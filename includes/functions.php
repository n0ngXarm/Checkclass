<?php
require_once __DIR__ . '/../config/database.php';

function getThaiMonth($date) {
    $months = [
        '01' => 'มกราคม', '02' => 'กุมภาพันธ์', '03' => 'มีนาคม',
        '04' => 'เมษายน', '05' => 'พฤษภาคม', '06' => 'มิถุนายน',
        '07' => 'กรกฎาคม', '08' => 'สิงหาคม', '09' => 'กันยายน',
        '10' => 'ตุลาคม', '11' => 'พฤศจิกายน', '12' => 'ธันวาคม'
    ];
    $month = date('m', strtotime($date));
    return $months[$month];
}

function getStatusBadge($status) {
    switch($status) {
        case 'มาเรียน':
            return '<span class="badge bg-success">มาเรียน</span>';
        case 'สาย':
        case 'มาสาย':
            return '<span class="badge bg-warning text-dark">มาสาย</span>';
        case 'ขาดเรียน':
            return '<span class="badge bg-danger">ขาดเรียน</span>';
        case 'ลา':
            return '<span class="badge bg-info">ลา</span>';
        default:
            return '<span class="badge bg-secondary">ไม่ระบุ</span>';
    }
}

function getClassList() {
    $db = new Database();
    $conn = $db->getConnection();
    
    $query = "SELECT c.*, el.level_name_th, d.dept_name_th 
              FROM classes c
              JOIN education_levels el ON c.level_id = el.level_id
              JOIN departments d ON c.dept_id = d.dept_id
              ORDER BY el.level_order, c.room";
    $stmt = $conn->query($query);
    return $stmt->fetchAll();
}

function getCurrentSemester() {
    $db = new Database();
    $conn = $db->getConnection();
    
    $query = "SELECT * FROM semesters WHERE is_current = 1 LIMIT 1";
    $stmt = $conn->query($query);
    return $stmt->fetch();
}
?>