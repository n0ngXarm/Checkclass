<?php
require_once 'config.php';

try {
    echo "Database: $dbname - CONNECTION SUCCESS\n\n";
    
    echo "Inspecting 'attendance' table:\n";
    $colStmt = $conn->query("DESCRIBE attendance");
    $cols = $colStmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $col) {
        echo "- {$col['Field']} ({$col['Type']})\n";
    }
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
    exit();
}
?>
