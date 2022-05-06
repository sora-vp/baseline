<p align="center">
   <img width="150" height="150" src="./public/sora.png">
   <h2 align="center">SORA</h2>
</p>

ᮞᮧᮛ (Sora) yang berarti suara adalah aplikasi yang dapat menyuarakan aspirasi masyarakat untuk memilih kandidat pemimpin yang baru.

Project ini adalah hasil rebuild [nva13](https://github.com/sekilas13/nva13) yang awalnya dibuat dengan [Node.js](https://nodejs.org/en/) dengan templating engine [ejs](https://ejs.co/) digantikan dengan [Next.js](https://nextjs.org/) yang lebih modular.

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

Anda bisa membukanya di http://localhost:3000
