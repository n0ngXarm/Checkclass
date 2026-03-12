<?php
require_once 'auth_check.php';

// ดึงปีการศึกษาและเทอม
$current_year = date('Y');
$current_semester = (date('m') >= 5 && date('m') <= 10) ? '1' : '2';

$selected_year = $_GET['year'] ?? $current_year;
$selected_semester = $_GET['semester'] ?? $current_semester;
$filter_class = $_GET['class_id'] ?? '';
$filter_student = $_GET['student_id'] ?? '';
$filter_date = $_GET['date'] ?? '';
$filter_status = $_GET['status'] ?? '';

// หา semester_id
$stmt = $conn->prepare("SELECT semester_id FROM semesters WHERE academic_year = ? AND semester = ?");
$stmt->execute([$selected_year, $selected_semester]);
$semester_id = $stmt->fetchColumn();

// จัดการการลบ
if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    $stmt = $conn->prepare("DELETE FROM attendance WHERE attendance_id = ?");
    if ($stmt->execute([$id])) {
        $_SESSION['message'] = "✅ ลบรายการเรียบร้อย";
    } else {
        $_SESSION['message'] = "❌ ลบรายการล้มเหลว";
    }
    header("Location: edit_attendance.php?year=$selected_year&semester=$selected_semester" . 
           ($filter_class ? "&class_id=$filter_class" : "") . 
           ($filter_student ? "&student_id=$filter_student" : "") . 
           ($filter_date ? "&date=$filter_date" : "") . 
           ($filter_status ? "&status=$filter_status" : ""));
    exit;
}

// จัดการการแก้ไข
if (isset($_POST['update'])) {
    $attendance_id = $_POST['attendance_id'];
    $student_id = $_POST['student_id'];
    $teacher_id = $_POST['teacher_id'];
    $class_id = $_POST['class_id'];
    $check_date = $_POST['check_in_date'];
    $check_time = $_POST['check_in_time'];
    $status = $_POST['status'];
    $note = $_POST['note'] ?? '';
    
    $sql = "UPDATE attendance SET 
            student_id = :student_id,
            teacher_id = :teacher_id,
            class_id = :class_id,
            check_in_date = :date,
            check_in_time = :time,
            status = :status,
            note = :note
            WHERE attendance_id = :id";
    
    $stmt = $conn->prepare($sql);
    if ($stmt->execute([
        ':student_id' => $student_id,
        ':teacher_id' => $teacher_id,
        ':class_id' => $class_id,
        ':date' => $check_date,
        ':time' => $check_time,
        ':status' => $status,
        ':note' => $note,
        ':id' => $attendance_id
    ])) {
        $_SESSION['message'] = "✅ แก้ไขรายการเรียบร้อย";
    } else {
        $_SESSION['message'] = "❌ แก้ไขรายการล้มเหลว";
    }
    header("Location: edit_attendance.php?year=$selected_year&semester=$selected_semester" . 
           ($filter_class ? "&class_id=$filter_class" : "") . 
           ($filter_student ? "&student_id=$filter_student" : "") . 
           ($filter_date ? "&date=$filter_date" : "") . 
           ($filter_status ? "&status=$filter_status" : ""));
    exit;
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>แก้ไขประวัติเช็คชื่อ</title>
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
        .message.success { background: #d4edda; color: #155724; }
        .message.error { background: #f8d7da; color: #721c24; }
        .filter-form {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: flex-end;
        }
        .filter-group {
            flex: 1;
            min-width: 150px;
        }
        .filter-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        .filter-group select, .filter-group input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .btn-filter {
            background: #667eea;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 4px;
            cursor: pointer;
        }
        .btn-reset {
            background: #6c757d;
            color: white;
            padding: 8px 20px;
            border-radius: 4px;
            text-decoration: none;
            display: inline-block;
        }
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
        .status-badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            display: inline-block;
        }
        .status-มา { background: #d4edda; color: #155724; }
        .status-สาย { background: #fff3cd; color: #856404; }
        .status-ขาด { background: #f8d7da; color: #721c24; }
        .status-ลา { background: #d1ecf1; color: #0c5460; }
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
            border: none;
            cursor: pointer;
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
        .form-group select, .form-group input {
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
            <h1>📝 แก้ไขประวัติการเช็คชื่อ</h1>
            <div>
                <a href="index.php">🏠 หน้าหลัก</a> |
                <a href="report.php">📊 รายงาน</a> |
                <a href="logout.php">🚪 ออกจากระบบ</a>
            </div>
        </div>

        <?php if (isset($_SESSION['message'])): ?>
            <div class="message <?= strpos($_SESSION['message'], '✅') !== false ? 'success' : 'error' ?>">
                <?= $_SESSION['message'] ?>
            </div>
            <?php unset($_SESSION['message']); ?>
        <?php endif; ?>

        <!-- ตัวกรอง -->
        <form method="GET" class="filter-form">
            <div class="filter-group">
                <label>📅 ปี:</label>
                <select name="year">
                    <?php for ($y = 2026; $y >= 2025; $y--): ?>
                        <option value="<?= $y ?>" <?= $selected_year == $y ? 'selected' : '' ?>><?= $y ?></option>
                    <?php endfor; ?>
                </select>
            </div>
            <div class="filter-group">
                <label>📌 เทอม:</label>
                <select name="semester">
                    <option value="1" <?= $selected_semester == '1' ? 'selected' : '' ?>>เทอม 1</option>
                    <option value="2" <?= $selected_semester == '2' ? 'selected' : '' ?>>เทอม 2</option>
                    <option value="summer" <?= $selected_semester == 'summer' ? 'selected' : '' ?>>ฤดูร้อน</option>
                </select>
            </div>
            <div class="filter-group">
                <label>🏫 ห้อง:</label>
                <select name="class_id">
                    <option value="">ทั้งหมด</option>
                    <?php
                    $stmt = $conn->query("SELECT c.class_id, c.class_name, d.dept_name 
                                         FROM classes c 
                                         JOIN departments d ON c.dept_id = d.dept_id 
                                         ORDER BY d.dept_name, c.class_name");
                    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                        $selected = ($filter_class == $row['class_id']) ? 'selected' : '';
                        echo "<option value='{$row['class_id']}' $selected>[{$row['dept_name']}] {$row['class_name']}</option>";
                    }
                    ?>
                </select>
            </div>
            <div class="filter-group">
                <label>👤 นักเรียน:</label>
                <select name="student_id">
                    <option value="">ทั้งหมด</option>
                    <?php
                    $stmt = $conn->query("SELECT student_id, student_code, title, first_name, last_name FROM student ORDER BY student_code");
                    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                        $selected = ($filter_student == $row['student_id']) ? 'selected' : '';
                        echo "<option value='{$row['student_id']}' $selected>{$row['student_code']} {$row['title']}{$row['first_name']} {$row['last_name']}</option>";
                    }
                    ?>
                </select>
            </div>
            <div class="filter-group">
                <label>📆 วันที่:</label>
                <input type="date" name="date" value="<?= $filter_date ?>">
            </div>
            <div class="filter-group">
                <label>📌 สถานะ:</label>
                <select name="status">
                    <option value="">ทั้งหมด</option>
                    <option value="มา" <?= $filter_status == 'มา' ? 'selected' : '' ?>>✅ มา</option>
                    <option value="สาย" <?= $filter_status == 'สาย' ? 'selected' : '' ?>>⏰ สาย</option>
                    <option value="ขาด" <?= $filter_status == 'ขาด' ? 'selected' : '' ?>>❌ ขาด</option>
                    <option value="ลา" <?= $filter_status == 'ลา' ? 'selected' : '' ?>>📝 ลา</option>
                </select>
            </div>
            <div class="filter-group" style="flex: 0 0 auto;">
                <button type="submit" class="btn-filter">🔍 ค้นหา</button>
                <a href="edit_attendance.php" class="btn-reset">↺ ล้าง</a>
            </div>
        </form>

        <?php if ($semester_id): 
            // สร้าง SQL สำหรับดึงข้อมูล
            $sql = "SELECT 
                        a.attendance_id,
                        a.check_in_date,
                        a.check_in_time,
                        a.status,
                        a.note,
                        s.student_id,
                        s.student_code,
                        s.title as s_title,
                        s.first_name as s_fname,
                        s.last_name as s_lname,
                        c.class_id,
                        c.class_name,
                        d.dept_name,
                        t.teacher_id,
                        t.academic_title,
                        t.personal_title,
                        t.first_name as t_fname,
                        t.last_name as t_lname
                    FROM attendance a
                    JOIN student s ON a.student_id = s.student_id
                    JOIN classes c ON a.class_id = c.class_id
                    JOIN departments d ON c.dept_id = d.dept_id
                    JOIN teacher t ON a.teacher_id = t.teacher_id
                    WHERE a.semester_id = :semester_id";
            
            $params = [':semester_id' => $semester_id];
            
            if ($filter_class) {
                $sql .= " AND a.class_id = :class_id";
                $params[':class_id'] = $filter_class;
            }
            if ($filter_student) {
                $sql .= " AND a.student_id = :student_id";
                $params[':student_id'] = $filter_student;
            }
            if ($filter_date) {
                $sql .= " AND a.check_in_date = :date";
                $params[':date'] = $filter_date;
            }
            if ($filter_status) {
                $sql .= " AND a.status = :status";
                $params[':status'] = $filter_status;
            }
            
            $sql .= " ORDER BY a.check_in_date DESC, a.check_in_time DESC";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        ?>

        <!-- ตารางแสดงประวัติ -->
        <h2>📋 ประวัติการเช็คชื่อ (<?= count($records) ?> รายการ)</h2>
        
        <?php if (count($records) == 0): ?>
            <p style="text-align: center; padding: 30px;">❌ ไม่พบประวัติการเช็คชื่อ</p>
        <?php else: ?>
        <table>
            <thead>
                <tr>
                    <th>วันที่</th>
                    <th>เวลา</th>
                    <th>รหัสนักเรียน</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ห้อง</th>
                    <th>ครูผู้บันทึก</th>
                    <th>สถานะ</th>
                    <th>หมายเหตุ</th>
                    <th>จัดการ</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($records as $row): ?>
                <tr>
                    <td><?= date('d/m/Y', strtotime($row['check_in_date'])) ?></td>
                    <td><?= $row['check_in_time'] ?></td>
                    <td><?= $row['student_code'] ?></td>
                    <td><?= $row['s_title'] ?><?= $row['s_fname'] ?> <?= $row['s_lname'] ?></td>
                    <td>[<?= $row['dept_name'] ?>] <?= $row['class_name'] ?></td>
                    <td><?= $row['academic_title'] ?><?= $row['personal_title'] ?><?= $row['t_fname'] ?> <?= $row['t_lname'] ?></td>
                    <td>
                        <span class="status-badge status-<?= $row['status'] ?>">
                            <?php
                            $icon = match($row['status']) {
                                'มา' => '✅',
                                'สาย' => '⏰',
                                'ขาด' => '❌',
                                'ลา' => '📝',
                                default => ''
                            };
                            echo $icon . ' ' . $row['status'];
                            ?>
                        </span>
                    </td>
                    <td><?= $row['note'] ?: '-' ?></td>
                    <td>
                        <a href="edit_attendance.php?edit=<?= $row['attendance_id'] ?>&year=<?= $selected_year ?>&semester=<?= $selected_semester ?><?= $filter_class ? "&class_id=$filter_class" : '' ?><?= $filter_student ? "&student_id=$filter_student" : '' ?><?= $filter_date ? "&date=$filter_date" : '' ?><?= $filter_status ? "&status=$filter_status" : '' ?>" class="btn-edit">✏️ แก้ไข</a>
                        <a href="edit_attendance.php?delete=<?= $row['attendance_id'] ?>&year=<?= $selected_year ?>&semester=<?= $selected_semester ?><?= $filter_class ? "&class_id=$filter_class" : '' ?><?= $filter_student ? "&student_id=$filter_student" : '' ?><?= $filter_date ? "&date=$filter_date" : '' ?><?= $filter_status ? "&status=$filter_status" : '' ?>" class="btn-delete" onclick="return confirm('แน่ใจว่าต้องการลบ?')">🗑️ ลบ</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php endif; ?>

        <!-- ฟอร์มแก้ไข -->
        <?php if (isset($_GET['edit'])):
            $edit_id = $_GET['edit'];
            $stmt = $conn->prepare("SELECT * FROM attendance WHERE attendance_id = ?");
            $stmt->execute([$edit_id]);
            $edit = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($edit):
        ?>
        <div class="edit-form">
            <h3>✏️ แก้ไขรายการที่ <?= $edit_id ?></h3>
            <form method="POST">
                <input type="hidden" name="attendance_id" value="<?= $edit['attendance_id'] ?>">
                
                <div class="form-row">
                    <div class="form-group">
                        <label>👤 นักเรียน:</label>
                        <select name="student_id" required>
                            <?php
                            $stmt2 = $conn->query("SELECT student_id, student_code, title, first_name, last_name FROM student ORDER BY student_code");
                            while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
                                $selected = ($row['student_id'] == $edit['student_id']) ? 'selected' : '';
                                echo "<option value='{$row['student_id']}' $selected>{$row['student_code']} {$row['title']}{$row['first_name']} {$row['last_name']}</option>";
                            }
                            ?>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>👩‍🏫 ครู:</label>
                        <select name="teacher_id" required>
                            <?php
                            $stmt2 = $conn->query("SELECT teacher_id, teacher_code, academic_title, personal_title, first_name, last_name FROM teacher");
                            while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
                                $selected = ($row['teacher_id'] == $edit['teacher_id']) ? 'selected' : '';
                                echo "<option value='{$row['teacher_id']}' $selected>{$row['teacher_code']} {$row['academic_title']}{$row['personal_title']}{$row['first_name']} {$row['last_name']}</option>";
                            }
                            ?>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>🏫 ห้องเรียน:</label>
                        <select name="class_id" required>
                            <?php
                            $stmt2 = $conn->query("SELECT c.class_id, c.class_name, d.dept_name FROM classes c JOIN departments d ON c.dept_id = d.dept_id ORDER BY d.dept_name, c.class_name");
                            while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
                                $selected = ($row['class_id'] == $edit['class_id']) ? 'selected' : '';
                                echo "<option value='{$row['class_id']}' $selected>[{$row['dept_name']}] {$row['class_name']}</option>";
                            }
                            ?>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>📆 วันที่:</label>
                        <input type="date" name="check_in_date" value="<?= $edit['check_in_date'] ?>" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>⏰ เวลา:</label>
                        <input type="time" name="check_in_time" value="<?= $edit['check_in_time'] ?>" required>
                    </div>
                    <div class="form-group">
                        <label>📌 สถานะ:</label>
                        <select name="status" required>
                            <option value="มา" <?= $edit['status'] == 'มา' ? 'selected' : '' ?>>✅ มา</option>
                            <option value="สาย" <?= $edit['status'] == 'สาย' ? 'selected' : '' ?>>⏰ สาย</option>
                            <option value="ขาด" <?= $edit['status'] == 'ขาด' ? 'selected' : '' ?>>❌ ขาด</option>
                            <option value="ลา" <?= $edit['status'] == 'ลา' ? 'selected' : '' ?>>📝 ลา</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>📝 หมายเหตุ:</label>
                        <input type="text" name="note" value="<?= htmlspecialchars($edit['note'] ?? '') ?>" placeholder="เช่น สาย 10 นาที">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <button type="submit" name="update" class="btn-save">💾 บันทึกการแก้ไข</button>
                    </div>
                    <div class="form-group">
                        <a href="edit_attendance.php?year=<?= $selected_year ?>&semester=<?= $selected_semester ?><?= $filter_class ? "&class_id=$filter_class" : '' ?><?= $filter_student ? "&student_id=$filter_student" : '' ?><?= $filter_date ? "&date=$filter_date" : '' ?><?= $filter_status ? "&status=$filter_status" : '' ?>" class="btn-cancel">↩️ ยกเลิก</a>
                    </div>
                </div>
            </form>
        </div>
        <?php 
            endif;
        endif;
        ?>

        <?php else: ?>
            <p style="color: red;">❌ ไม่พบข้อมูลภาคเรียน</p>
        <?php endif; ?>

        <div class="nav-links">
            <a href="index.php">🏠 หน้าหลัก</a> |
            <a href="report.php">📊 รายงาน</a> |
            <a href="add_student.php">➕ เพิ่มนักเรียน</a> |
            <a href="add_teacher.php">👩‍🏫 เพิ่มครู</a>
        </div>
    </div>
</body>
</html>