/* ============================================================
   CheckClass – script.js
   ============================================================ */

/* ---------- Sidebar toggle (mobile) ---------- */
document.addEventListener('DOMContentLoaded', () => {
    const toggle  = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                !toggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    /* ---------- Auto-dismiss flash alerts ---------- */
    const flashAlert = document.getElementById('flashAlert');
    if (flashAlert) {
        setTimeout(() => {
            flashAlert.style.opacity = '0';
            flashAlert.style.transition = 'opacity 0.5s ease';
            setTimeout(() => flashAlert.remove(), 500);
        }, 4000);
    }

    /* ---------- Attendance status buttons ---------- */
    initAttendanceButtons();

    /* ---------- Confirm dangerous actions ---------- */
    document.querySelectorAll('[data-confirm]').forEach(el => {
        el.addEventListener('click', function (e) {
            if (!confirm(this.dataset.confirm)) e.preventDefault();
        });
    });

    /* ---------- Select-all checkbox ---------- */
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', function () {
            document.querySelectorAll('.row-check').forEach(cb => {
                cb.checked = this.checked;
            });
        });
    }
});

/* ---------- Attendance take: status toggle buttons ---------- */
function initAttendanceButtons() {
    document.querySelectorAll('.status-group').forEach(group => {
        group.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const studentId = this.dataset.student;
                const status    = this.dataset.status;
                const hiddenInput = document.getElementById('status_' + studentId);

                // clear all selections for this student
                group.querySelectorAll('.status-btn').forEach(b => {
                    b.className = 'status-btn';
                });

                // mark selected
                this.classList.add('selected-' + status);
                if (hiddenInput) hiddenInput.value = status;

                // row highlight
                const row = document.getElementById('row_' + studentId);
                if (row) {
                    row.className = 'attendance-row status-' + status;
                }
            });
        });
    });
}

/* ---------- Quick set all to "present" ---------- */
function setAllPresent() {
    document.querySelectorAll('.status-group').forEach(group => {
        const presentBtn = group.querySelector('[data-status="present"]');
        if (presentBtn) presentBtn.click();
    });
}

/* ---------- AJAX: fetch students by class ---------- */
async function fetchStudents(classId, targetTableBody) {
    try {
        const res  = await fetch(`/attendance_system/api/get_students.php?class=${encodeURIComponent(classId)}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('fetchStudents error:', err);
        return [];
    }
}

/* ---------- Search / filter table ---------- */
function filterTable(inputId, tableId) {
    const query = document.getElementById(inputId)?.value.toLowerCase() ?? '';
    document.querySelectorAll(`#${tableId} tbody tr`).forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
}

/* ---------- Print page ---------- */
function printPage() { window.print(); }

/* ---------- Export CSV (client-side) ---------- */
function exportTableToCSV(tableId, filename = 'export.csv') {
    const table = document.getElementById(tableId);
    if (!table) return;
    let csv = [];
    table.querySelectorAll('tr').forEach(row => {
        const cols = [...row.querySelectorAll('th, td')].map(col =>
            '"' + col.innerText.replace(/"/g, '""') + '"'
        );
        csv.push(cols.join(','));
    });
    const blob = new Blob(['\ufeff' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: filename
    });
    a.click();
    URL.revokeObjectURL(a.href);
}
