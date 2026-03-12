<?php
require_once 'auth_check.php';

// ดึงข้อมูลนักเรียนทั้งหมด
$students = $conn->query("SELECT s.*, c.class_name, d.dept_name 
                         FROM student s
                         LEFT JOIN enrollments e ON s.student_id = e.student_id AND e.semester_id = (SELECT semester_id FROM semesters WHERE academic_year = 2026 AND semester = '1' AND is_active = 1)
                         LEFT JOIN classes c ON e.class_id = c.class_id
                         LEFT JOIN departments d ON c.dept_id = d.dept_id
                         ORDER BY s.student_code")->fetchAll(PDO::FETCH_ASSOC);

// ดึงข้อมูลห้องเรียน
$classes = $conn->query("SELECT c.class_id, c.class_name, d.dept_name 
                         FROM classes c 
                         JOIN departments d ON c.dept_id = d.dept_id 
                         WHERE c.academic_year = 2026 AND c.semester = '1'
                         ORDER BY d.dept_name, c.class_name")->fetchAll(PDO::FETCH_ASSOC);

// จัดการการลบ
if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    
    // เช็คว่ามีประวัติการเช็คชื่อหรือยัง
    $check = $conn->prepare("SELECT COUNT(*) FROM attendance WHERE student_id = ?");
    $check->execute([$id]);
    $count = $check->fetchColumn();
    
    if ($count > 0) {
        $_SESSION['message'] = "❌ ไม่สามารถลบได้ เนื่องจากมีประวัติการเช็คชื่อแล้ว";
    } else {
        // ลบ enrollments ก่อน
        $conn->prepare("DELETE FROM enrollments WHERE student_id = ?")->execute([$id]);
        // ลบ student
        if ($conn->prepare("DELETE FROM student WHERE student_id = ?")->execute([$id])) {
            $_SESSION['message'] = "✅ ลบข้อมูลเรียบร้อย";
        } else {
            $_SESSION['message'] = "❌ ลบข้อมูลล้มเหลว";
        }
    }
    header("Location: edit_student.php");
    exit;
}

// จัดการการแก้ไข
if (isset($_POST['update'])) {
    $student_id = $_POST['student_id'];
    $student_code = trim($_POST['student_code']);
    $title = $_POST['title'];
    $first_name = trim($_POST['first_name']);
    $last_name = trim($_POST['last_name']);
    $class_id = $_POST['class_id'] ?: null;
    
    // อัปเดตข้อมูลนักเรียน
    $stmt = $conn->prepare("UPDATE student SET student_code = ?, title = ?, first_name = ?, last_name = ? WHERE student_id = ?");
    if ($stmt->execute([$student_code, $title, $first_name, $last_name, $student_id])) {
        
        // อัปเดตการลงทะเบียน
        if ($class_id) {
            // หา semester_id ปัจจุบัน
            $semester = $conn->prepare("SELECT semester_id FROM semesters WHERE academic_year = 2026 AND semester = '1' AND is_active = 1");
            $semester->execute();
            $semester_id = $semester->fetchColumn();
            
            if ($semester_id) {
                // ลบของเก่า
                $conn->prepare("DELETE FROM enrollments WHERE student_id = ? AND semester_id = ?")->execute([$student_id, $semester_id]);
                // เพิ่มของใหม่
                $conn->prepare("INSERT INTO enrollments (student_id, class_id, semester_id, enrollment_date, status) VALUES (?, ?, ?, CURDATE(), 'กำลังศึกษา')")->execute([$student_id, $class_id, $semester_id]);
            }
        }
        
        $_SESSION['message'] = "✅ แก้ไขข้อมูลเรียบร้อย";
    } else {
        $_SESSION['message'] = "❌ แก้ไขข้อมูลล้มเหลว";
    }
    header("Location: edit_student.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>จัดการนักเรียน</title>
    <link rel="stylesheet" href="../style.css">
    <style>
        * { box-sizing: border-box; }
        body {
            background: #f5f7fa;
            font-family: 'Segoe UI', sans-serif;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
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
            margin-bottom: 20px;
        }
        .message {
            padding: 10px 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background: #667eea;
            color: white;
            padding: 12px;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        tr:hover { background: #f5f5f5; }
        .btn-edit {
            background: #ffc107;
            color: black;
            padding: 5px 10px;
            text-decoration: none;
            border-radius: 3px;
            margin-right: 5px;
        }
        .btn-delete {
            background: #dc3545;
            color: white;
            padding: 5px 10px;
            text-decoration: none;
            border-radius: 3px;
        }
        .edit-form {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            border: 1px solid #ddd;
        }
        .form-row {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        .form-group {
            flex: 1;
            min-width: 200px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        .form-group input, .form-group select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .btn-save {
            background: #28a745;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
        }
        .btn-cancel {
            background: #6c757d;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            text-decoration: none;
        }
        .nav-links {
            margin-top: 30px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✏️ จัดการข้อมูลนักเรียน</h1>
            <div>
                <a href="index.php">🏠 หน้าหลัก</a> |
                <a href="add_student.php">➕ เพิ่มใหม่</a>
            </div>
        </div>

        <?php if (isset($_SESSION['message'])): ?>
            <div class="message <?= strpos($_SESSION['message'], '✅') !== false ? 'success' : 'error' ?>">
                <?= $_SESSION['message'] ?>
            </div>
            <?php unset($_SESSION['message']); ?>
        <?php endif; ?>

        <!-- ตารางแสดงรายชื่อ -->
        <table>
            <thead>
                <tr>
                    <th>รหัสนักศึกษา</th>
                    <th>คำนำหน้า</th>
                    <th>ชื่อ</th>
                    <th>นามสกุล</th>
                    <th>ห้องปัจจุบัน</th>
                    <th>จัดการ</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($students as $stu): ?>
                <tr>
                    <td><?= $stu['student_code'] ?></td>
                    <td><?= $stu['title'] ?></td>
                    <td><?= $stu['first_name'] ?></td>
                    <td><?= $stu['last_name'] ?></td>
                    <td>
                        <?php if ($stu['class_name']): ?>
                            [<?= $stu['dept_name'] ?>] <?= $stu['class_name'] ?>
                        <?php else: ?>
                            <span style="color: #999;">ไม่ได้ลงทะเบียน</span>
                        <?php endif; ?>
                    </td>
                    <td>
                        <a href="edit_student.php?edit=<?= $stu['student_id'] ?>" class="btn-edit">✏️ แก้ไข</a>
                        <a href="edit_student.php?delete=<?= $stu['student_id'] ?>" class="btn-delete" onclick="return confirm('แน่ใจว่าต้องการลบ?')">🗑️ ลบ</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <!-- ฟอร์มแก้ไข -->
        <?php if (isset($_GET['edit'])):
            $edit_id = $_GET['edit'];
            $stmt = $conn->prepare("SELECT * FROM student WHERE student_id = ?");
            $stmt->execute([$edit_id]);
            $edit = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // ดึงห้องที่ลงทะเบียนอยู่
            $current_class = $conn->prepare("SELECT class_id FROM enrollments WHERE student_id = ? AND semester_id = (SELECT semester_id FROM semesters WHERE academic_year = 2026 AND semester = '1' AND is_active = 1)");
            $current_class->execute([$edit_id]);
            $current_class_id = $current_class->fetchColumn();
            
            if ($edit):
        ?>
        <div class="edit-form">
            <h3>✏️ แก้ไขข้อมูล <?= $edit['title'] ?><?= $edit['first_name'] ?> <?= $edit['last_name'] ?></h3>
            <form method="POST">
                <input type="hidden" name="student_id" value="<?= $edit['student_id'] ?>">
                
                <div class="form-group">
                    <label>📌 รหัสนักศึกษา</label>
                    <input type="text" name="student_code" value="<?= $edit['student_code'] ?>" required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>👤 คำนำหน้า</label>
                        <select name="title">
                            <option value="นาย" <?= $edit['title'] == 'นาย' ? 'selected' : '' ?>>นาย</option>
                            <option value="นางสาว" <?= $edit['title'] == 'นางสาว' ? 'selected' : '' ?>>นางสาว</option>
                            <option value="นาง" <?= $edit['title'] == 'นาง' ? 'selected' : '' ?>>นาง</option>
                            <option value="เด็กชาย" <?= $edit['title'] == 'เด็กชาย' ? 'selected' : '' ?>>เด็กชาย</option>
                            <option value="เด็กหญิง" <?= $edit['title'] == 'เด็กหญิง' ? 'selected' : '' ?>>เด็กหญิง</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>ชื่อ</label>
                        <input type="text" name="first_name" value="<?= $edit['first_name'] ?>" required>
                    </div>
                    <div class="form-group">
                        <label>นามสกุล</label>
                        <input type="text" name="last_name" value="<?= $edit['last_name'] ?>" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>🏫 ห้องเรียน (ภาคเรียนปัจจุบัน)</label>
                    <select name="class_id">
                        <option value="">-- ไม่ลงทะเบียน --</option>
                        <?php foreach ($classes as $class): ?>
                            <option value="<?= $class['class_id'] ?>" <?= ($current_class_id == $class['class_id']) ? 'selected' : '' ?>>
                                [<?= $class['dept_name'] ?>] <?= $class['class_name'] ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <button type="submit" name="update" class="btn-save">💾 บันทึก</button>
                    </div>
                    <div class="form-group">
                        <a href="edit_student.php" class="btn-cancel">↩️ ยกเลิก</a>
                    </div>
                </div>
            </form>
        </div>
        <?php 
            endif;
        endif;
        ?>

        <div class="nav-links">
            <a href="index.php">🏠 หน้าหลัก</a>
            <a href="add_student.php">➕ เพิ่มนักเรียน</a>
            <a href="edit_teacher.php">✏️ จัดการครู</a>
        </div>
    </div>
</body>
</html>