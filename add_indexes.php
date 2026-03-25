<?php
require 'config/database.php';
$db = new Database();
$conn = $db->getConnection();

$queries = [
    "ALTER TABLE attendance_records ADD INDEX idx_check_in_date (check_in_date)",
    "ALTER TABLE attendance_records ADD INDEX idx_semester_class (semester_id, class_id)",
    "ALTER TABLE attendance_records ADD INDEX idx_student_date (student_id, check_in_date)",
    "ALTER TABLE students ADD INDEX idx_class_id (class_id)"
];

foreach ($queries as $q) {
    try {
        $conn->exec($q);
        echo "Success: $q\n";
    } catch (PDOException $e) {
        $msg = $e->getMessage();
        if (strpos($msg, 'Duplicate key name') !== false) {
            echo "Index already exists: $q\n";
        } else {
            echo "Error: " . $msg . "\n";
        }
    }
}
echo "Done adding optimization indexes.\n";
