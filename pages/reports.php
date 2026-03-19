<?php
require_once '../includes/auth.php';
require_once '../includes/functions.php';
requireLogin();

$page_title = 'รายงาน';
include '../includes/header.php';
?>

<div class="row mb-4">
    <div class="col-12">
        <h2><i class="bi bi-file-text text-primary"></i> รายงาน</h2>
    </div>
</div>

<div class="row g-4">
    <div class="col-md-6">
        <a href="report_daily.php" class="text-decoration-none">
            <div class="card h-100 stats-card border-primary">
                <div class="card-body text-center py-5">
                    <i class="bi bi-calendar-day text-primary" style="font-size:3.5rem;"></i>
                    <h4 class="mt-3">รายงานประจำวัน</h4>
                    <p class="text-muted">สรุปสถิติการเข้าเรียนของนักเรียนทั้งหมด แยกตามวัน ห้อง</p>
                    <span class="btn btn-primary mt-2"><i class="bi bi-arrow-right"></i> ดูรายงาน</span>
                </div>
            </div>
        </a>
    </div>
    <div class="col-md-6">
        <a href="report_individual.php" class="text-decoration-none">
            <div class="card h-100 stats-card border-success">
                <div class="card-body text-center py-5">
                    <i class="bi bi-person-lines-fill text-success" style="font-size:3.5rem;"></i>
                    <h4 class="mt-3">รายงานรายบุคคล</h4>
                    <p class="text-muted">ตรวจสอบประวัติการเข้าเรียนของนักเรียนรายคน พร้อมสถิติครบถ้วน</p>
                    <span class="btn btn-success mt-2"><i class="bi bi-arrow-right"></i> ดูรายงาน</span>
                </div>
            </div>
        </a>
    </div>
</div>

<?php include '../includes/footer.php'; ?>
