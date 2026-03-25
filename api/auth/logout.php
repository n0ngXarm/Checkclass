<?php
// api/auth/logout.php
require_once __DIR__ . '/../../api/cors.php';
setCorsHeaders();
initSession();
$_SESSION = [];
session_destroy();
jsonResponse(['success' => true]);
