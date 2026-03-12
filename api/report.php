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

// หา semester_id
$stmt = $conn->prepare("SELECT semester_id FROM semesters WHERE academic_year = ? AND semester = ?");
$stmt->execute([$selected_year, $selected_semester]);
$semester_id = $stmt->fetchColumn();
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>รายงานการเข้าเรียน</title>
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
        h1 { margin-bottom: 20px; color: #333; }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
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
            color: #555;
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
            height: 38px;
        }
        .btn-filter:hover {
            background: #764ba2;
        }
        .btn-reset {
            background: #6c757d;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 4px;
            cursor: pointer;
            height: 38px;
            text-decoration: none;
            display: inline-block;
            line-height: 22px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 14px;
        }
        th {
            background: #667eea;
            color: white;
            padding: 12px;
            font-weight: 500;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        tr:hover {
            background: #f5f5f5;
        }
        .status-badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
        }
        .status-มา { background: #d4edda; color: #155724; }
        .status-สาย { background: #fff3cd; color: #856404; }
        .status-ขาด { background: #f8d7da; color: #721c24; }
        .status-ลา { background: #d1ecf1; color: #0c5460; }
        .summary-box {
            background: #f8fafc;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        .summary-item {
            flex: 1;
            min-width: 150px;
            text-align: center;
            padding: 10px;
            border-radius: 5px;
        }
        .summary-total { background: #e2e8f0; }
        .summary-present { background: #d4edda; }
        .summary-late { background: #fff3cd; }
        .summary-absent { background: #f8d7da; }
        .summary-leave { background: #d1ecf1; }
        .number-large {
            font-size: 28px;
            font-weight: bold;
            display: block;
        }
        .nav-links {
            margin-top: 30px;
            text-align: center;
        }
        .nav-links a {
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
        }
        .text-muted { color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 รายงานสถิติการเข้าเรียน</h1>
            <div>
                <a href="index.php" style="margin-right: 15px;">🏠 หน้าหลัก</a>
                <a href="logout.php">🚪 ออกจากระบบ</a>
            </div>
        </div>

        <!-- ตัวกรอง -->
        <form method="GET" class="filter-form">
            <div class="filter-group">
                <label>📅 ปีการศึกษา:</label>
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
                <label>🏫 ห้องเรียน:</label>
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
            <div class="filter-group" style="flex: 0 0 auto;">
                <button type="submit" class="btn-filter">🔍 แสดงรายงาน</button>
                <a href="report.php" class="btn-reset">↺ ล้าง</a>
            </div>
        </form>

        <?php if ($semester_id): 
            // ดึงข้อมูลสรุป
            $sql_summary = "SELECT 
                            COUNT(DISTINCT s.student_id) as total_students,
                            COUNT(CASE WHEN a.status = 'มา' THEN 1 END) as total_present,
                            COUNT(CASE WHEN a.status = 'สาย' THEN 1 END) as total_late,
                            COUNT(CASE WHEN a.status = 'ขาด' THEN 1 END) as total_absent,
                            COUNT(CASE WHEN a.status = 'ลา' THEN 1 END) as total_leave,
                            COUNT(a.attendance_id) as total_records
                        FROM student s
                        LEFT JOIN enrollments e ON s.student_id = e.student_id AND e.semester_id = :semester_id1
                        LEFT JOIN attendance a ON s.student_id = a.student_id AND a.semester_id = :semester_id2";
            
            $params_summary = [':semester_id1' => $semester_id, ':semester_id2' => $semester_id];
            
            if ($filter_class) {
                $sql_summary .= " AND e.class_id = :class_id";
                $params_summary[':class_id'] = $filter_class;
            }
            if ($filter_student) {
                $sql_summary .= " AND s.student_id = :student_id";
                $params_summary[':student_id'] = $filter_student;
            }
            if ($filter_date) {
                $sql_summary .= " AND a.check_in_date = :date";
                $params_summary[':date'] = $filter_date;
            }
            
            $stmt = $conn->prepare($sql_summary);
            $stmt->execute($params_summary);
            $summary = $stmt->fetch(PDO::FETCH_ASSOC);
        ?>

        <!-- สรุปตัวเลข -->
        <div class="summary-box">
            <div class="summary-item summary-total">
                <span class="number-large"><?= $summary['total_students'] ?? 0 ?></span>
                <span>นักเรียนทั้งหมด</span>
            </div>
            <div class="summary-item summary-present">
                <span class="number-large"><?= $summary['total_present'] ?? 0 ?></span>
                <span>✅ มา</span>
            </div>
            <div class="summary-item summary-late">
                <span class="number-large"><?= $summary['total_late'] ?? 0 ?></span>
                <span>⏰ สาย</span>
            </div>
            <div class="summary-item summary-absent">
                <span class="number-large"><?= $summary['total_absent'] ?? 0 ?></span>
                <span>❌ ขาด</span>
            </div>
            <div class="summary-item summary-leave">
                <span class="number-large"><?= $summary['total_leave'] ?? 0 ?></span>
                <span>📝 ลา</span>
            </div>
        </div>

        <!-- ตารางรายละเอียด -->
        <h2>📋 รายละเอียดการเข้าเรียน</h2>
        <table>
            <thead>
                <tr>
                    <th>วันที่</th>
                    <th>รหัส</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ชั้น/ห้อง</th>
                    <th>เวลา</th>
                    <th>สถานะ</th>
                    <th>ครูผู้บันทึก</th>
                    <th>หมายเหตุ</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $sql_detail = "SELECT 
                                a.check_in_date,
                                a.check_in_time,
                                a.status,
                                a.note,
                                s.student_code,
                                s.title as s_title,
                                s.first_name as s_fname,
                                s.last_name as s_lname,
                                c.class_name,
                                t.academic_title,
                                t.personal_title,
                                t.first_name as t_fname,
                                t.last_name as t_lname
                            FROM attendance a
                            JOIN student s ON a.student_id = s.student_id
                            JOIN classes c ON a.class_id = c.class_id
                            JOIN teacher t ON a.teacher_id = t.teacher_id
                            WHERE a.semester_id = :semester_id";
                
                $params_detail = [':semester_id' => $semester_id];
                
                if ($filter_class) {
                    $sql_detail .= " AND a.class_id = :class_id";
                    $params_detail[':class_id'] = $filter_class;
                }
                if ($filter_student) {
                    $sql_detail .= " AND a.student_id = :student_id";
                    $params_detail[':student_id'] = $filter_student;
                }
                if ($filter_date) {
                    $sql_detail .= " AND a.check_in_date = :date";
                    $params_detail[':date'] = $filter_date;
                }
                
                $sql_detail .= " ORDER BY a.check_in_date DESC, a.check_in_time DESC";
                
                $stmt = $conn->prepare($sql_detail);
                $stmt->execute($params_detail);
                $details = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (count($details) == 0): ?>
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 30px;">❌ ไม่พบข้อมูล</td>
                    </tr>
                <?php else:
                    foreach ($details as $row): ?>
                    <tr>
                        <td><?= date('d/m/Y', strtotime($row['check_in_date'])) ?></td>
                        <td><?= $row['student_code'] ?></td>
                        <td><?= $row['s_title'] ?><?= $row['s_fname'] ?> <?= $row['s_lname'] ?></td>
                        <td><?= $row['class_name'] ?></td>
                        <td><?= $row['check_in_time'] ?></td>
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
                        <td><?= $row['academic_title'] ?><?= $row['personal_title'] ?><?= $row['t_fname'] ?> <?= $row['t_lname'] ?></td>
                        <td><?= $row['note'] ?: '-' ?></td>
                    </tr>
                <?php 
                    endforeach;
                endif;
                ?>
            </tbody>
        </table>

        <?php else: ?>
            <div class="alert alert-danger">❌ ไม่พบข้อมูลภาคเรียน</div>
        <?php endif; ?>

        <div class="nav-links">
            <a href="index.php">🏠 หน้าหลัก</a>
            <a href="edit_attendance.php">📝 แก้ไขประวัติ</a>
        </div>
    </div>
</body>
</html>