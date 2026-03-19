<?php
session_start();

function isLoggedIn() {
    return isset($_SESSION['teacher_id']);
}

function requireLogin() {
    if(!isLoggedIn()) {
        header('Location: /attendance_system_php/pages/login.php');
        exit;
    }
}

function getCurrentTeacher() {
    if(isLoggedIn()) {
        return [
            'id' => $_SESSION['teacher_id'],
            'name' => $_SESSION['teacher_name'],
            'code' => $_SESSION['teacher_code']
        ];
    }
    return null;
}
?>