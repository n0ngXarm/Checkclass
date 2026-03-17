<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';

echo "--- Debug Register ---\n";

try {
    echo "1. Getting Input...\n";
    $input = getJSONInput();
    if (!$input) {
        $input = $_POST; // Fallback to POST for manual testing
        echo "Note: Using POST fallback\n";
    }
    print_r($input);

    echo "2. Validating...\n";
    $required = ['teacher_code', 'username', 'password', 'first_name', 'last_name', 'dept_id'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            echo "ERROR: Field '$field' is missing\n";
        }
    }

    echo "3. Testing DB Connection...\n";
    $stmt = $db->query("SELECT 1");
    echo "DB OK\n";

    echo "4. Checking Tables...\n";
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables found: " . implode(", ", $tables) . "\n";

    if (in_array('users', $tables)) {
        echo "5. Checking columns for 'users'...\n";
        $cols = $db->query("DESCRIBE users")->fetchAll(PDO::FETCH_ASSOC);
        foreach($cols as $c) echo "  - " . $c['Field'] . "\n";
    } else {
        echo "ERROR: Table 'users' NOT FOUND\n";
    }

    $teacherTable = in_array('teacher', $tables) ? 'teacher' : (in_array('teachers', $tables) ? 'teachers' : null);
    if ($teacherTable) {
        echo "6. Checking columns for '$teacherTable'...\n";
        $cols = $db->query("DESCRIBE $teacherTable")->fetchAll(PDO::FETCH_ASSOC);
        foreach($cols as $c) echo "  - " . $c['Field'] . "\n";
    } else {
        echo "ERROR: Teacher table NOT FOUND\n";
    }

    echo "\nDebug Complete.";

} catch (Exception $e) {
    echo "\nFATAL ERROR: " . $e->getMessage();
}
?>
