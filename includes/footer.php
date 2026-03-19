    </div><!-- end container-fluid -->

<footer class="footer mt-auto">
    <div class="container-fluid">
        <div class="row">
            <div class="col-12 text-center text-muted">
                <small>
                    &copy; <?php echo date('Y'); ?> ระบบเช็คชื่อนักเรียน IT &nbsp;|&nbsp;
                    พัฒนาด้วย PHP &amp; MySQL &nbsp;|&nbsp;
                    <i class="bi bi-heart-fill text-danger"></i>
                </small>
            </div>
        </div>
    </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap5.min.js"></script>
<script src="/attendance_system/assets/js/script.js"></script>
<?php if(isset($extra_js)) echo $extra_js; ?>
</body>
</html>
