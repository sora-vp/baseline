<p align="center">
   <img width="150" height="150" src="./public/sora.png" />
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
