<?php
require_once 'auth_check.php';

// ดึงข้อมูลแผนก
$depts = $conn->query("SELECT dept_id, dept_name FROM departments ORDER BY dept_name")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>เพิ่มครู</title>
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
            <h1>👩‍🏫 เพิ่มครูใหม่</h1>
            <div>
                <a href="index.php">🏠 หน้าหลัก</a> |
                <a href="edit_teacher.php">✏️ จัดการ</a>
            </div>
        </div>

        <?php
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $teacher_code = trim($_POST['teacher_code']);
            $academic_title = $_POST['academic_title'];
            $personal_title = $_POST['personal_title'];
            $first_name = trim($_POST['first_name']);
            $last_name = trim($_POST['last_name']);
            $dept_id = $_POST['dept_id'] ?: null;
            $password = $_POST['password'] ?: $teacher_code;
            
            $errors = [];
            
            if (empty($teacher_code)) $errors[] = "กรุณากรอกรหัสครู";
            if (empty($first_name)) $errors[] = "กรุณากรอกชื่อ";
            if (empty($last_name)) $errors[] = "กรุณากรอกนามสกุล";
            
            // ตรวจสอบรหัสซ้ำ
            $check = $conn->prepare("SELECT teacher_id FROM teacher WHERE teacher_code = ?");
            $check->execute([$teacher_code]);
            if ($check->fetch()) {
                $errors[] = "รหัสครูนี้มีอยู่ในระบบแล้ว";
            }
            
            if (empty($errors)) {
                try {
                    $stmt = $conn->prepare("INSERT INTO teacher (teacher_code, academic_title, personal_title, first_name, last_name, dept_id, password) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    if ($stmt->execute([$teacher_code, $academic_title, $personal_title, $first_name, $last_name, $dept_id, $password])) {
                        echo "<div class='message success'>✅ เพิ่มครูเรียบร้อยแล้ว (รหัสผ่าน: $password)</div>";
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
                <label>📌 รหัสครู <span style="color:red;">*</span></label>
                <input type="text" name="teacher_code" required placeholder="เช่น T001" value="<?= htmlspecialchars($_POST['teacher_code'] ?? '') ?>">
            </div>

            <div class="form-group">
                <label>🔑 รหัสผ่าน (ถ้าไม่ใส่จะใช้รหัสครู)</label>
                <input type="text" name="password" placeholder="เว้นไว้ใช้รหัสครู" value="<?= htmlspecialchars($_POST['password'] ?? '') ?>">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>🎓 คำนำหน้าวิชาการ</label>
                    <select name="academic_title">
                        <option value="">ไม่มี</option>
                        <option value="ดร." <?= ($_POST['academic_title'] ?? '') == 'ดร.' ? 'selected' : '' ?>>ดร.</option>
                        <option value="ผศ." <?= ($_POST['academic_title'] ?? '') == 'ผศ.' ? 'selected' : '' ?>>ผศ.</option>
                        <option value="รศ." <?= ($_POST['academic_title'] ?? '') == 'รศ.' ? 'selected' : '' ?>>รศ.</option>
                        <option value="ศ." <?= ($_POST['academic_title'] ?? '') == 'ศ.' ? 'selected' : '' ?>>ศ.</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>👤 คำนำหน้าบุคคล <span style="color:red;">*</span></label>
                    <select name="personal_title" required>
                        <option value="นาย" <?= ($_POST['personal_title'] ?? '') == 'นาย' ? 'selected' : '' ?>>นาย</option>
                        <option value="นาง" <?= ($_POST['personal_title'] ?? '') == 'นาง' ? 'selected' : '' ?>>นาง</option>
                        <option value="นางสาว" <?= ($_POST['personal_title'] ?? '') == 'นางสาว' ? 'selected' : '' ?>>นางสาว</option>
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
                <label>🏢 แผนก</label>
                <select name="dept_id">
                    <option value="">-- ไม่ระบุ --</option>
                    <?php foreach ($depts as $dept): ?>
                        <option value="<?= $dept['dept_id'] ?>" <?= ($_POST['dept_id'] ?? '') == $dept['dept_id'] ? 'selected' : '' ?>>
                            <?= $dept['dept_name'] ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <button type="submit">💾 บันทึกข้อมูล</button>
        </form>

        <div class="nav-links">
            <a href="index.php">🏠 หน้าหลัก</a>
            <a href="edit_teacher.php">✏️ จัดการครู</a>
        </div>
    </div>
</body>
</html>