<?php
/**
 * report.php — GET: รายงานสถิติการเข้าเรียน
 *
 * GET  [?class_id=X] [?semester_id=Y]
 *      → สรุปอัตราการเข้าเรียนแต่ละห้อง
 *
 * Requires: authenticated session
 */

require_once __DIR__ . '/config.php';

$sessionUser = require_auth();
$db          = get_db();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(false, 'Method not allowed.', [], 405);
}

$classId    = !empty($_GET['class_id'])    ? (int) $_GET['class_id']    : null;
$semesterId = !empty($_GET['semester_id']) ? (int) $_GET['semester_id'] : null;

// Default to active semester if not specified
if (!$semesterId) {
    $semStmt = $db->query("SELECT semester_id FROM semesters WHERE is_active = 1 LIMIT 1");
    $sem     = $semStmt->fetch();
    $semesterId = $sem ? (int) $sem['semester_id'] : 1;
}

// ── Overall summary stats ─────────────────────────────────────────────────────
$overallStmt = $db->prepare("
    SELECT
        COUNT(*)                                              AS total_records,
        SUM(status = 'มา')                                   AS total_present,
        SUM(status = 'สาย')                                  AS total_late,
        SUM(status = 'ขาด')                                  AS total_absent,
        SUM(status = 'ลา')                                   AS total_leave,
        ROUND(SUM(status = 'มา') / COUNT(*) * 100, 1)       AS attendance_rate
    FROM attendance
    WHERE semester_id = :sem_id
");
$overallStmt->execute([':sem_id' => $semesterId]);
$overall = $overallStmt->fetch();

// ── Per-class breakdown ───────────────────────────────────────────────────────
$where  = ['a.semester_id = :sem_id'];
$params = [':sem_id' => $semesterId];

if ($classId) {
    $where[]           = 'a.class_id = :class_id';
    $params[':class_id'] = $classId;
}

$whereSql = implode(' AND ', $where);

$stmt = $db->prepare("
    SELECT
        c.class_id,
        c.class_name                                         AS name,
        d.dept_name                                          AS dept,
        COUNT(DISTINCT sc.student_id)                        AS students,
        COUNT(a.id)                                          AS total_records,
        SUM(a.status = 'มา')                                AS present,
        SUM(a.status = 'สาย')                               AS late,
        SUM(a.status = 'ขาด')                               AS absent,
        SUM(a.status = 'ลา')                                AS leave,
        ROUND(
            IF(COUNT(a.id) > 0, SUM(a.status = 'มา') / COUNT(a.id) * 100, 0)
        , 1)                                                 AS present_pct,
        ROUND(
            IF(COUNT(a.id) > 0, SUM(a.status = 'สาย') / COUNT(a.id) * 100, 0)
        , 1)                                                 AS late_pct,
        ROUND(
            IF(COUNT(a.id) > 0, SUM(a.status = 'ขาด') / COUNT(a.id) * 100, 0)
        , 1)                                                 AS absent_pct
    FROM classes c
    LEFT JOIN departments d   ON d.dept_id   = c.dept_id
    LEFT JOIN student_classes sc ON sc.class_id = c.class_id
    LEFT JOIN attendance a    ON a.class_id  = c.class_id AND $whereSql
    GROUP BY c.class_id, c.class_name, d.dept_name
    ORDER BY c.class_name ASC
");
$stmt->execute($params);
$classes = $stmt->fetchAll();

// Cast numeric fields
foreach ($classes as &$cls) {
    $cls['class_id']      = (int)   $cls['class_id'];
    $cls['students']      = (int)   $cls['students'];
    $cls['total_records'] = (int)   $cls['total_records'];
    $cls['present']       = (int)   $cls['present'];
    $cls['late']          = (int)   $cls['late'];
    $cls['absent']        = (int)   $cls['absent'];
    $cls['leave']         = (int)   $cls['leave'];
    $cls['present_pct']   = (float) $cls['present_pct'];
    $cls['late_pct']      = (float) $cls['late_pct'];
    $cls['absent_pct']    = (float) $cls['absent_pct'];
}
unset($cls);

json_response(true, '', [
    'semester_id' => $semesterId,
    'overall'     => $overall,
    'classes'     => $classes,
]);
