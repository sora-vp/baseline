<p align="center">
   <img width="300" height="300" src="./apps/web/public/sora.png" />
   <h1 align="center">SORA</h1>
   
   [![End to End testing for web](https://github.com/reacto11mecha/sora/actions/workflows/e2e.yml/badge.svg)](https://github.com/reacto11mecha/sora/actions/workflows/e2e.yml) [![Lint, TS, Prettier Check](https://github.com/reacto11mecha/sora/actions/workflows/ci.yml/badge.svg)](https://github.com/reacto11mecha/sora/actions/workflows/ci.yml) [![CodeQL](https://github.com/reacto11mecha/sora/actions/workflows/codeql.yml/badge.svg)](https://github.com/reacto11mecha/sora/actions/workflows/codeql.yml)
</p>

ᮞᮧᮛ (Sora) yang berarti suara adalah aplikasi yang dapat menyuarakan aspirasi masyarakat untuk memilih kandidat pemimpin yang baru.

Project ini adalah hasil rebuild [NVA13](https://github.com/sekilas13/nva13) yang awalnya dibuat dengan [Node.js](https://nodejs.org/en/) dengan templating engine [EJS](https://ejs.co/) digantikan dengan [Next.js](https://nextjs.org/) yang lebih modular. Tujuan utama dari aplikasi ini untuk mengurangi biaya karena penggunaan kertas dan juga waktu penghitungan yang manual.

#### Sebelum beranjak lebih jauh

Ini adalah branch untuk sora versi 2. Jika ingin menggunakan versi pertama, silahkan menuju ke branch [v1](https://github.com/reacto11mecha/sora/tree/v1) jika ingin menggunakan versi awal.

## Perbedaan dengan versi sebelumnya

Secara ringkas, berikut ini perbedaan dengan versi yang pertama.

- Repositori ini menggunakan sistem monorepo walaupun ada project yang berbeda repositori.
- Terdapat sistem absensi [kode QR](https://id.wikipedia.org/wiki/Kode_QR) yang menggantikan tanda tangan, tetapi masih bersifat anonim untuk menjaga asas [LUBER JURDIL](https://id.wikipedia.org/wiki/Pemilihan_umum_di_Indonesia).
- Menerapkan RPC RabbitMQ untuk mencegah kehilangan status pada saat pemadaman listrik juga pengaman voting yang bernama [`processor`](./apps/processor/).
- Memisahkan bagian server dengan pemilih maupun kehadiran dengan aplikasi desktop.

Beberapa repositori yang dimaksud mencakup repositori dibawah ini.

- [sora-qrcode-web](https://github.com/reacto11mecha/sora-qrcode-web), repositori yang akan menghasilkan gambar kode QR yang bisa diunduh oleh partisipan.
- [sora-button-module](https://github.com/reacto11mecha/sora-button-module), modul tombol yang bisa dibuat sendiri jika tidak ingin menggunakan mouse.

## Fitur-fitur yang tersedia

1. Dashboard admin yang memiliki sistem login untuk mengelola berjalannya pemilihan.
2. Dashboard admin juga support untuk menggunakan dark mode.
3. Terdapat pengelola kandidat, peserta pemilihan, pengaturan kapan dan berhenti pemilihan, sudah bisa memilih atau absen, juga statistik pemilihan.
4. Fitur upload csv untuk input data peserta yang valid, pembuat pdf, juga export json untuk [sora-qrcode-web](https://github.com/reacto11mecha/sora-qrcode-web).
5. Peserta pemilihan harus menggunakan QR Code untuk menggunakan hak suara mereka, QR tersebut didapat dari panitia yang mengirimkan PDF yang berisikan list peserta.
6. Peserta yang ingin memilih terlebih dahulu absen masuk, setelah itu dia bisa memilih.
7. Aplikasi desktop untuk pemilih bisa menerima sinyal keyboard angka 1-5, Esc, dan Enter untuk memilih. Selain itu juga bisa menerima input dari custom keyboard buatan sendiri menggunakan [sora-button-module](https://github.com/reacto11mecha/sora-button-module).

## Konfigurasi Komputer Utama (Administrator)

### Prerequisites

Setidaknya terdapat instalasi ini untuk kedepannya menjalankan repositori pendukung dan task kecil.

- Node.js setidaknya versi 18.15.0 atau LTS, kunjungi https://nodejs.org/en
- npm (sudah bawaan Node.js) atau pnpm (kunjungi https://pnpm.io/installation)
- Yarn versi 3.5.0 atau versi stable, kunjungi https://yarnpkg.com/getting-started/install
- Database MySQL atau sejenis seperti MariaDB versi 10.11.2 ke atas, kunjungi https://mariadb.org/download
- RabbitMQ versi 3.11.13 ke atas, https://www.rabbitmq.com/download.html

### Cloning Dari Github

Jalankan perintah ini di command line.

```sh
# HTTPS
git clone https://github.com/reacto11mecha/sora.git

# SSH
git clone git@github.com:reacto11mecha/sora.git
```

### Menginstall package dan [`pm2`](https://npm.im/pm2)

Anda ke root directory project dan menginstall package yang diperlukan.

```sh
yarn install
```

Kemudian install package [`pm2`](https://npm.im/pm2) secara global. Diharuskan untuk menggunakan `npm` atau `pnpm` dikarenakan yarn berry tidak support global package.

```sh
npm install -g pm2

# atau menggunakan pnpm
pnpm install -g pm2
```

### Membuat prisma client

Diperlukan untuk menjalankan perintah ini untuk membuat typing prisma sebagai ORM yang menjalin koneksi ke database.

```sh
yarn db:generate
```

### Buat file

Pertama-tama, copy file [`.env.example`](.env.example) yang ada di root project ke `.env` yang letak filenya berada di root juga.

Keterangan field yang ada:

- `AMQP_URL`: URL yang menghubungkan kedua aplikasi ke RabbitMQ
- `DATABASE_URL`: URL Database MySQL yang akan dijadikan penyimpanan data.
- `NEXTAUTH_SECRET`: Secret yang digunakan oleh NextAuth untuk autentikasi
- `NEXTAUTH_URL`: URL yang nantinya akan digunakan pada saat production. Biarkan saja valuenya seperti contoh.
- `TRPC_URL`: URL endpoint dimana `processor` dapat terhubung ke `sora`, biarkan default jika berjalan di komputer yang sama.

Untuk mengenerate secret `NEXTAUTH_SECRET` bisa menggunakan snippet dibawah ini, jalankan di CLI dan gunakan hasilnya.

```sh
# Menggunakan Base64
node -e 'console.log(require("crypto").randomBytes(50).toString("base64"));'

# Atau menggunakan hex
node -e 'console.log(require("crypto").randomBytes(50).toString("hex"));'
```

### Menjalankan migrasi

Database mungkin sudah berjalan tapi belum memiliki tabel, oleh karena itu diperlukan migrasi dari prisma untuk membuat tabel. Jalankan perintah dibawah ini untuk membuat tabel.

> ⚠️ Jangan lupa untuk memastikan database sudah berjalan.

```sh
yarn db:push
```

### Menjalankan sora dan processor

Sebelum menjalankan, terlebih dahulu membuild sora dan processor supaya bisa dijalankan di production mode.

```sh
yarn build
```

Setelah selesai, jalankan sora dan processor menggunakan pm2.

> ⚠️ Jangan lupa untuk memastikan database dan RabbitMQ sudah berjalan. Pastikan db:push sudah berjalan dengan benar.

```sh
pm2 start ecosystem.config.js
```

## Konfigurasi semua komputer pemilih dan absensi

### Instalasi jaringan

Komputer pemilih dapat menggunakan laptop atau komputer yang dilengkapi dengan kamera bawaan atau menggunakan kamera eksternal apapun untuk membaca QR Code yang ditunjukkan oleh peserta. Untuk setiap pemilihan, dibutuhkan setidaknya 3 perangkat yaitu komputer administrator, komputer pemilih, dan komputer absensi. Jumlah komputer yang digunakan dapat menyesuaikan ketersediaan perangkat yang ada.

Untuk instalasi jaringan, dapat menggunakan Switch Hub atau Router WiFi. Disarankan menggunakan Switch Hub karena jaringan yang terhubung benar-benar terisolasi dari jaringan luar.

Namun, jika hanya tersedia Router WiFi, ada beberapa hal yang harus dilakukan untuk meningkatkan keamanan, yaitu:

1. Gunakan WPA2/WPA3 dengan password yang acak, tidak mudah ditebak, dan cukup panjang.
2. Matikan akses WPS, karena fitur ini dapat mempermudah penyerang untuk mendapatkan akses ke jaringan.
3. Gunakan daftar putih (whitelist) berdasarkan MAC address untuk membatasi akses ke jaringan hanya pada perangkat yang diizinkan.
4. Batasi jangkauan jaringan sesuai dengan kondisi lapangan, jika router WiFi memiliki fitur ini.

Jika dibuatkan diagram, instalasi jaringan akan terlihat seperti ini:

```mermaid
graph LR
   A[Komputer Administrator<br />IP: 192.167.100.2]
   B[Switch/Router<br />]

   subgraph Komputer Pemilih
   C[Komputer 1<br />IP: 192.167.100.3]
   D[Komputer 2<br />IP: 192.167.100.4]
   E[Komputer 3<br />IP: 192.167.100.5]
   F[Komputer 4<br />IP: 192.167.100.6]
   G[Komputer 5<br />IP: 192.167.100.7]
   end

   H[Komputer Absensi<br />IP: 192.167.100.8]

   A ------ B

   B ------ C
   B ------ D
   B ------ E
   B ------ F
   B ------ G

   B ------ H
```

Kemudian cek konektivitas dari semua komputer pemilih dan komputer absensi, apakah berhasil terhubung atau tidak. Caranya tinggal menggunakan command `ping`.

Asumsikan komputer administrator berjalan pada IP `192.168.100.2`, berarti jalankan perintah dibawah ini.

```sh
ping 192.168.100.2
```

Jika berhasil, kurang lebih akan terlihat seperti ini.

![Gambaran jika berhasil ping](assets/tutorial/001-ping-host.png)

### Instalasi kedua aplikasi desktop (pemilih dan absensi)

Silahkan pergi ke bagian [releases](https://github.com/reacto11mecha/sora/releases) dan pilih aplikasi desktop yang sesuai. Untuk absensi di awali dengan `absensi-desktop-` atau `sora-attendance`. Sedangkan `sora-chooser` atau `sora-desktop` menandakan bahwa aplikasi tersebut adalah aplikasi pemilihan. Tersedia untuk os windows dan linux 64 bit.

> Karena belum ada codesigning, maka antivirus membaca aplikasi ini mengandung virus. Matikan antivirus jika ingin menggunakan aplikasi ini.

> Note di windows: TODO

### Setup pertama kali aplikasi desktop

Untuk setup pertama kali, akan muncul menu pengaturan untuk mengatur alamat server berada. Setelah itu aplikasi akan jalan sebagai mana mestinya. Jika gagal terhubung, cek kembali apakah server sudah berjalan atau pengaturan firewall ada yang salah harus diperbaiki.

### Setup dari sisi web

Sebelum acara pemilihan berlangsung, harus ada yang di persiapkan sebelum pemilihan bisa dilaksanakan. Berikut ini hal-hal yang harus disiapkan.

1. #### Mendaftarkan admin dan login

   Hal pertama yang harus dipersiapkan yaitu mendaftarkan admin terlebih dahulu sebelum melakukan banyak hal. Kunjungi halaman http://localhost:3000/register untuk mendaftarkan admin, contohnya seperti dibawah ini.

   Keterangan form:

   - `Email`: Harus berupa format email yang valid (tidak perlu email pribadi, asal tak apa tapi harus ingat)
   - `Nama Lengkap`: Hanya diperbolehkan huruf alphabet
   - `Kata Sandi`: Minimal memiliki panjang 6 karakter
   - `Konfirmasi Kata Sandi`: Harus sama seperti `Kata Sandi`

   ![Gambar halaman register administrator](assets/tutorial/002-halaman-daftar-admin.png)

   Jika berhasil akan di arahkan langsung ke halaman login yang berada di http://localhost:3000/login, login dengan akun yang sudah di daftarkan.

   ![Gambar halaman login administrator](assets/tutorial/003-ke-halaman-login.png)

   Selesai login, akan diarahkan lagi ke halaman beranda administrator.

   ![Gambar halaman beranda administrator](./assets/tutorial/004-halaman-beranda.png)

2. #### Tambahkan data partisipan yang sah untuk memilih

   Pada versi kedua ini butuh data partisipan yang sah supaya peserta dapat memilih kandidat yang mereka jagokan. Bisa tambahkan satu persatu atau upload file csv yang berisikan seluruh peserta pemilihan. Format file berupa csv yang bisa ditemukan di [`apps/web/e2e/fixtures/contoh-file-csv.csv`](apps/web/e2e/fixtures/contoh-file-csv.csv).

   File tersebut kurang lebih memiliki tampilan seperti ini.

   | Nama            | Bagian Dari |
   | --------------- | ----------- |
   | M. Fiqri Haikal | XII-IPA-5   |
   | M. Rifqi Muflih | XII-BHS     |
   | Zain Arsi       | XII-IPA-5   |

   Catatan file csv:

   - Bidang `Nama` hanya bisa diisi dengan huruf alfabet, angka, koma, dan titik saja.
   - Bidang `Bagian Dari` hanya bisa diisi dengan huruf alfabet, angka, dan garis bawah tanpa spasi.

   Pergi ke [halaman peserta](http://localhost:3000/peserta), kurang lebih tampilan akan terlihat seperti ini.

   ![Tampilan halaman peserta](assets/tutorial/005-ke-halaman-peserta.jpg)

   Untuk tambah peserta secara manual satu-persatu terlihat seperti ini.

   ![Tampilan halaman tambah peserta](assets/tutorial/006-halaman-tambah-peserta.png)

   Halaman upload csv, akan ditunjukan cara upload file csv.

   ![Tampilan halaman upload file csv](assets/tutorial/007-contoh-upload-csv.png)

   Setelah selesai upload, akan dibuat QR ID secara otomatis sebagai hak pilih nantinya.

   ![Tampilan setelah selesai upload file csv](assets/tutorial/008-selesai-upload.jpg)

3. #### Export JSON supaya hak pilih bisa di unduh

   Export file json ini ada hubungannya dengan poin nomor 5 pada penjelasan dari setup web ini. Masih di halaman peserta, tekan Export JSON.

   ![Pencet tombol export json](assets/tutorial/009-export-json.png)

   Jika sudah dipencet, akan muncul prompt untuk menyimpan file, tekan simpan.

   ![Prompt untuk menyimpan file](assets/tutorial/010-simpan-file.png)

4. #### Menyimpan PDF untuk seluruh kategori

   Jika sudah menyimpan data JSON, maka tahap selanjutnya menyimpan PDF yang nanti akan dibagikan ke seluruh peserta pemilihan. Seluruh nama akan terlist sesuai kategori.

   Pergi ke halaman http://localhost:3000/peserta/pdf dan pilih kategori yang ingin disimpan. Jangan lupa untuk mengisi origin URL dari halaman web QR Code yang akan dijelaskan selanjutnya.

   ![Halaman print PDF](assets/tutorial/011-print-pdf.png)

   Kemudian muncul prompt yang akan mengarahkan kemana file tersebut akan disimpan. Simpan kalau sudah yakin.

   ![Prompt download untuk save file pdf](assets/tutorial/012-prompt-save-pdf.png)

   Jangan lupa mengulang proses untuk seluruh kategori.

5. ### Setup dan host web QR Code

   Yang dimaksud dengan setup web QR Code adalah bagian web yang memungkinkan peserta pemilihan mengunduh semacam kartu hak pilih mereka. Tata caranya ada pada repositori [sora-qrcode-web](https://github.com/reacto11mecha/sora-qrcode-web), cek tata caranya di [README](https://github.com/reacto11mecha/sora-qrcode-web#readme) repositori tersebut.

6. #### Backup database untuk jaga-jaga

   Jika proses-proses di atas sudah selesai, alangkah baiknya untuk backup seluruh data yang nantinya akan berubah. Hal ini mempermudah proses testing ke production apabila ingin mencoba terlebih dahulu fitur-fitur yang ada.

   Untuk menjalankan backup satu database.

   ```sh
   mysqldump -u <user> -p --databases sora > backup_db_sora_pemilihan.sql
   ```

   Untuk merestore data dari backup yang sudah dibuat.

   Jika menggunakan Windows Powershell.

   ```pwsh
   Get-Content .\backup_db_sora_pemilihan.sql |  mysql -u <user> -p sora
   ```

   Jika menggunakan terminal (mac/linux based).

   ```sh
   mysql -u <user> -p sora < backup_db_sora_pemilihan.sql
   ```

## Sosialisasi ke peserta

TODO: penjelasan

## Penggunaan di hari pemilihan

TODO: penjelasan

## Catatan Tambahan

Terlepas dari penjelasan yang sudah dijelaskan sebelumnya, saya akan memberikan rekomendasi tambahan terkait penggunaan aplikasi ini.

### 1. **Pilihlah Panitia yang Benar-Benar Jujur!**

Terlepas dari aplikasi apa yang dipakai, jika panitia yang dipilih tidak jujur maka dengan mudah mereka mencurangi sebuah sistem.

Administrator yang sudah login memang tidak bisa memilih kandidat, tetapi mereka **bisa menambahkan peserta fiktif dan ikut memilih kandidat sesuai kepentingan pribadi**. Jadi jangan sampai hal ini bisa terjadi karena administrator yang berbuat kecurangan.

Panitia pengawas komputer hanya boleh mengawasi jalannya pelaksanaan pemilihan dan melaporkan jika ditemukan adanya masalah. Popup pemilihan akan berwarna merah dan berisikan pesan error. Selain itu tidak boleh pengawas memilih kecuali pada saat giliran mereka untuk memilih.

### 2. **Tidak Menjalankan Aplikasi Pada Layanan Hosting!**

Pada dasarnya aplikasi ini bisa di upload ke layanan hosting dan dapat diakses di internet, tetapi sebaiknya tidak melakukan itu. Akan ada oknum yang tidak bertanggung jawab yang mendaftarkan akun administrator untuk kepentingan pribadi. Pemilih juga dapat memilih berkali-kali kandidat yang mereka dukung.

### 3. **Menjalankan Aplikasi pada Jaringan Lokal (LAN)!**

Menyambung poin sebelumnya, aplikasi ini dirancang untuk pemilihan langsung di lapangan dengan jaringan lokal, oleh karena itu diperlukan komputer administrator dan pemilih dalam jaringan yang terisolasi dari jaringan internet. Ditegaskan kembali bahwa penggunaan Switch lebih dianjurkan daripada penggunaan Router WiFi.

## Local Development

Langkah pertama, fork atau clone terlebih dahulu.

```sh
# HTTPS
git clone https://github.com/reacto11mecha/sora.git

# SSH
git clone git@github.com:reacto11mecha/sora.git
```

Kedua, menginstall seluruh package yang dibutuhkan.

```sh
yarn install
```

Ketiga, menyalin file `env.example` menjadi `.env` dan isikan sesuai field yang telah dijelaskan sebelumnya di [Buat file](#buat-file).

Setelah menginstall dependensi yang diperlukan, jalankan database MySQL bersamaan dengan RabbitMQ. Karena ada empat hal yang bisa di develop, maka script development ada empat. Berikut ini penjelasannya.

- Develop sisi web

  ```
  yarn dev:web
  ```

- Develop vote processor (RabbitMQ Consumer)

  ```
  yarn dev:processor
  ```

- Aplikasi desktop untuk absen (attendance)

  ```
  yarn dev:attendance
  ```

- Aplikasi desktop untuk memilih (chooser)

  ```
  yarn dev:chooser
  ```

- Build aplikasi desktop untuk Windows

  ```
  yarn build-desktop:win
  ```

- Build aplikasi desktop untuk Linux Based

  ```
  yarn build-desktop:linux
  ```

## Ucapan Terimakasih

Saya sebelumnya berterima kasih kepada tim [t3-oss](https://github.com/t3-oss) yang sudah membuat [`create-t3-app`](https://github.com/t3-oss/create-t3-app) dan [`create-t3-turbo`](https://github.com/t3-oss/create-t3-turbo), juga https://electron-vite.org karena project ini menggunakan template mereka yang sudah membantu saya dalam pembuatan project ini.

Saya juga berterima kasih terhadap MPK (Majelis Permusyawaratan Kelas) SMA Negeri 12 Kota Bekasi yang mau dan percaya untuk menggunakan aplikasi ini. Banyak kritik dan saran dari pihak guru dan murid-murid yang akhirnya terciptalah versi kedua dari project ini.

## Disclaimer

Penegasan, **saya tidak bertanggung jawab atas hal-hal yang tidak anda inginkan, gunakan dengan bijak dan tepat!**

## Lisensi

Semua kode yang ada di repositori ini bernaung dibawah [GPLv3](LICENSE).
