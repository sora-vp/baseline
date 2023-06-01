<p align="center">
   <img width="300" height="300" src="./apps/web/public/sora.png" />
   <h1 align="center">SORA</h1>
   
   [![Lint, TS, Prettier Check](https://github.com/reacto11mecha/sora/actions/workflows/ci.yml/badge.svg)](https://github.com/reacto11mecha/sora/actions/workflows/ci.yml) [![CodeQL](https://github.com/reacto11mecha/sora/actions/workflows/codeql.yml/badge.svg)](https://github.com/reacto11mecha/sora/actions/workflows/codeql.yml)
</p>

ᮞᮧᮛ (Sora) yang berarti suara adalah aplikasi yang dapat menyuarakan aspirasi masyarakat untuk memilih kandidat pemimpin yang baru.

Project ini adalah hasil rebuild [NVA13](https://github.com/sekilas13/nva13) yang awalnya dibuat dengan [Node.js](https://nodejs.org/en/) dengan templating engine [EJS](https://ejs.co/) digantikan dengan [Next.js](https://nextjs.org/) yang lebih modular. Tujuan utama dari aplikasi ini untuk mengurangi biaya karena penggunaan kertas dan juga waktu penghitungan yang manual.

#### Sebelum beranjak lebih jauh

Ini adalah branch untuk sora versi 2. Jika ingin menggunakan versi pertama, silahkan menuju ke branch [v1](https://github.com/reacto11mecha/sora/tree/v1) jika ingin menggunakan versi awal.

## Perbedaan dengan versi sebelumnya

Secara ringkas, berikut ini perbedaan dengan versi yang pertama.

- Repositori ini menggunakan sistem monorepo walaupun ada project yang berbeda repositori.
- Terdapat sistem absensi [kode QR](https://id.wikipedia.org/wiki/Kode_QR) yang menggantikan tanda tangan, tetapi masih bersifat anonim untuk menjaga asas [LUBER JURDIL](https://id.wikipedia.org/wiki/Pemilihan_umum_di_Indonesia).
- Terdapat consumer RabbitMQ yang dapat mencegah data ganda yang bernama [`vote-processor`](./apps/vote-processor/).
- Memisahkan bagian server dengan pemilih maupun kehadiran dengan aplikasi desktop.

Beberapa repositori yang dimaksud mencakup repositori dibawah ini.

- [sora-qrcode-web](https://github.com/reacto11mecha/sora-qrcode-web), repositori yang akan menghasilkan gambar kode QR yang bisa diunduh oleh partisipan.
- [sora-button-module](https://github.com/reacto11mecha/sora-button-module), modul tombol yang bisa dibuat sendiri jika tidak ingin menggunakan mouse.

## Fitur-fitur yang tersedia

1. Dashboard admin yang memiliki sistem login untuk mengelola berjalannya pemilihan.
2. Terdapat pengelola kandidat, peserta pemilihan, pengaturan kapan dan berhenti pemilihan, sudah bisa memilih atau absen, juga statistik pemilihan.
3. Fitur upload csv dan pembuat pdf juga export json untuk [sora-qrcode-web](https://github.com/reacto11mecha/sora-qrcode-web).
4. Peserta pemilihan harus menggunakan QR Code untuk menggunakan hak suara mereka, QR tersebut didapat dari panitia yang mengirimkan PDF yang berisikan list peserta.
5. Peserta yang ingin memilih terlebih dahulu absen masuk, setelah itu dia bisa memilih.
6. Aplikasi desktop untuk pemilih bisa menerima sinyal keyboard angka 1-5, Esc, dan Enter untuk memilih. Selain itu juga bisa menerima input dari custom keyboard buatan sendiri menggunakan [sora-button-module](https://github.com/reacto11mecha/sora-button-module).

## Konfigurasi Komputer Utama (Administrator)

### Prerequisites

Setidaknya terdapat instalasi ini untuk kedepannya menjalankan repositori pendukung dan task kecil.

- Node.js setidaknya versi 18.15.0 atau LTS, kunjungi https://nodejs.org/en
- npm (sudah bawaan Node.js) atau pnpm (kunjungi https://pnpm.io/installation)

### Cloning Dari Github

Jalankan perintah ini Command Line. Langkah ini adalah langkah awal yang berlaku untuk cara manual maupun docker.

```sh
# HTTPS
git clone https://github.com/reacto11mecha/sora.git

# SSH
git clone git@github.com:reacto11mecha/sora.git
```

Setelah mengkloning repositori dari github ke mesin lokal, terdapat dua pilihan untuk menjalankan aplikasi ini. Pilih salah satu dari opsi yang ada di bawah ini

<details>
   <summary>
      Menggunakan Docker
   </summary>

### Copy file [`.env.docker.example`](./.env.docker.example) ke `.env`

Salin file tersebut dan ubah sesuai isinya, berikut ini adalah keterangan dari masing-masing key yang ada.

Field yang wajib di isi.

- `NEXTAUTH_SECRET`: Secret yang digunakan oleh NextAuth untuk autentikasi
- `DATABASE_PASSWORD`: Secret yang akan mengatur password database agar bisa di akses oleh sora dan vote-processor.

Untuk mengenerate secret `NEXTAUTH_SECRET` bisa menggunakan snippet dibawah ini, jalankan di CLI dan gunakan hasilnya.

> ⚠️ **Token harus berbeda satu sama lain!** Jadi harus dijalankan dua kali.

```sh
# Menggunakan Base64
node -e 'console.log(require("crypto").randomBytes(50).toString("base64"));'

# Atau menggunakan hex
node -e 'console.log(require("crypto").randomBytes(50).toString("hex"));'
```

Opsional untuk diisi.

- `DATABASE_NAME`: Jika ingin menggunakan nama database yang lain bisa mengubah field ini. Default value `sora`.
- `TURBO_TOKEN`, `TURBO_TEAM`, `TURBO_API`: Field yang harus di isi ketika menggunakan fitur remote caching turborepo, kunjungi https://turbo.build/repo/docs/core-concepts/remote-caching

> Di rekomendasikan menggunakan fitur remote caching dikarenakan docker akan build sora dan vote-processor dari awal, bisa menggunakan [turborepo-remote-cache](https://github.com/ducktors/turborepo-remote-cache) di jalankan komputer sendiri/lain atau [Free Hosted Remote Cache](https://ducktors.github.io/turborepo-remote-cache/free-hosted-remote-cache) (baca baik-baik disclaimernya).

#### Menjalankan docker compose

Masuk ke direktori root dari sora dan jalankan perintah ini di terminal supaya aplikasi ini dapat berjalan.

```sh
docker compose up -d
```

#### Migrasi prisma

Docker mungkin sudah berjalan tetapi database masih kosong dan belum memiliki tabel, oleh karena itu perlu menjalankan migrasi. Berikut ini adalah langkah-langkah yang harus dilakukan.

1. Masuk vote-processor

   Cek terlebih dahulu dimana instance vote-processor berjalan dengan menggunakan `docker ps` dan akan muncul list seperti ini.

   ![Mengecek instance docker yang sudah berjalan menggunakan docker ps](./assets/tutorial/001-docker-ps.png)

   Dalam contoh ini kita mengetahui bahwa vote-processor memiliki container id `14f0142e93ee`.

2. Jalankan migrasi

   Setelah mengetahui container id, jalankan perintah `yarn db:migrate:deploy` dan `yarn db:push`

   ```sh
   docker exec -it <CONTAINER_ID> yarn db:push
   ```

   Kurang lebih hasilnya akan terlihat seperti ini.

   ![Setelah db:migrate:deploy](./assets/tutorial/002-docker-db-migrate.png)

   ![Setelah db:push](./assets/tutorial/003-docker-db-push.png)

### Mengakses Instance

Untuk mengakses instance ini, cek IP lokal yang di dapatkan mesin dan akses `http://<IP_MESIN>:3000/` lalu lakukan preparasi pemilihan.

</details>

<details>
   <summary>
      Cara Manual
   </summary>

#### Prerequisites

Jika menggunakan cara manual, berikut ini list yang diperlukan jika ingin menjalankan aplikasi ini.

- Node.js setidaknya versi 18.15.0 atau LTS, kunjungi https://nodejs.org/en
- Yarn versi 3.5.0 atau versi stable, kunjungi https://yarnpkg.com/getting-started/install
- Database MySQL atau sejenis seperti MariaDB versi 10.11.2, kunjungi https://mariadb.org/download
- RabbitMQ setidaknya versi 3.11.13, https://www.rabbitmq.com/download.html

#### Menginstall package dan [`pm2`](https://npm.im/pm2)

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

#### Membuat prisma client

Diperlukan untuk menjalankan perintah ini untuk membuat typing prisma sebagai ORM yang menjalin koneksi ke database.

```sh
yarn generate
```

#### Menjalankan backend dan processor

Pertama-tama, copy file `.env.example` yang terdapat di masing-masing folder `apps/sora` dan `apps/vote-processor` ke file `.env` sesuai dengan folder asal.

Keterangan field yang ada:

- `AMQP_URL`: URL yang menghubungkan kedua aplikasi ke RabbitMQ
- `DATABASE_URL`: URL Database MySQL yang akan dijadikan penyimpanan data.
- `NEXTAUTH_SECRET`: Secret yang digunakan oleh NextAuth untuk autentikasi
- `NEXTAUTH_URL`: URL yang nantinya akan digunakan pada saat production. Biarkan saja valuenya seperti contoh.
- `TRPC_URL`: URL endpoint dimana `vote-processor` dapat terhubung ke `sora`, biarkan default jika berjalan di komputer yang sama.

Untuk mengenerate secret `NEXTAUTH_SECRET` dan `SETTINGS_SECRET` bisa menggunakan snippet dibawah ini, jalankan di CLI dan gunakan hasilnya.

```sh
# Menggunakan Base64
node -e 'console.log(require("crypto").randomBytes(50).toString("base64"));'

# Atau menggunakan hex
node -e 'console.log(require("crypto").randomBytes(50).toString("hex"));'
```

Sebelum menjalankan, terlebih dahulu membuild sora dan vote-processor supaya bisa dijalankan di production mode.

```sh
yarn build
```

Setelah selesai, jalankan sora dan vote-processor menggunakan pm2.

> ⚠️ Jangan lupa untuk memastikan database dan RabbitMQ sudah berjalan.

```sh
pm2 start ecosystem.config.js
```

#### Menjalankan migrasi

Database mungkin sudah berjalan tapi belum memiliki tabel, oleh karena itu diperlukan migrasi dari prisma untuk membuat tabel. Jalankan perintah dibawah ini untuk membuat tabel.

```sh
yarn db:push
```

</details>

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
   A[Komputer Administrator]
   B[Switch/Router]

   subgraph Komputer Pemilih
   C[Komputer 1]
   D[Komputer 2]
   E[Komputer 3]
   F[Komputer 4]
   G[Komputer 5]
   end

   H[Komputer Absensi]

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

![Gambaran jika berhasil ping](assets/tutorial/004-ping-host.png)

### Instalasi kedua aplikasi desktop (pemilih dan absensi)

Silahkan pergi ke bagian [releases](https://github.com/reacto11mecha/sora/releases) dan pilih aplikasi desktop yang sesuai. Untuk absensi di awali dengan `absensi-desktop-` sedangkan `sora-desktop-` menandakan bahwa aplikasi tersebut adalah aplikasi pemilihan. Tersedia untuk os windows dan linux 64 bit.

> Karena belum ada codesigning, maka antivirus membaca aplikasi ini mengandung virus. Matikan antivirus jika ingin menggunakan aplikasi ini.

> Note di windows: TODO

### Setup pertama kali aplikasi desktop

TODO
