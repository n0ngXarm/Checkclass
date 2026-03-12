<?php
require_once 'auth_check.php';

// ดึงข้อมูลห้องเรียนทั้งหมด
$classes = $conn->query("SELECT c.class_id, c.class_name, d.dept_name 
                         FROM classes c 
                         JOIN departments d ON c.dept_id = d.dept_id 
                         WHERE c.academic_year = 2026 AND c.semester = '1'
                         ORDER BY d.dept_name, c.class_name")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>เพิ่มนักเรียน</title>
    <link rel="stylesheet" href="../style.css">
    <style>
        * { box-sizing: border-box; }
        body {
            background: #f5f7fa;
            font-family: 'Segoe UI', sans-serif;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }
        h1 { color: #333; }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #555;
        }
        input, select {
            width: 100%;
            padding: 10px;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            font-size: 16px;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        .form-row {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
        }
        .form-row .form-group {
            flex: 1;
            margin-bottom: 0;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
        }
        button:hover {
            background: #764ba2;
        }
        .message {
            padding: 10px 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .nav-links {
            margin-top: 30px;
            text-align: center;
        }
        .nav-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>➕ เพิ่มนักเรียนใหม่</h1>
            <div>
                <a href="index.php">🏠 หน้าหลัก</a> |
                <a href="edit_student.php">✏️ จัดการ</a>
            </div>
        </div>

        <?php
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $student_code = trim($_POST['student_code']);
            $title = $_POST['title'];
            $first_name = trim($_POST['first_name']);
            $last_name = trim($_POST['last_name']);
            $class_id = $_POST['class_id'] ?: null;
            
            $errors = [];
            
            if (empty($student_code)) $errors[] = "กรุณากรอกรหัสนักศึกษา";
            if (empty($first_name)) $errors[] = "กรุณากรอกชื่อ";
            if (empty($last_name)) $errors[] = "กรุณากรอกนามสกุล";
            
            // ตรวจสอบรหัสซ้ำ
            $check = $conn->prepare("SELECT student_id FROM student WHERE student_code = ?");
            $check->execute([$student_code]);
            if ($check->fetch()) {
                $errors[] = "รหัสนักศึกษานี้มีอยู่ในระบบแล้ว";
            }
            
            if (empty($errors)) {
                try {
                    $stmt = $conn->prepare("INSERT INTO student (student_code, title, first_name, last_name) VALUES (?, ?, ?, ?)");
                    if ($stmt->execute([$student_code, $title, $first_name, $last_name])) {
                        $student_id = $conn->lastInsertId();
                        
                        // ถ้ามีการเลือกห้อง ให้ลงทะเบียนเลย
                        if ($class_id) {
                            // หา semester_id ปัจจุบัน
                            $semester = $conn->prepare("SELECT semester_id FROM semesters WHERE academic_year = 2026 AND semester = '1' AND is_active = 1");
                            $semester->execute();
                            $semester_id = $semester->fetchColumn();
                            
                            if ($semester_id) {
                                $enroll = $conn->prepare("INSERT INTO enrollments (student_id, class_id, semester_id, enrollment_date, status) VALUES (?, ?, ?, CURDATE(), 'กำลังศึกษา')");
                                $enroll->execute([$student_id, $class_id, $semester_id]);
                            }
                        }
                        
                        echo "<div class='message success'>✅ เพิ่มนักเรียนเรียบร้อยแล้ว</div>";
                    }
                } catch (Exception $e) {
                    echo "<div class='message error'>❌ เกิดข้อผิดพลาด: " . $e->getMessage() . "</div>";
                }
            } else {
                echo "<div class='message error'>❌ " . implode('<br>', $errors) . "</div>";
            }
        }
        ?>

        <form method="POST">
            <div class="form-group">
                <label>📌 รหัสนักศึกษา <span style="color:red;">*</span></label>
                <input type="text" name="student_code" required placeholder="เช่น 68319010039" value="<?= htmlspecialchars($_POST['student_code'] ?? '') ?>">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>👤 คำนำหน้า</label>
                    <select name="title">
                        <option value="นาย" <?= ($_POST['title'] ?? '') == 'นาย' ? 'selected' : '' ?>>นาย</option>
                        <option value="นางสาว" <?= ($_POST['title'] ?? '') == 'นางสาว' ? 'selected' : '' ?>>นางสาว</option>
                        <option value="นาง" <?= ($_POST['title'] ?? '') == 'นาง' ? 'selected' : '' ?>>นาง</option>
                        <option value="เด็กชาย" <?= ($_POST['title'] ?? '') == 'เด็กชาย' ? 'selected' : '' ?>>เด็กชาย</option>
                        <option value="เด็กหญิง" <?= ($_POST['title'] ?? '') == 'เด็กหญิง' ? 'selected' : '' ?>>เด็กหญิง</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>ชื่อ <span style="color:red;">*</span></label>
                    <input type="text" name="first_name" required value="<?= htmlspecialchars($_POST['first_name'] ?? '') ?>">
                </div>
                <div class="form-group">
                    <label>นามสกุล <span style="color:red;">*</span></label>
                    <input type="text" name="last_name" required value="<?= htmlspecialchars($_POST['last_name'] ?? '') ?>">
                </div>
            </div>

            <div class="form-group">
                <label>🏫 ลงทะเบียนเข้าเรียน (ภาคเรียนปัจจุบัน)</label>
                <select name="class_id">
                    <option value="">-- ไม่ต้องลงทะเบียน --</option>
                    <?php foreach ($classes as $class): ?>
                        <option value="<?= $class['class_id'] ?>" <?= ($_POST['class_id'] ?? '') == $class['class_id'] ? 'selected' : '' ?>>
                            [<?= $class['dept_name'] ?>] <?= $class['class_name'] ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <small style="color: #666;">เลือกห้องเพื่อลงทะเบียนเรียนทันที (ไม่เลือกก็ได้)</small>
            </div>

            <button type="submit">💾 บันทึกข้อมูล</button>
        </form>

        <div class="nav-links">
            <a href="index.php">🏠 หน้าหลัก</a>
            <a href="edit_student.php">✏️ จัดการนักเรียน</a>
        </div>
    </div>
</body>
</html>