FROM php:8.2-apache

# เปิดใช้งานโมดูล Apache Rewrite สำหรับ .htaccess
RUN a2enmod rewrite

# ติดตั้ง PHP extensions ที่จำเป็น (PDO MySQL สำหรับต่อฐานข้อมูล)
RUN docker-php-ext-install pdo pdo_mysql

# ตั้งค่าให้ Apache อ่านจากโฟลเดอร์ root
ENV APACHE_DOCUMENT_ROOT /var/www/html

# คัดลอกไฟล์ทั้งหมด (ยกเว้นที่ระบุใน .dockerignore) ไปที่เซิร์ฟเวอร์
COPY . /var/www/html/

# ตั้งสิทธิ์ให้ Apache อ่านและเขียนไฟล์ได้
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

EXPOSE 80
