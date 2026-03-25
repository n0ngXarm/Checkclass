<?php
// api/cors.php — include this at top of every API file
function setCorsHeaders()
{
    $allowed = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://*.vercel.app',
    ];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    // Allow localhost and vercel.app origins
    if (
        $origin === 'http://localhost:3000' ||
        $origin === 'http://localhost:3001' ||
        preg_match('#^https://[a-z0-9\-]+\.vercel\.app$#', $origin)
    ) {
        header("Access-Control-Allow-Origin: $origin");
    }
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=utf-8");
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function jsonResponse($data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function jsonError(string $message, int $code = 400): void
{
    jsonResponse(['success' => false, 'error' => $message], $code);
}

function initSession(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 86400,
            'path' => '/',
            'domain' => '',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'None'
        ]);
        session_start();
    }
}

function requireAuth(): array
{
    initSession();
    if (empty($_SESSION['teacher_id'])) {
        jsonError('Unauthorized', 401);
    }
    return [
        'id' => $_SESSION['teacher_id'],
        'name' => $_SESSION['teacher_name'],
        'code' => $_SESSION['teacher_code'],
    ];
}

function getBody(): array
{
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}
