<?php
// api/auth/logout.php
require_once __DIR__ . '/../../api/cors.php';
setCorsHeaders();
if(session_status() === PHP_SESSION_NONE) session_start();
$_SESSION = [];
session_destroy();
jsonResponse(['success' => true]);
