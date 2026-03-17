<?php
require_once 'config.php';

try {
    echo "Database: $dbname - CONNECTION SUCCESS\n\n";
    
    echo "Tables in database:\n";
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        echo "- $table\n";
        
        // Check columns
        $colStmt = $conn->query("DESCRIBE $table");
        $cols = $colStmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($cols as $col) {
            echo "  - {$col['Field']} ({$col['Type']})\n";
        }
        echo "\n";
    }
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
    exit();
}
?>
