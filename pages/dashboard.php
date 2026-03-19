<?php
require_once '../includes/auth.php';
require_once '../includes/functions.php';
requireLogin();

$page_title = 'หน้าหลัก';
include '../includes/header.php';

$db   = new Database();
$conn = $db->getConnection();

// ดึง semester ปัจจุบัน (ป้องกัน null)
$sem_stmt = $conn->query("SELECT * FROM semesters WHERE is_current = 1 LIMIT 1");
$current_semester = $sem_stmt->fetch();
$semester_id = $current_semester ? (int)$current_semester['semester_id'] : 0;

$today = date('Y-m-d');

// =============================================
// สถิติวันนี้ (เช็คว่าตาราง attendance_records มีข้อมูล)
// =============================================
$stats = ['total_students'=>0,'present_today'=>0,'absent_today'=>0,'late_today'=>0,'leave_today'=>0];

try {
    // นับนักเรียนทั้งหมด
    $cnt = $conn->query("SELECT COUNT(*) FROM students")->fetchColumn();
    $stats['total_students'] = (int)$cnt;

    if($semester_id > 0) {
        $st = $conn->prepare(
            "SELECT
                SUM(CASE WHEN ar.status = 'มาเรียน'           THEN 1 ELSE 0 END) AS present_today,
                SUM(CASE WHEN ar.status = 'ขาดเรียน'          THEN 1 ELSE 0 END) AS absent_today,
                SUM(CASE WHEN ar.status = 'สาย'               THEN 1 ELSE 0 END) AS late_today,
                SUM(CASE WHEN ar.status = 'ลา'                THEN 1 ELSE 0 END) AS leave_today
             FROM attendance_records ar
             WHERE ar.check_in_date = :today
               AND ar.semester_id   = :sem"
        );
        $st->execute([':today' => $today, ':sem' => $semester_id]);
        $row = $st->fetch();
        if($row) {
            $stats['present_today'] = (int)($row['present_today'] ?? 0);
            $stats['absent_today']  = (int)($row['absent_today']  ?? 0);
            $stats['late_today']    = (int)($row['late_today']    ?? 0);
            $stats['leave_today']   = (int)($row['leave_today']   ?? 0);
        }
    }
} catch(Exception $e) {
    // ถ้า query ล้มเหลว ให้แสดง 0 แทน
}

// =============================================
// แนวโน้ม 7 วันล่าสุด
// =============================================
$trends = [];
try {
    if($semester_id > 0) {
        $tr = $conn->prepare(
            "SELECT
                ar.check_in_date,
                COUNT(*) AS total,
                SUM(CASE WHEN ar.status = 'มาเรียน'           THEN 1 ELSE 0 END) AS present,
                SUM(CASE WHEN ar.status = 'ขาดเรียน'          THEN 1 ELSE 0 END) AS absent
             FROM attendance_records ar
             WHERE ar.semester_id = :sem
             GROUP BY ar.check_in_date
             ORDER BY ar.check_in_date DESC
             LIMIT 7"
        );
        $tr->execute([':sem' => $semester_id]);
        $trends = $tr->fetchAll();
    }
} catch(Exception $e) {
    // trends ว่าง
}

$attendance_rate = ($stats['total_students'] > 0 && ($stats['present_today'] + $stats['absent_today'] + $stats['late_today'] + $stats['leave_today']) > 0)
    ? round($stats['present_today'] / ($stats['present_today'] + $stats['absent_today'] + $stats['late_today'] + $stats['leave_today']) * 100)
    : 0;
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h2 class="mb-1"><i class="bi bi-speedometer2 text-primary"></i> แผงควบคุม</h2>
        <p class="text-muted mb-0">
            <i class="bi bi-calendar3"></i>
            <?php echo $current_semester ? htmlspecialchars($current_semester['semester_name_th']) : 'ยังไม่ได้ตั้งค่าภาคเรียน'; ?>
            &nbsp;&bull;&nbsp; วันที่ <?= date('d/m/Y') ?>
        </p>
    </div>
    <a href="attendance.php" class="btn btn-primary">
        <i class="bi bi-pencil-square"></i> เช็คชื่อวันนี้
    </a>
</div>

<!-- ===== Stat Cards ===== -->
<div class="row row-cols-2 row-cols-md-5 g-3 mb-4">
    <div class="col">
        <div class="card stats-card h-100" style="border-left:4px solid #0d6efd;">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <p class="text-muted small mb-1">ทั้งหมด</p>
                        <h2 class="mb-0 fw-bold"><?= $stats['total_students'] ?></h2>
                    </div>
                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10"
                         style="width:48px;height:48px;">
                        <i class="bi bi-people-fill text-primary fs-4"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col">
        <div class="card stats-card h-100" style="border-left:4px solid #198754;">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <p class="text-muted small mb-1">มาเรียน</p>
                        <h2 class="mb-0 fw-bold text-success"><?= $stats['present_today'] ?></h2>
                    </div>
                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-10"
                         style="width:48px;height:48px;">
                        <i class="bi bi-check-circle-fill text-success fs-4"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col">
        <div class="card stats-card h-100" style="border-left:4px solid #ffc107;">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <p class="text-muted small mb-1">มาสาย</p>
                        <h2 class="mb-0 fw-bold text-warning"><?= $stats['late_today'] ?></h2>
                    </div>
                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-warning bg-opacity-10"
                         style="width:48px;height:48px;">
                        <i class="bi bi-clock-fill text-warning fs-4"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col">
        <div class="card stats-card h-100" style="border-left:4px solid #0dcaf0;">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <p class="text-muted small mb-1">ลา</p>
                        <h2 class="mb-0 fw-bold text-info"><?= $stats['leave_today'] ?></h2>
                    </div>
                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-info bg-opacity-10"
                         style="width:48px;height:48px;">
                        <i class="bi bi-file-text-fill text-info fs-4"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col">
        <div class="card stats-card h-100" style="border-left:4px solid #dc3545;">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <p class="text-muted small mb-1">ขาดเรียน</p>
                        <h2 class="mb-0 fw-bold text-danger"><?= $stats['absent_today'] ?></h2>
                    </div>
                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-danger bg-opacity-10"
                         style="width:48px;height:48px;">
                        <i class="bi bi-x-circle-fill text-danger fs-4"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row g-4">
    <!-- Chart -->
    <div class="col-lg-8">
        <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="bi bi-graph-up text-primary"></i> แนวโน้มการเข้าเรียน 7 วันล่าสุด</h5>
            </div>
            <div class="card-body">
                <?php if(empty($trends)): ?>
                <div class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    ยังไม่มีข้อมูลการเช็คชื่อในภาคเรียนนี้
                </div>
                <?php else: ?>
                <canvas id="attendanceChart" height="100"></canvas>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="col-lg-4">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="mb-0"><i class="bi bi-lightning-charge text-warning"></i> เมนูด่วน</h5>
            </div>
            <div class="card-body d-flex flex-column gap-3">
                <a href="attendance.php" class="btn btn-primary btn-lg d-flex align-items-center gap-2">
                    <i class="bi bi-pencil-square fs-4"></i>
                    <div class="text-start">
                        <div>เช็คชื่อวันนี้</div>
                        <small class="opacity-75"><?= date('d/m/Y') ?></small>
                    </div>
                </a>
                <a href="report_daily.php" class="btn btn-success btn-lg d-flex align-items-center gap-2">
                    <i class="bi bi-file-earmark-bar-graph fs-4"></i>
                    <div class="text-start">
                        <div>รายงานประจำวัน</div>
                        <small class="opacity-75">ดูสรุปรายวัน</small>
                    </div>
                </a>
                <a href="students.php" class="btn btn-info btn-lg text-white d-flex align-items-center gap-2">
                    <i class="bi bi-people fs-4"></i>
                    <div class="text-start">
                        <div>จัดการนักเรียน</div>
                        <small class="opacity-75"><?= $stats['total_students'] ?> คนในระบบ</small>
                    </div>
                </a>
                <a href="report_individual.php" class="btn btn-outline-secondary btn-lg d-flex align-items-center gap-2">
                    <i class="bi bi-person-lines-fill fs-4"></i>
                    <div class="text-start">
                        <div>รายงานรายบุคคล</div>
                        <small>ตรวจสอบรายคน</small>
                    </div>
                </a>
            </div>
        </div>
    </div>
</div>

<?php if(!empty($trends)): ?>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
const ctx = document.getElementById('attendanceChart').getContext('2d');
const labels  = [<?php foreach(array_reverse($trends) as $t) echo "'" . date('d/m', strtotime($t['check_in_date'])) . "',"; ?>];
const present = [<?php foreach(array_reverse($trends) as $t) echo (int)$t['present'] . ","; ?>];
const absent  = [<?php foreach(array_reverse($trends) as $t) echo (int)$t['absent']  . ","; ?>];

new Chart(ctx, {
    type: 'line',
    data: {
        labels,
        datasets: [
            { label: 'มาเรียน', data: present, borderColor:'#198754', backgroundColor:'rgba(25,135,84,0.1)', tension:0.4, fill:true },
            { label: 'ขาดเรียน', data: absent,  borderColor:'#dc3545', backgroundColor:'rgba(220,53,69,0.1)',  tension:0.4, fill:true }
        ]
    },
    options: {
        responsive: true,
        plugins: { legend: { position:'top' } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
});
</script>
<?php endif; ?>

<?php include '../includes/footer.php'; ?>