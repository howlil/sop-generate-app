# Transkrip Wawancara Pengelolaan SOP AP

Dokumen ini merupakan draf transkrip wawancara terstruktur untuk mendukung penyusunan laporan tugas akhir. Isi disusun berdasarkan catatan pertanyaan wawancara, konteks Bab I, Bab II, dan Bab III pada `draft-TA-1.docx`, serta dokumen kebutuhan sistem pada folder `docs`.

## I. Informasi Wawancara

| Informasi | Keterangan |
| :--- | :--- |
| Judul penelitian | Pembangunan Sistem Informasi Pengelolaan Standar Operasional Prosedur Berbasis Web pada Sekretariat Daerah Biro Organisasi Provinsi Sumatera Barat |
| Topik wawancara | Proses pengelolaan Standar Operasional Prosedur Administrasi Pemerintahan (SOP AP), kendala proses manual, kebutuhan sistem, dan alur kerja usulan |
| Tanggal wawancara | 3 September 2025 dan 11 September 2025 |
| Tempat wawancara | Biro Organisasi Sekretariat Daerah Provinsi Sumatera Barat |
| Jenis wawancara | Semi-terstruktur |
| Narasumber | I Gusti Firmansyah, S.Sos., M.A.P. |
| Jabatan narasumber | Pelaksana Tugas Kepala Biro Organisasi Sekretariat Daerah Provinsi Sumatera Barat |
| Pewawancara | Peneliti |
| Ruang lingkup | Penyusunan, pengajuan, verifikasi, evaluasi, revisi, pengesahan internal, pengarsipan, dan evaluasi SOP AP |
| Catatan bahasa | Jawaban ditulis dengan gaya percakapan nonformal agar mendekati bahasa wawancara langsung, tetapi tetap disesuaikan dengan kebutuhan akademik laporan TA |

## II. Tujuan Wawancara

Wawancara ini dilakukan untuk memperoleh gambaran langsung mengenai proses pengelolaan SOP AP pada Biro Organisasi Sekretariat Daerah Provinsi Sumatera Barat. Informasi yang digali digunakan sebagai dasar dalam identifikasi permasalahan, analisis proses bisnis AS-IS, penyusunan proses bisnis TO-BE, serta perumusan kebutuhan fungsional dan non-fungsional sistem.

Tujuan khusus wawancara adalah sebagai berikut:

1. Mengetahui alur kerja pengelolaan SOP AP yang sedang berjalan antara OPD dan Biro Organisasi.
2. Mengidentifikasi kendala proses manual, terutama terkait format dokumen, koordinasi, revisi, pencarian arsip, dan keterlacakan perubahan.
3. Menggali kebutuhan sistem informasi berbasis web yang dapat mendukung penyusunan, pengajuan, evaluasi, pengesahan internal, dan pengarsipan SOP.
4. Mengetahui aktor yang terlibat, pembagian tanggung jawab, batasan bisnis, serta aturan akses yang perlu diterapkan dalam sistem.
5. Memvalidasi kebutuhan fitur utama seperti status pengajuan, riwayat perubahan, catatan evaluasi, arsip digital, tanda tangan elektronik internal, dan laporan evaluasi.

## III. Ringkasan Temuan Utama

| Aspek | Temuan wawancara | Implikasi ke sistem |
| :--- | :--- | :--- |
| Cakupan OPD | Terdapat 52 OPD yang menjadi ruang lingkup pembinaan dan evaluasi SOP. | Sistem perlu memiliki master data OPD dan pengelompokan data SOP berdasarkan OPD. |
| Beban kerja Biro | Biro Organisasi menangani banyak dokumen dengan jumlah staf terbatas. | Sistem perlu membantu standardisasi input, monitoring status, dan pengurangan pekerjaan teknis berulang. |
| Proses manual | Dokumen masih banyak berbentuk hard copy dan pertukaran dokumen belum terpusat. | Dibutuhkan penyimpanan dokumen terpusat, status pengajuan, dan arsip digital. |
| Format SOP | Banyak OPD belum seragam dalam memahami format PermenPAN-RB Nomor 35 Tahun 2012. | Sistem perlu menyediakan form penyusunan SOP yang terstruktur sesuai komponen SOP AP. |
| Revisi | Revisi dapat terjadi berulang karena ketidaksesuaian format, alur, atau substansi. | Sistem perlu menyediakan catatan evaluasi, tindak lanjut revisi, pengajuan ulang, dan audit log. |
| Arsip lama | SOP lama sering sulit ditemukan, bahkan ada yang sudah dibuang karena belum ada sistem arsip. | Sistem perlu menyimpan versi, arsip SOP berlaku, SOP digantikan, dan SOP dicabut. |
| Pengesahan | Pengesahan diperlukan setelah proses evaluasi dan berita acara selesai. | Sistem perlu mendukung tanda tangan elektronik internal dan validasi status sebelum SOP berlaku. |
| Evaluasi | Evaluasi tetap diperlukan, baik berdasarkan pengajuan OPD maupun evaluasi terjadwal. | Sistem perlu mendukung pengajuan evaluasi, penilaian SOP, catatan perbaikan, dan laporan evaluasi. |

## IV. Transkrip Wawancara

Keterangan:

- P = Peneliti
- N = Narasumber

| Kode | Pembicara | Pertanyaan / Jawaban |
| :---: | :---: | :--- |
| P1 | P | Pak, boleh dijelaskan dulu secara umum peran Biro Organisasi dalam pengelolaan SOP AP di lingkungan Pemerintah Provinsi Sumatera Barat? |
| N1 | N | Secara garis besar, Biro Organisasi itu membina dan memfasilitasi OPD dalam penyusunan SOP AP. Jadi OPD yang menyusun SOP, lalu Biro membantu memeriksa apakah format, alur, dan substansinya sudah sesuai ketentuan. Kita juga ikut mendampingi kalau OPD masih bingung, terutama soal format berdasarkan PermenPAN-RB Nomor 35 Tahun 2012. |
| P2 | P | Berarti OPD tetap menjadi pihak yang menyusun dokumen SOP, ya Pak? |
| N2 | N | Iya, betul. SOP itu pada dasarnya disusun oleh masing-masing OPD karena mereka yang paling tahu proses kerja di unitnya. Biro Organisasi posisinya memfasilitasi, membina, mengevaluasi, dan memastikan SOP itu sesuai aturan. Jadi bukan Biro yang membuat semua SOP dari nol, tapi dalam praktiknya kadang Biro ikut banyak membantu karena dokumen yang masuk belum rapi atau belum sesuai format. |
| P3 | P | Ada berapa banyak OPD yang terlibat dalam proses pengelolaan SOP ini? |
| N3 | N | Kalau di lingkungan Pemerintah Provinsi Sumatera Barat, kurang lebih ada 52 OPD. Masing-masing OPD itu bisa punya banyak SOP, bahkan lebih dari sepuluh. Jadi kalau semuanya harus dibina dan diperiksa manual, bebannya lumayan besar. Apalagi staf yang menangani di Biro juga terbatas. |
| P4 | P | Untuk satu SOP, biasanya berapa kali rapat atau pembahasan sampai dokumennya bisa selesai? |
| N4 | N | Tidak selalu sama. Kalau OPD sudah paham format dan substansinya bagus, prosesnya bisa lebih cepat. Tapi kalau dokumennya belum sesuai, bisa beberapa kali pembahasan. Kadang prosesnya bisa dua sampai tiga minggu, dengan rapat yang durasinya tiga sampai empat jam. Jadi bukan cuma sekali duduk langsung selesai, karena sering ada perbaikan format, alur, atau isi SOP. |
| P5 | P | Saat rapat atau pembahasan, apakah OPD biasanya membawa draft dokumen SOP ke Biro? |
| N5 | N | Iya, biasanya ada draft yang dibawa atau dikirimkan. Draft itu yang kemudian diperiksa bersama. Dari situ kelihatan apakah komponen SOP sudah lengkap, alurnya sudah benar, pelaksananya jelas, dasar hukumnya sesuai, dan formatnya sudah mengikuti pedoman. |
| P6 | P | Dari pengalaman Bapak, masalah terbesar pada proses manual itu lebih ke masalah teknis dokumen atau masalah koordinasi SDM? |
| N6 | N | Dua-duanya ada, tapi yang paling sering terlihat itu masalah teknis dokumen dan pemahaman OPD. Banyak OPD belum benar-benar memahami format SOP AP, jadi dokumen yang masuk beda-beda. Ada yang formatnya tidak sesuai, ada yang diagramnya belum jelas, ada yang alurnya loncat-loncat. Tapi koordinasi juga berpengaruh, karena kalau revisi harus bolak-balik manual, waktunya jadi panjang. |
| P7 | P | Jadi bisa dikatakan masalah teknis dan SDM saling berkaitan, ya Pak? |
| N7 | N | Iya, saling berkaitan. Kalau SDM belum paham pedoman, hasil teknis dokumennya jadi tidak seragam. Lalu ketika dokumen tidak seragam, Biro harus ikut membetulkan format dan memberikan arahan. Akhirnya waktu yang seharusnya bisa dipakai untuk memeriksa substansi juga tersita untuk memperbaiki hal teknis. |
| P8 | P | Apakah di OPD ada penanggung jawab dan penyusun SOP? Apakah dua aktor ini berbeda? |
| N8 | N | Iya, biasanya dibedakan. Ada pihak yang bertanggung jawab atau mengoordinasikan di OPD, dan ada penyusun yang mengerjakan isi dokumennya. Kalau di sistem nanti, masuk akal kalau ada peran PJ Penyusun dan Penyusun. PJ Penyusun lebih ke koordinasi dan pengajuan, sedangkan Penyusun fokus menyusun atau memperbaiki dokumen. |
| P9 | P | Dalam proses manual sekarang, bagaimana sistem arsip dokumen SOP yang sudah dibuat? |
| N9 | N | Jujur saja, arsipnya belum tertata dalam satu sistem khusus. Banyak yang masih berbentuk hard copy. Kadang SOP lama itu disimpan di OPD masing-masing, kadang juga sudah tidak jelas posisinya. Ada juga yang SOP lama dibuang karena dianggap tidak dipakai lagi. Jadi saat butuh melihat SOP versi lama, sering tidak mudah dicari. |
| P10 | P | Apakah kendala mencari SOP lama atau versi terdahulu sering terjadi? |
| N10 | N | Iya, itu salah satu kendala. Kalau dokumennya hard copy dan tidak ada daftar arsip yang rapi, mencari SOP lama bisa lama. Kadang OPD harus menyusun ulang karena dokumen lama tidak ditemukan. Padahal kalau ada riwayat atau arsip digital, tinggal dicari berdasarkan OPD, judul, nomor, atau statusnya. |
| P11 | P | Apakah pernah terjadi SOP ganda atau versi berbeda yang menyebabkan masalah di lapangan? |
| N11 | N | Potensinya ada. Kalau arsip tidak tertata, orang bisa saja memegang versi yang berbeda. Misalnya satu pihak memakai dokumen lama, sementara pihak lain sudah punya revisi baru. Kalau tidak jelas mana yang berlaku, itu bisa membingungkan pelaksanaan pekerjaan. Karena itu versi dokumen penting, harus jelas mana yang berlaku, mana yang digantikan, dan mana yang dicabut. |
| P12 | P | Apakah SOP ini memiliki kategori tertentu? |
| N12 | N | Secara praktik, SOP bisa dikelompokkan berdasarkan OPD, unit kerja, jenis layanan, atau proses kerja. Tapi yang paling penting untuk sistem adalah SOP bisa dicari dan dipilah. Minimal berdasarkan OPD, judul, nomor SOP, status, tahun, dan mungkin keterkaitan dengan SOP lain atau dasar hukumnya. |
| P13 | P | Dalam penyusunan SOP, komponen apa saja yang wajib diperhatikan agar sesuai pedoman? |
| N13 | N | Komponen dasarnya mengikuti pedoman SOP AP. Ada identitas SOP, dasar hukum, keterkaitan, kualifikasi pelaksana, peralatan dan perlengkapan, peringatan, pencatatan dan pendataan, lalu uraian prosedur. Di prosedur itu juga ada pelaksana, kegiatan, mutu baku seperti kelengkapan, waktu, output, dan alur dalam bentuk diagram. |
| P14 | P | Kalau sistem dibuat, apakah form penyusunan SOP perlu dibuat terstruktur mengikuti komponen itu? |
| N14 | N | Perlu. Kalau dibiarkan bebas seperti mengetik dokumen biasa, nanti masalah format bisa muncul lagi. Lebih baik sistem menyediakan isian yang jelas. Misalnya bagian dasar hukum diisi di tempatnya sendiri, pelaksana di tempatnya sendiri, langkah kegiatan juga diatur. Nanti sistem yang membentuk dokumen akhirnya supaya formatnya lebih seragam. |
| P15 | P | Apakah perlu ada deadline dalam proses pembuatan atau pengajuan SOP? |
| N15 | N | Menurut saya perlu, minimal untuk membantu monitoring. Dalam praktik, proses bisa molor karena revisi, menunggu dokumen, atau menunggu tanda tangan. Kalau ada target waktu atau batas tindak lanjut, Biro dan OPD bisa sama-sama melihat mana yang sudah lama tertahan. |
| P16 | P | Apakah sistem perlu fitur reminder deadline agar proses pembuatan SOP tidak molor? |
| N16 | N | Iya, itu membantu. Reminder tidak harus rumit dulu, yang penting pengguna bisa melihat dokumen mana yang mendekati batas waktu atau sudah melewati target. Kalau nanti bisa ada notifikasi, itu lebih baik. |
| P17 | P | Untuk notifikasi, apakah perlu melalui email atau notifikasi aplikasi kalau ada revisi atau deadline? |
| N17 | N | Idealnya ada notifikasi. Email bisa lebih formal, sedangkan notifikasi di dalam aplikasi atau indikator status wajib ada agar pengguna langsung melihat tindak lanjut yang diperlukan. |
| P18 | P | Apakah setiap perubahan pada SOP harus bisa ditelusuri siapa yang mengubah, kapan, dan apa yang diubah? |
| N18 | N | Iya, perlu. Karena SOP itu dokumen resmi. Kalau ada perubahan, harus jelas siapa yang melakukan dan kapan dilakukan. Ini penting supaya kalau ada pertanyaan atau perbedaan versi, kita bisa lihat riwayatnya. |
| P19 | P | Seberapa penting fitur riwayat perubahan atau audit log dalam pembuatan SOP? |
| N19 | N | Penting. Menurut saya bukan cuma tambahan, tapi memang perlu. Dengan audit log, proses revisi jadi lebih jelas. Penyusun bisa tahu bagian mana yang pernah diubah, evaluator bisa melihat tindak lanjut, dan Biro bisa memantau prosesnya. |
| P20 | P | Dalam proses evaluasi, apakah evaluator perlu memberikan catatan langsung pada SOP yang belum sesuai? |
| N20 | N | Iya. Kalau SOP belum sesuai, evaluator perlu memberi catatan. Catatannya harus jelas, misalnya bagian mana yang perlu diperbaiki, apakah formatnya, alurnya, dasar hukumnya, atau substansinya. Kalau catatan hanya disampaikan lisan, nanti bisa lupa atau beda pemahaman. Jadi sebaiknya dicatat dalam sistem. |
| P21 | P | Apakah catatan evaluasi itu perlu terhubung dengan tindak lanjut revisi dari OPD? |
| N21 | N | Perlu. Kalau evaluator memberi catatan, OPD harus bisa menindaklanjuti. Setelah diperbaiki, statusnya juga harus berubah, misalnya revisi selesai dan siap dikirim ulang. Dengan begitu evaluator tahu bahwa SOP itu sudah diperbaiki dan bisa diperiksa lagi. |
| P22 | P | Apakah setelah SOP disahkan masih ada proses evaluasi berkala, misalnya satu tahun sekali? |
| N22 | N | Evaluasi tetap diperlukan. SOP itu tidak selalu berlaku selamanya tanpa perubahan. Kalau ada perubahan aturan, perubahan struktur, perubahan layanan, atau hasil monitoring menunjukkan SOP perlu diperbaiki, maka SOP perlu dievaluasi lagi. Untuk periodenya bisa mengikuti kebijakan atau kebutuhan, tapi sistem sebaiknya bisa mendukung evaluasi terjadwal. |
| P23 | P | Berarti sistem perlu mendukung SOP versi baru dari SOP yang sudah berlaku? |
| N23 | N | Iya, perlu. Kalau SOP sudah berlaku lalu ada perbaikan, jangan sampai dokumen lama hilang begitu saja. Sistem harus bisa membuat versi baru, sementara versi lama tetap tersimpan sebagai riwayat. Nanti jelas mana versi yang sedang berlaku dan mana yang sudah digantikan. |
| P24 | P | Apakah setelah SOP disahkan, dokumen perlu masuk arsip publik? |
| N24 | N | Untuk SOP yang sudah berlaku, sebaiknya bisa diakses sebagai arsip sesuai kebijakan. Tapi yang ditampilkan ke publik tentu dokumen final, bukan catatan internal atau proses revisinya. Jadi sistem perlu membedakan arsip internal dan arsip publik. |
| P25 | P | Apakah perlu fitur unduh atau cetak dokumen SOP dan berita acara? |
| N25 | N | Perlu. Walaupun prosesnya sudah digital, dokumen PDF tetap dibutuhkan untuk arsip, pelaporan, atau dibagikan ke pihak terkait. Berita acara evaluasi juga perlu bisa dicetak atau diunduh karena itu bukti administratif bahwa SOP sudah melalui evaluasi. |
| P26 | P | Untuk pengesahan, apakah tanda tangan elektronik internal dalam sistem sudah cukup untuk kebutuhan aplikasi ini? |
| N26 | N | Untuk kebutuhan internal sistem, mekanisme tanda tangan elektronik internal bisa digunakan sebagai validasi alur persetujuan. Tapi perlu dibatasi, ini bukan berarti langsung sama dengan tanda tangan elektronik tersertifikasi dari BSrE atau PSrE. Jadi kalau sistem mencatat PIN, waktu tanda tangan, pengguna yang menandatangani, dan dokumen yang disahkan, itu sudah membantu untuk kebutuhan administrasi internal. |
| P27 | P | Apakah urutan tanda tangan berita acara dan pengesahan SOP perlu dibuat ketat? |
| N27 | N | Iya, harus ada urutannya. Berita acara harus selesai dulu, ditandatangani pihak yang berwenang, baru SOP bisa disahkan oleh Kepala OPD. Jangan sampai SOP bisa langsung berlaku tanpa melewati evaluasi dan berita acara. Sistem perlu mengunci status seperti itu. |
| P28 | P | Dalam sistem nanti, siapa saja aktor yang menurut Bapak perlu dibedakan hak aksesnya? |
| N28 | N | Paling tidak ada pihak Biro sebagai PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun, dan masyarakat atau pengunjung untuk arsip publik. Hak aksesnya harus beda. Evaluator menilai, penyusun membuat dan memperbaiki, PJ Penyusun mengajukan, Kepala OPD mengesahkan, dan pengunjung hanya melihat dokumen yang sudah berlaku. |
| P29 | P | Apakah PJ Evaluator juga perlu mengelola data OPD dan akun pengguna? |
| N29 | N | Iya, kalau sistemnya dipakai lintas OPD, harus ada pihak yang mengatur master data OPD dan pengguna. Kalau tidak, nanti siapa yang memastikan satu OPD punya PJ Penyusun yang benar, siapa evaluatornya, dan siapa Kepala OPD yang aktif. Data pengguna juga perlu bisa dinonaktifkan kalau orangnya pindah atau tidak bertugas lagi. |
| P30 | P | Apakah satu OPD cukup punya satu PJ Penyusun aktif? |
| N30 | N | Idealnya begitu, supaya tanggung jawab pengajuan jelas. Penyusun bisa lebih dari satu, tapi PJ Penyusun sebagai penanggung jawab pengajuan sebaiknya satu yang aktif untuk satu OPD. Kalau ada pergantian, riwayatnya tetap perlu disimpan. |
| P31 | P | Dalam proses manual, apakah status dokumen mudah dipantau? Misalnya sedang disusun, sedang dievaluasi, atau sedang revisi. |
| N31 | N | Belum mudah. Karena statusnya sering diketahui dari komunikasi langsung atau dari dokumen yang sedang beredar. Kalau ada banyak SOP dari banyak OPD, memantau satu-satu secara manual tentu sulit. Makanya sistem status itu penting, supaya semua pihak tahu dokumen sedang di tahap apa. |
| P32 | P | Status apa saja yang menurut Bapak penting untuk terlihat dalam sistem? |
| N32 | N | Minimal ada draft, siap diajukan atau menunggu pengajuan evaluasi, sedang dievaluasi, perlu revisi, menunggu TTD PJ Evaluator, sudah ditandatangani, berlaku, digantikan, dan dicabut. Tidak harus persis istilahnya seperti itu, tapi intinya alur status harus menggambarkan posisi dokumen. |
| P33 | P | Apakah perlu laporan otomatis, misalnya laporan bulanan jumlah SOP yang selesai? |
| N33 | N | Perlu. Biro perlu melihat perkembangan, misalnya OPD mana yang sudah menyelesaikan SOP, berapa yang masih revisi, berapa yang sudah berlaku, atau mana OPD yang belum menindaklanjuti. Laporan seperti itu membantu monitoring dan evaluasi. |
| P34 | P | Selain laporan, apakah grafik monitoring evaluasi per OPD juga bermanfaat? |
| N34 | N | Bermanfaat. Kalau ada grafik, pimpinan bisa lebih cepat melihat kondisi umum. Misalnya OPD mana yang banyak SOP-nya, mana yang pengajuannya selesai, mana yang masih banyak revisi. Jadi tidak harus membaca daftar panjang terus. |
| P35 | P | Apakah proses administrasi persuratan seperti surat permohonan tetap perlu menggunakan sistem lain seperti Srikandi? |
| N35 | N | Iya, persuratan resmi tetap mengikuti mekanisme yang berlaku. Kalau saat ini menggunakan Srikandi, itu tetap berjalan. Sistem SOP ini fokusnya bukan mengganti seluruh persuratan, tetapi membantu pengelolaan data SOP, pengajuan, evaluasi, revisi, pengesahan, dan arsipnya. |
| P36 | P | Berarti sistem SOP yang dibangun tidak perlu menghilangkan semua proses lama, tetapi memperbaiki bagian yang bisa dibuat lebih tertib secara digital? |
| N36 | N | Betul. Tidak semua proses harus dihapus. Ada proses yang tetap perlu dilakukan manusia, misalnya evaluasi substansi, pembahasan, dan pengesahan oleh pejabat. Tapi pencatatan, status, dokumen, catatan revisi, dan arsip bisa dibuat lebih terpusat. Jadi prosesnya lebih rapi dan mudah ditelusuri. |
| P37 | P | Menurut Bapak, fitur apa yang paling penting kalau sistem ini dibangun tahap awal? |
| N37 | N | Yang paling penting itu penyusunan SOP yang formatnya seragam, pengajuan evaluasi, catatan revisi, status dokumen, arsip digital, dan riwayat perubahan. Kalau fitur itu berjalan, masalah utama proses manual sudah banyak terbantu. Setelah itu baru bisa ditambah laporan, notifikasi, atau integrasi lain. |
| P38 | P | Dari sisi keamanan, apakah sistem perlu membatasi akses setiap peran? |
| N38 | N | Harus. Dokumen SOP memang dokumen kerja, tapi proses evaluasi, revisi, dan tanda tangan tidak boleh semua orang bisa akses. Penyusun tidak boleh menilai, evaluator tidak boleh mengesahkan, pengunjung tidak boleh melihat catatan internal. Jadi hak akses harus jelas. |
| P39 | P | Apakah PIN untuk tanda tangan elektronik internal perlu diamankan? |
| N39 | N | Iya. Kalau pakai PIN untuk tanda tangan, PIN itu harus dianggap rahasia. Jangan disimpan terbuka. Sistem juga perlu memastikan yang menandatangani memang pengguna yang berwenang dan status dokumennya memang sudah sampai tahap tanda tangan. |
| P40 | P | Kalau sistem gagal saat proses tanda tangan atau pengesahan, apa yang perlu dijaga? |
| N40 | N | Jangan sampai status dokumen berubah sebagian. Misalnya tanda tangan gagal, tapi status sudah dianggap selesai. Itu bahaya. Sistem harus memastikan prosesnya konsisten. Kalau gagal, status tetap seperti semula dan pengguna dapat pesan yang jelas. |
| P41 | P | Apakah sistem perlu menghasilkan dokumen akhir SOP dalam format PDF? |
| N41 | N | Iya, PDF penting untuk dokumen akhir. Formatnya juga harus rapi dan seragam. Kalau data diisi lewat sistem, lalu sistem menghasilkan PDF sesuai format, itu akan mengurangi perbedaan format antar-OPD. |
| P42 | P | Apakah SOP juga perlu digambarkan dalam flowchart atau BPMN? |
| N42 | N | Untuk SOP AP, diagram alur itu penting. Flowchart diperlukan untuk menggambarkan prosedur secara jelas. Kalau sistem juga bisa mendukung pemodelan atau penyajian BPMN sesuai kebutuhan analisis, itu bagus, terutama untuk menggambarkan proses bisnis secara lebih sistematis. |
| P43 | P | Kalau dari sisi pengguna OPD, apa kendala yang mungkin muncul saat memakai sistem baru? |
| N43 | N | Biasanya adaptasi. Kalau sebelumnya terbiasa dengan dokumen Word atau hard copy, awalnya mungkin perlu pembiasaan mengisi lewat form. Karena itu tampilan harus jelas, validasinya membantu, dan alurnya jangan membingungkan. Kalau sistem terlalu rumit, OPD bisa kembali ke cara lama. |
| P44 | P | Apakah perlu dilakukan UAT kepada perwakilan pengguna? |
| N44 | N | Perlu. Karena yang memakai sistem bukan satu jenis pengguna saja. Ada Biro, evaluator, OPD, kepala OPD, dan mungkin pengunjung publik. Masing-masing punya kebutuhan berbeda, jadi perlu diuji apakah sistem sudah mudah dipakai dan sesuai alur kerja mereka. |
| P45 | P | Kalau Bapak rangkum, apa harapan utama terhadap sistem informasi pengelolaan SOP ini? |
| N45 | N | Harapannya sistem bisa membuat pengelolaan SOP lebih tertib. OPD bisa menyusun SOP dengan format yang lebih seragam, Biro bisa memeriksa dan memberi catatan dengan lebih jelas, revisi bisa ditelusuri, dokumen tidak mudah hilang, status proses bisa dipantau, dan SOP yang sudah berlaku bisa tersimpan sebagai arsip yang mudah dicari. Jadi bukan sekadar aplikasi penyimpanan dokumen, tapi membantu alur pengelolaan SOP dari awal sampai akhir. |

## V. Pemetaan Hasil Wawancara ke Kebutuhan Sistem

| Temuan wawancara | Kebutuhan fungsional terkait | Kebutuhan non-fungsional / batasan terkait |
| :--- | :--- | :--- |
| OPD perlu menyusun SOP dengan format seragam sesuai PermenPAN-RB Nomor 35 Tahun 2012. | Penyusunan dan Pengelolaan Draft SOP, Pengelolaan Peraturan OPD, Pengelolaan Data Pelaksana SOP | Sistem perlu mudah digunakan dan memiliki validasi data yang jelas. |
| PJ Penyusun dan Penyusun merupakan peran yang berbeda. | Pengelolaan Tim Penyusun SOP, Pengajuan Evaluasi SOP, Penyusunan Draft SOP | Role-Based Access Control wajib membedakan hak akses setiap aktor. |
| Biro perlu mengevaluasi SOP dan memberikan catatan revisi. | Penilaian Substansi SOP, Pengelolaan Catatan Evaluasi, Tindak Lanjut Hasil Evaluasi | Data evaluasi harus tersimpan konsisten dan dapat ditelusuri. |
| Revisi dapat terjadi berulang dan harus jelas status tindak lanjutnya. | Pengajuan Ulang SOP Revisi, Penelusuran Riwayat Perubahan SOP | Sistem perlu menjaga integritas status dan riwayat perubahan. |
| Arsip SOP lama sulit ditemukan dan sebagian masih hard copy. | Cetak dan Unduh Arsip Dokumen, Akses Arsip Publik SOP | Sistem perlu menyimpan data secara terpusat dan menyediakan pencarian arsip. |
| SOP yang berlaku, digantikan, dan dicabut harus dibedakan. | Pengesahan SOP, Pencabutan SOP, Akses Arsip Publik SOP | Sistem harus mencegah konflik versi dokumen dan menjaga konsistensi arsip. |
| Pengesahan internal perlu mengikuti urutan evaluasi dan tanda tangan berita acara. | Tanda Tangan Berita Acara Evaluasi, Pengesahan SOP, Pengelolaan PIN TTE | PIN TTE harus diamankan, status harus atomik, dan proses gagal tidak boleh mengubah data sebagian. |
| Biro membutuhkan monitoring perkembangan SOP per OPD. | Monitoring Grafik Evaluasi, laporan jumlah SOP selesai, daftar status pengajuan | Performa daftar dan grafik harus cukup cepat untuk banyak OPD dan banyak SOP. |
| Pengunjung hanya boleh melihat dokumen final yang sudah berlaku. | Akses Arsip Publik SOP, Verifikasi Pengesahan TTE, Verifikasi Tanda Tangan PDF | Data internal seperti catatan evaluasi dan audit log tidak boleh tampil di halaman publik. |

## VI. Daftar Pertanyaan Krusial untuk Validasi Lanjutan

Pertanyaan berikut dapat digunakan untuk wawancara lanjutan atau validasi kebutuhan agar rancangan sistem semakin kuat.

| No | Area | Pertanyaan krusial | Alasan penting |
| :---: | :--- | :--- | :--- |
| 1 | Proses bisnis | Apakah semua SOP wajib melalui evaluasi Biro sebelum disahkan oleh Kepala OPD? | Menentukan aturan status dan validasi sebelum pengesahan. |
| 2 | Proses bisnis | Apakah evaluasi bisa dimulai dari pengajuan OPD dan juga dari jadwal evaluasi Biro? | Menentukan apakah sistem perlu dua sumber pengajuan evaluasi. |
| 3 | Workflow | Kapan sebuah SOP dianggap menunggu pengajuan evaluasi? | Menentukan validasi kelengkapan dokumen sebelum pengajuan. |
| 4 | Workflow | Apakah satu pengajuan evaluasi boleh berisi lebih dari satu SOP? | Menentukan struktur data pengajuan dan nilai evaluasi. |
| 5 | Workflow | Apakah OPD boleh memiliki lebih dari satu pengajuan evaluasi aktif dalam waktu yang sama? | Menentukan constraint bisnis agar tidak terjadi tumpang tindih proses. |
| 6 | Revisi | Jika hanya satu SOP dalam satu pengajuan yang perlu revisi, apakah SOP lain tetap bisa lanjut? | Menentukan aturan evaluasi sebagian dan status tindak lanjut. |
| 7 | Revisi | Apakah evaluator harus memberi catatan wajib saat memilih hasil perlu perbaikan? | Menentukan validasi form evaluasi. |
| 8 | Versi | Bagaimana aturan ketika SOP berlaku dibuat versi baru? | Menentukan relasi versi, status digantikan, dan arsip lama. |
| 9 | Arsip | Siapa saja yang boleh melihat SOP lama, SOP digantikan, dan SOP dicabut? | Menentukan akses arsip internal dan publik. |
| 10 | TTE | Apakah tanda tangan elektronik internal cukup untuk kebutuhan administrasi sistem, atau perlu integrasi CA tersertifikasi di masa depan? | Menentukan batasan penelitian dan arah pengembangan lanjutan. |
| 11 | TTE | Siapa saja yang wajib menandatangani berita acara evaluasi? | Menentukan urutan status pengajuan evaluasi. |
| 12 | TTE | Apakah Kepala OPD harus mengesahkan semua SOP dalam satu pengajuan secara bersamaan? | Menentukan aturan transaksi pengesahan. |
| 13 | Keamanan | Apakah akun yang pindah OPD tetap perlu menyimpan riwayat pekerjaan sebelumnya? | Menentukan kebutuhan riwayat OPD pengguna dan integritas data historis. |
| 14 | Keamanan | Apakah pengunjung publik boleh mengunduh PDF atau hanya melihat pratinjau? | Menentukan batas akses arsip publik. |
| 15 | Notifikasi | Notifikasi apa yang paling dibutuhkan: revisi, deadline, tanda tangan, atau pengesahan selesai? | Menentukan prioritas pengembangan fitur notifikasi. |
| 16 | Deadline | Apakah batas waktu ditentukan per SOP, per pengajuan, atau per tahapan evaluasi? | Menentukan model data deadline dan reminder. |
| 17 | Laporan | Laporan apa yang wajib tersedia untuk Biro: bulanan, tahunan, per OPD, atau per status? | Menentukan kebutuhan dashboard dan ekspor laporan. |
| 18 | UAT | Aktor mana saja yang harus menjadi responden UAT? | Menentukan validasi penerimaan sistem berdasarkan peran pengguna. |
| 19 | Integrasi | Apakah sistem perlu terhubung dengan Srikandi atau cukup mencatat referensi surat? | Menentukan batas integrasi dengan sistem eksternal. |
| 20 | Operasional | Siapa admin yang bertanggung jawab jika ada perubahan data OPD, Kepala OPD, atau PJ Penyusun? | Menentukan role pengelola master data dan prosedur operasional sistem. |

## VII. Kesimpulan Wawancara

Berdasarkan hasil wawancara, proses pengelolaan SOP AP pada Biro Organisasi Sekretariat Daerah Provinsi Sumatera Barat masih menghadapi kendala utama pada standardisasi dokumen, koordinasi revisi, pencatatan status, keterbatasan arsip, dan keterlacakan perubahan. Proses manual masih memungkinkan komunikasi langsung antara OPD dan Biro Organisasi, tetapi belum cukup mendukung kebutuhan pengelolaan dokumen lintas 52 OPD secara terpusat, konsisten, dan mudah dipantau.

Sistem informasi berbasis web diperlukan untuk mendukung penyusunan SOP yang terstruktur, pengajuan evaluasi, pemberian catatan perbaikan, pengajuan ulang hasil revisi, tanda tangan elektronik internal, pengesahan SOP, pengelolaan versi, serta arsip SOP digital. Sistem yang diusulkan tidak menggantikan seluruh proses administratif yang sudah berjalan, tetapi memperbaiki bagian yang dapat diintegrasikan, disederhanakan, dan didokumentasikan melalui sistem agar siklus pengelolaan SOP menjadi lebih efektif, tertib, dan dapat ditelusuri.
