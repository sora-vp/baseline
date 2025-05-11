<p align="center">
   <img width="300" height="300" src="./apps/web/public/sora.png" />
   <h1 align="center">SORA</h1>
   
   [![Lint, TS, Prettier Check](https://github.com/reacto11mecha/sora/actions/workflows/ci.yml/badge.svg)](https://github.com/reacto11mecha/sora/actions/workflows/ci.yml)
</p>

ᮞᮧᮛ (Sora) yang berarti suara adalah aplikasi yang dapat menyuarakan aspirasi masyarakat untuk memilih kandidat pemimpin yang baru.

Project ini adalah hasil rebuild [NVA13](https://github.com/sekilas13/nva13) yang awalnya dibuat dengan [Node.js](https://nodejs.org/en/) dengan templating engine [EJS](https://ejs.co/) digantikan dengan [Next.js](https://nextjs.org/) yang lebih modular. Tujuan utama dari aplikasi ini untuk mengurangi biaya karena penggunaan kertas dan juga waktu penghitungan yang manual.

Penjelasan penggunaan yang *production ready*, anda dapat mengunjungi web dokumentasi [sora baseline berikut ini](https://sora.rmecha.my.id/panduan/baseline/web-admin/prasyarat/). Penasaran dengan asal usul projek ini? Anda dapat mengunjungi https://sora.rmecha.my.id/perkenalan/ untuk mendapatkan penjelasan lengkapnya.

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
yarn
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

- Develop sisi web presensi (attendance)

  ```
  yarn dev:attendance
  ```

- Develop sisi web pemilih (chooser)

  ```
  yarn dev:chooser
  ```

## Ucapan Terimakasih

Saya sebelumnya berterima kasih kepada tim [t3-oss](https://github.com/t3-oss) yang sudah membuat [`create-t3-app`](https://github.com/t3-oss/create-t3-app) dan [`create-t3-turbo`](https://github.com/t3-oss/create-t3-turbo) karena project ini menggunakan template mereka yang sudah membantu saya dalam pembuatan project ini.

Saya juga berterima kasih terhadap MPK (Majelis Permusyawaratan Kelas) SMA Negeri 12 Kota Bekasi yang mau dan percaya untuk menggunakan aplikasi ini. Banyak kritik dan saran dari pihak guru dan murid-murid yang akhirnya terciptalah versi kedua dari project ini.

## Disclaimer

Penegasan, **saya tidak bertanggung jawab atas hal-hal yang tidak anda inginkan, gunakan dengan bijak dan tepat!**

## Lisensi

Semua kode yang ada di repositori ini bernaung dibawah [GPLv3](LICENSE).
