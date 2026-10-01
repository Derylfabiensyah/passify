@echo off
chcp 65001 >nul
title Passify - Buka Port Firewall Windows (Wi-Fi)
color 0B

echo =======================================================
echo    PASSIFY - IZINKAN PORT MICROSERVICES DI FIREWALL
echo =======================================================
echo.
echo Pastikan Anda menjalankan file ini dengan:
echo "KLIK KANAN -> RUN AS ADMINISTRATOR"
echo.
echo Sedang mendaftarkan aturan Firewall untuk port 8081-8086 & 5173...
netsh advfirewall firewall add rule name="Passify Microservices" dir=in action=allow protocol=TCP localport=8081,8082,8083,8084,8086,5173

echo.
if %errorlevel% equ 0 (
    echo [OK] Aturan Firewall berhasil ditambahkan!
    echo HP sekarang dapat mengakses backend melalui Wi-Fi laptop.
) else (
    echo [GAGAL] Mohon jalankan ulang skrip ini dengan klik kanan -> "Run as administrator".
)
echo =======================================================
pause
