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
