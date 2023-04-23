<p align="center">
   <img width="300" height="300" src="./apps/sora/public/sora.png" />
   <h1 align="center">Memahami Keseluruhan Arsitektur Aplikasi</h1>
   
   [![Lint, TS, Prettier Check](https://github.com/reacto11mecha/sora/actions/workflows/ci.yml/badge.svg)](https://github.com/reacto11mecha/sora/actions/workflows/ci.yml) [![CodeQL](https://github.com/reacto11mecha/sora/actions/workflows/codeql.yml/badge.svg)](https://github.com/reacto11mecha/sora/actions/workflows/codeql.yml)
</p>

File ini adalah penjelasan bagaimana keseluruhan aplikasi ini bekerja. Terdapat penjelasan yang disertakan diagram.

## Arsitektur Backend

Untuk backend, terdapat [sora](./apps/sora/) dan [vote-processor](./apps/vote-processor/) yang nantinya akan berkomunikasi dengan RabbitMQ dan database yang bertipe SQL.

```mermaid
graph TD
    A[sora]
    B[vote-processor]
    C[Database]
    D[RabbitMQ]

    A -->|Koneksi DB| C
    B -->|Mengambil data pengaturan via trpc| A
    A ---|RPC| D

    D ---|RPC| B
    B -->|Koneksi DB| C
```

Sora adalah aplikasi [Next.js](https://nextjs.org/) yang menggunakan [trpc](https://trpc.io/) untuk menjembatani frontend dan backend. Data seluruh kandidat, peserta pemilihan, dan pengaturan berada di sini. Aplikasi desktop akan berkomunikasi dengan metode Long Polling melalui endpoint trpc. Jika ada upvote yang masuk, akan diteruskan ke RabbitMQ untuk diproses.

RabbitMQ digunakan sebagai message broker untuk memproses data upvote. Setelah RabbitMQ mendapatkan data dari sora, saatnya vote-processor yang memproses upvote yang masuk. Processor hanya mengolah **satu** perintah voting yang masuk, hal ini dapat meminimalisir terjadinya data ganda. Di vote-processor ini akan menambah jumlah yang memilih kandidat dan status peserta akan diperbarui menjadi sudah memilih.

## Arsitektur Desktop

### Aplikasi Absensi

Aplikasi absensi ini di belakang layar mengambil data waktu mulai, waktu selesai, dan apakah sudah bisa absen atau belum. Jika kriteria itu memenuhi maka yang memiliki QR Code bisa absen.

```mermaid
sequenceDiagram
    participant D as Aplikasi Desktop
    participant S as sora

    loop Long Polling setiap 2,5 detik
        D->>S: Hit endpoint trpc pengaturan
        activate S
        S->>D: Mengirim data pengaturan (update state)
        deactivate S
        Note over D,S: Pengecekan apakah pengaturan valid atau tidak
    end
```

Jika pengaturan valid maka aplikasi ini akan memunculkan halaman untuk scan QR Code yang ditunjukan oleh pemilih, jika tidak akan di tunjukan box dengan tulisan "Tidak Bisa Memilih!". Berikut ini diagramnya.

```mermaid
graph
    A[Mulai, QR Reader Standby]
    B[QR Reader membaca ada QR]
    C{Apakah isi QR Valid?}
    D[Munculkan error sesuai keadaan]
    E{Hit TRPC Endpoint, Apakah sudah absen?}
    F[Update bahwa peserta sudah absen]

    A --> B
    B --> C
    C -->|Valid| E
    C --> D
    E -->|Sudah Absen| D
    E -->|Belum| F
```

Jika QR menunjukan error dari QR yang tidak valid atau peserta pemilih sudah absen maka tidak bisa hilang secara otomatis. Perlu melakukan refresh browser untuk menghilangkan error tersebut dan kembali ke alur paling awal.
