<?php
// api/auth/me.php
require_once __DIR__ . '/../../api/cors.php';
setCorsHeaders();
$teacher = requireAuth();
jsonResponse(['success' => true, 'teacher' => $teacher]);
