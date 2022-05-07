<p align="center">
   <img width="250" height="250" src="./public/sora.png" />
   <h2 align="center">SORA</h2>
</p>

ᮞᮧᮛ (Sora) yang berarti suara adalah aplikasi yang dapat menyuarakan aspirasi masyarakat untuk memilih kandidat pemimpin yang baru.

Project ini adalah hasil rebuild [NVA13](https://github.com/sekilas13/nva13) yang awalnya dibuat dengan [Node.js](https://nodejs.org/en/) dengan templating engine [EJS](https://ejs.co/) digantikan dengan [Next.js](https://nextjs.org/) yang lebih modular. Tujuan utama dari aplikasi ini untuk mengurangi biaya karena penggunaan kertas dan juga waktu penghitungan yang manual.

## Prerequisites

Anda butuh

- Node.js dan NPM (atau Package Manager lainnya)
- MongoDB untuk menyimpan data

## Pemakaian

### Cloning Dari Github

Jalankan perintah ini Command Line.

```sh
# HTTPS
git clone https://github.com/reacto11mecha/sora.git

# SSH
git clone git@github.com:reacto11mecha/sora.git
```

### Menginstall package

Anda ke root directory project dan menginstall package yang diperlukan.

```sh
npm install

# atau menggunakan pnpm
pnpm install
```

### Menjalankan Aplikasinya

Pertama-tama, copy file `env.example` menjadi `.env` dan isikan value yang sesuai.

Keterangan `.env`:

- `MONGO_URL`: URL Database MongoDB yang akan dijadikan penyimpanan data
- `SESS_NAME`: Nama session cookie yang nantinya akan digunakan selama aplikasi berjalan
- `TOKEN_SECRET`: Secret token yang akan mengencrypt cookie session administrator
- `SETTINGS_PASSWORD`: Secret token yang akan mengencrypt file pengaturan agar tidak mudah diubah-ubah
- `PRODUCTION_URL`: URL yang nantinya akan digunakan pada saat production. Semisal mendapatkan IP Local `192.168.100.2` kira-kira valuenya menjadi `http://192.168.100.2:3000/`

Untuk mengenerate secret `TOKEN_SECRET` dan `SETTINGS_PASSWORD` bisa menggunakan snippet dibawah ini, jalankan di REPL Node.js dan tempel hasilnya. Token harus berbeda satu sama lain jadi harus dijalankan dua kali.

```js
// Bisa menggunakan base64
console.log(require("crypto").randomBytes(50).toString("base64"));

// Atau menggunakan hex
console.log(require("crypto").randomBytes(50).toString("hex"));
```

Sebelum langsung menjalankan, terlebih dahulu membuild kode Next.js supaya bisa dijalankan di production mode.

```sh
npm run build

# atau menggunakan pnpm
pnpm build
```

Selesai membuild aplikasi, **jangan lupa menjalankan MongoDB sebelum sora berjalan**. Jika sudah berjalan baru bisa menggunakan sora dengan mengetikkan

```sh
npm start

# atau menggunakan pnpm
pnpm start
```

Anda bisa membukanya di http://localhost:3000, setelah itu bisa menyiapkan hal lain yang akan dijelaskan setelah ini.

### Mekanisme Pemilihan

#### 1. Menyiapkan Perangkat Pemilihan

Yang pertama-tama jika sudah di test dapat berjalan, disiapkan terlebih dahulu komputer-komputer yang nantinya akan dipakai untuk pemilihan. Kira-kira jika ada 5 komputer, 1 komputer dijadikan server dan 4 komputer dijadikan pemilih akan terlihat seperti ini.

<p align="center">
   <image width="500" src="./examples/readme/mempersiapkan-perangkat.png" />
</p>

#### 2. Mengkonfigurasi Koneksi dan Menyiapkan Browser Pemilih

Periksa koneksi jaringan lokal komputer pemilih dengan server sekaligus mengakses halaman pemilihan di browser pemilih. Seperti contoh dibawah ini, komputer server berada di IP `192.168.100.2`, jadi saya bisa mengaksesnya http://192.168.100.2:3000/. Tampilan awal jika baru pertama dijalankan akan muncul seperti ini.

<p align="center">
   <image width="1000" src="./examples/readme/membuka-browser.png" />
</p>

#### 3. Mendaftarkan Administrator

Di komputer server, kunjungi halaman http://localhost:3000/admin/register untuk mendaftarkan akun administrator, contohnya seperti dibawah ini.

Keterangan Form:

- `Email`: Harus berupa format email yang valid (tidak perlu email pribadi, asal tak apa tapi harus ingat)
- `Nama Lengkap`: Hanya diperbolehkan huruf alphabet
- `Kata Sandi`: Minimal memiliki panjang 6 karakter
- `Konfirmasi Kata Sandi`: Harus sama seperti `Kata Sandi`

> Jika nanti berada di halaman [login](http://localhost:3000/admin/register) aturannya juga sama, tetapi hanya terdapat `Email` dan `Kata Sandi` saja.

<p align="center">
   <image width="1000" src="./examples/readme/mendaftarkan-akun.png" />
</p>

Jika sudah berhasil daftar nanti akan dialihkan halaman dashboard dan ada pesan akun berhasil didaftarkan.

<p align="center">
   <image width="1000" src="./examples/readme/berhasil-daftar.png" />
</p>

#### 4. Mengatur Waktu Pemilihan

Setelah mendaftar, atur waktu pemilihan terlebih dahulu supaya jika sudah waktu pemilihan tinggal menyalakan mode pemilihan.

<p align="center">
   <image width="1000" src="./examples/readme/halaman-pengaturan-set-waktu.png" />
</p>

<p align="center">
   <image width="1000" src="./examples/readme/halaman-pengaturan-set-waktu-terset.png" />
</p>

#### 5. Menambahkan Kandidat

Kandidat yang ada ditambahkan ke aplikasi, klik tombol `Paslon` => `Tambah Paslon Baru` dan tambahkan kandidat yang sudah ada. Masukkan nama ketua dan wakil kandidat beserta foto mereka. Disarankan foto memiliki dimensi `1366x768` pixel. Masukan kandidat berurutan sesuai nomor urut yang sudah ditetapkan panitia.

<p align="center">
   <image width="1000" src="./examples/readme/tambah-paslon.png" />
</p>

Semisal saya memiliki contoh kandidat nomor urut 1 yaitu `Ubuntu` dan `Mint`, kandidat nomor urut 2 yaitu `Manjaro` dan `Arch`, terlebih dahulu saya masukan paslon `Ubuntu` dan `Mint` lalu `Manjaro` dan `Arch`. Maka hasilnya nanti akan seperti ini.

<p align="center">
   <image width="1000" src="./examples/readme/berhasil-tambah-paslon.png" />
</p>

#### 6. Mengubah Status Sudah Boleh Memilih

Jika sudah dirasa siap, status `Sudah Boleh Memilih` bisa dinyalakan.

<p align="center">
   <image width="1000" src="./examples/readme/sudah-boleh-memilih.png" />
</p>

Selama sudah bisa memilih dan masih dalam waktu pemilihan, pemilih bisa memilih paslon sesuai apa yang ingin mereka pilih. Jika waktu sudah melewati tenggat pemilihan atau `sudah boleh memilih` dimatikan maka pemilih tidak bisa memilih lagi kandidat yang tersedia.

<p align="center">
   <image width="1000" src="./examples/readme/halaman-depan.png" />
</p>

### Perilaku Pemilihan

Kedua perilaku dibawah ini setelah pemilih memilih kandidat yang mereka inginkan akan ada popup `Paslon berhasil terpilih!`, tetapi dapat diubah di pengaturan. Dibawah ini adalah kedua perilaku yang dapat diterapkan dalam pemilihan.

#### Tanpa Refresh

Opsi ini adalah opsi default ketika aplikasi ini baru dijalankan, kira-kira akan jadi seperti ini setelah seseorang memilih salah satu kandidat.

<p align="center">
   <image width="1000" src="./examples/readme/tanpa-refresh.gif" />
</p>

#### Dengan Refresh

Opsi ini adalah opsi ketika user telah memilih dan halaman otomatis terefresh ketika berhasil terpilihnya seorang kandidat, pertama-tama nyalakan dulu pengaturan `Refresh halaman setelh memilih` dan simpan.

<p align="center">
   <image src="./examples/readme/menyalakan-opsi-refresh.png" />
</p>

Ketika berhasil dinyalakan, halaman pemilih akan terefresh setelah kandidat berhasil terpilih.

<p align="center">
   <image width="1000" src="./examples/readme/dengan-refresh.gif" />
</p>

### Statistik Pemilihan

Statistik perkembangan pemilihan bisa dilihat dihalaman statistik. Data akan diperbarui secara real-time seiiring pemilih memilih kandidat yang mereka inginkan.

<p align="center">
   <image width="1000" src="./examples/readme/halaman-statistik.png" />
</p>

### Tampilan Administrator

Terdapat dua mode tampilan administrator yang bisa dipilih, yaitu mode terang dan mode gelap.

<p align="center">
   <image width="1000" src="./examples/readme/mode-terang.png" />
   <small>Mode Terang</small>
</p>

<br />

<p align="center">
   <image width="1000" src="./examples/readme/mode-gelap.png" />
   <small>Mode Gelap</small>
</p>

<br />

### Panduan Penggunaan

Aplikasi ini ketika sudah dijalankan maka siapapun user bisa mendaftar sebagai administrator dan dapat memilih berulang kali. Jadi berikut ini adalah rekomendasi panduan penggunaan sora.

#### 1. **Pilihlah Panitia yang Benar-Benar Jujur!**

Terlepas dari aplikasi apa yang dipakai, jika panitia yang dipilih tidak jujur maka dengan mudah mereka mencurangi sebuah sistem.

Administrator yang sudah login memang tidak bisa memilih kandidat, tetapi mereka **bisa membuka tab incognito di browser** mereka. Jadi jangan sampai mereka membuka window browser incognito.

Panitia pengawas komputer hanya boleh mengawasi jalannya pelaksanaan pemilihan dan melaporkan jika ditemukan adanya masalah. Popup pemilihan akan berwarna merah dan berisikan pesan error. Selain itu tidak boleh pengawas memilih kecuali pada saat giliran mereka untuk memilih.

#### 2. **Tidak Menjalankan Aplikasi Pada Layanan Hosting!**

Pada dasarnya aplikasi ini bisa di upload ke layanan hosting dan dapat diakses di internet, tetapi sebaiknya tidak melakukan itu. Akan ada oknum yang tidak bertanggung jawab yang mendaftarkan akun administrator untuk kepentingan pribadi. Pemilih juga dapat memilih berkali-kali kandidat yang mereka dukung.

#### 3. **Menjalankan Aplikasi pada Jaringan Lokal (LAN)!**

Menyambung poin sebelumnya, aplikasi ini dirancang untuk pemilihan langsung di lapangan dengan jaringan lokal, oleh karena itu diperlukan komputer administrator dan pemilih dalam jaringan yang terisolasi dari jaringan internet.

#### 4. **Menggunakan Mode Layar Penuh (Fullscreen) Browser pada Komputer Pemilih!**

Untuk meminimalisir lebih kecurangan, browser yang ada di komputer yang digunakan untuk pemilihan harus pada kondisi fullscreen supaya address bar alamat web tidak dapat diketahui pemilih.

### Local Development

Langkah pertama, fork atau clone terlebih dahulu.

```sh
# HTTPS
git clone https://github.com/reacto11mecha/sora.git

# SSH
git clone git@github.com:reacto11mecha/sora.git
```

Kedua, menginstall seluruh package yang dibutuhkan.

```sh
npm install

# atau menggunakan pnpm
pnpm install
```

Ketiga, menyalin file `env.example` menjadi `.env` dan isikan sesuai field yang telah dijelaskan sebelumnya di [Menjalankan Aplikasinya](#menjalankan-aplikasinya).

### Disclaimer

Penegasan, **saya tidak bertanggung jawab atas hal-hal yang tidak anda inginkan, gunakan dengan bijak dan tepat!**

### Lisensi

Semua kode yang ada di repositori ini bernaung dibawah [MIT License](LICENSE).
