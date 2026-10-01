@echo off
chcp 65001 >nul
title Passify - Sambungkan Port USB HP (ADB Reverse)
color 0A

echo =======================================================
echo     PASSIFY GATE SCANNER - KONEKSI KABEL USB (ADB)
echo =======================================================
echo.
echo Sedang memeriksa perangkat Android...
adb devices
echo.
echo Meneruskan port microservices ke HP (ADB Reverse)...
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8082 tcp:8082
adb reverse tcp:8083 tcp:8083
adb reverse tcp:8084 tcp:8084
adb reverse tcp:8086 tcp:8086
adb reverse tcp:5173 tcp:5173

echo.
echo =======================================================
echo [OK] SEMUA PORT BERHASIL DITERUSKAN KE HP!
echo.
echo Panduan Pemakaian:
echo 1. Di HP, buka aplikasi Passify.
echo 2. Di halaman login, IP host sudah otomatis menggunakan: 127.0.0.1
echo 3. Klik "Scan QR Login Petugas" dan arahkan ke layar laptop.
echo 4. Petugas akan langsung login tanpa kendala Wi-Fi/Firewall!
echo =======================================================
pause
