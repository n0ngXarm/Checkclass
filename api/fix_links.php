<?php
require_once 'config.php';

try {
    echo "Fixing links for teachers...\n";
    $users = $conn->query("SELECT user_id, username FROM users WHERE role = 'teacher'")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($users as $u) {
        echo "Checking teacher {$u['username']} (UID: {$u['user_id']})...\n";
        $stmt = $conn->prepare("UPDATE teachers SET user_id = ? WHERE teacher_code = ?");
        $stmt->execute([$u['user_id'], $u['username']]);
    }

    echo "\nFixing links for students...\n";
    $users = $conn->query("SELECT user_id, username FROM users WHERE role = 'student'")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($users as $u) {
        echo "Checking student {$u['username']} (UID: {$u['user_id']})...\n";
        $stmt = $conn->prepare("UPDATE students SET user_id = ? WHERE student_code = ?");
        $stmt->execute([$u['user_id'], $u['username']]);
    }
    
    echo "\nDone.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
