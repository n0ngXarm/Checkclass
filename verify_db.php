<?php
require 'api/cors.php';
require 'config/database.php';

$db = new Database();
$conn = $db->getConnection();

echo "Checking indexes on attendance_records...\n";
$stmt = $conn->query("SHOW INDEX FROM attendance_records");
$indexes = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($indexes as $idx) {
    echo "Index: {$idx['Key_name']}, Column: {$idx['Column_name']}, Unique: " . ($idx['Non_unique'] == 0 ? 'Yes' : 'No') . "\n";
}
echo "\nChecking rows count...\n";
$stmt2 = $conn->query("SELECT COUNT(*) FROM attendance_records");
echo "Total Rows: " . $stmt2->fetchColumn() . "\n";
