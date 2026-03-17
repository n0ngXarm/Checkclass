<?php
require_once 'config.php';

try {
    echo "Checking students table structure...\n";
    $stmt = $conn->query("DESCRIBE students");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('user_id', $cols)) {
        echo "Adding user_id column to students table...\n";
        $conn->exec("ALTER TABLE students ADD COLUMN user_id INT AFTER student_id");
        $conn->exec("ALTER TABLE students ADD FOREIGN KEY (user_id) REFERENCES users(user_id)");
        echo "Column user_id added successfully.\n";
    } else {
        echo "Column user_id already exists in students table.\n";
    }
    
    // Check if test student S001 is linked
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE username = 'S001'");
    $stmt->execute();
    $uid = $stmt->fetchColumn();
    
    if ($uid) {
        echo "Linking S001 to user_id $uid...\n";
        $stmt = $conn->prepare("UPDATE students SET user_id = ? WHERE student_code = 'S001'");
        $stmt->execute([$uid]);
        echo "Linked successfully.\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
