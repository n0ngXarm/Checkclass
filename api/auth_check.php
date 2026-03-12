<?php
// เรียกใช้ config เพื่อเริ่ม session
require_once 'config.php';

// ตรวจสอบว่าล็อกอินหรือยัง
if (!isset($_SESSION['teacher_loggedin']) || $_SESSION['teacher_loggedin'] !== true) {
    header("Location: login.php");
    exit;
}

// เก็บข้อมูลอาจารย์
$current_teacher_id = $_SESSION['teacher_id'];
$current_teacher_name = $_SESSION['teacher_name'];
$current_teacher_code = $_SESSION['teacher_code'];
?>