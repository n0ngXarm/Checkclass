<?php
require_once '../includes/auth.php';
require_once '../includes/functions.php';
requireLogin();

$page_title = 'เช็คชื่อนักเรียน';
include '../includes/header.php';

$db               = new Database();
$conn             = $db->getConnection();
$current_semester = getCurrentSemester();
$teacher          = getCurrentTeacher();

// ดึงรายชื่อห้องเรียน
$classes_list = getClassList();

// ดึงประวัติการเช็คชื่อ 30 วันล่าสุด ของครูนี้
$history_query = "SELECT 
    a.check_in_date,
    c.class_code,
    c.room,
    COUNT(*) as total,
    SUM(CASE WHEN a.status IN ('มาเรียน','สาย') THEN 1 ELSE 0 END) as present,
    SUM(CASE WHEN a.status = 'ขาดเรียน' THEN 1 ELSE 0 END) as absent,
    SUM(CASE WHEN a.status = 'สาย' THEN 1 ELSE 0 END) as late,
    SUM(CASE WHEN a.status = 'ลา' THEN 1 ELSE 0 END) as leave_count
FROM attendance_records a
JOIN classes c ON a.class_id = c.class_id
WHERE a.teacher_id = :teacher_id
  AND a.semester_id = :semester_id
GROUP BY a.check_in_date, a.class_id
ORDER BY a.check_in_date DESC
LIMIT 30";

$stmt = $conn->prepare($history_query);
$stmt->execute([
    ':teacher_id'   => $teacher['id'],
    ':semester_id'  => $current_semester['semester_id'] ?? 0,
]);
$history = $stmt->fetchAll();
?>

<div class="row">
    <div class="col-md-12">
        <h2><i class="bi bi-pencil-square text-primary"></i> เช็คชื่อนักเรียน</h2>
        <p class="text-muted">ภาคเรียน: <?php echo htmlspecialchars($current_semester['semester_name_th'] ?? '-'); ?></p>
    </div>
</div>

<!-- เลือกห้องและวันที่ -->
<div class="card mb-4">
    <div class="card-header bg-primary text-white">
        <i class="bi bi-funnel"></i> เลือกห้องเรียนและวันที่
    </div>
    <div class="card-body">
        <form action="attendance_take.php" method="GET">
            <div class="row g-3">
                <div class="col-md-5">
                    <label for="class_id" class="form-label fw-semibold">ห้องเรียน <span class="text-danger">*</span></label>
                    <select id="class_id" name="class_id" class="form-select" required>
                        <option value="">-- เลือกห้องเรียน --</option>
                        <?php foreach($classes_list as $cls): ?>
                        <option value="<?= $cls['class_id'] ?>">
                            <?= htmlspecialchars($cls['class_code'] . ' – ' . $cls['room'] . ' (' . $cls['dept_name_th'] . ')') ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-4">
                    <label for="check_date" class="form-label fw-semibold">วันที่</label>
                    <input type="date" id="check_date" name="check_date" class="form-control"
                           value="<?= date('Y-m-d') ?>" required>
                </div>
                <div class="col-md-3 d-flex align-items-end">
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="bi bi-arrow-right-circle"></i> ไปเช็คชื่อ
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- ประวัติการเช็คชื่อ -->
<div class="card">
    <div class="card-header">
        <h5 class="mb-0"><i class="bi bi-clock-history"></i> ประวัติการเช็คชื่อล่าสุด</h5>
    </div>
    <div class="card-body">
        <?php if(empty($history)): ?>
            <div class="text-center text-muted py-4">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                ยังไม่มีประวัติการเช็คชื่อ
            </div>
        <?php else: ?>
        <div class="table-responsive">
            <table class="table table-hover" id="historyTable">
                <thead class="table-light">
                    <tr>
                        <th>วันที่</th>
                        <th>ห้อง</th>
                        <th>ทั้งหมด</th>
                        <th>มาเรียน</th>
                        <th>ขาด</th>
                        <th>สาย</th>
                        <th>ลา</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach($history as $h): ?>
                <tr>
                    <td><?= date('d/m/Y', strtotime($h['check_in_date'])) ?></td>
                    <td><?= htmlspecialchars($h['class_code'] . ' ' . $h['room']) ?></td>
                    <td><?= $h['total'] ?></td>
                    <td><span class="badge bg-success"><?= $h['present'] ?></span></td>
                    <td><span class="badge bg-danger"><?= $h['absent'] ?></span></td>
                    <td><span class="badge bg-warning text-dark"><?= $h['late'] ?></span></td>
                    <td><span class="badge bg-info"><?= $h['leave_count'] ?></span></td>
                    <td>
                        <a href="attendance_take.php?class_id=<?= urlencode($h['class_code']) ?>&check_date=<?= $h['check_in_date'] ?>"
                           class="btn btn-sm btn-outline-secondary">
                            <i class="bi bi-eye"></i>
                        </a>
                    </td>
                </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php endif; ?>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
