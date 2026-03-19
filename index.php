<?php
// index.php
session_start();

// ถ้ายังไม่ login ให้ไปหน้า login
if(!isset($_SESSION['teacher_id'])) {
    header('Location: pages/login.php');
    exit;
} else {
    header('Location: pages/dashboard.php');
    exit;
}
?>