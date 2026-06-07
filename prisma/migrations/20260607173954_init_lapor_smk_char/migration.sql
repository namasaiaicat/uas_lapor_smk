-- CreateTable
CREATE TABLE `kategori` (
    `id_kategori` CHAR(5) NOT NULL,
    `nama_kategori` VARCHAR(30) NOT NULL,
    `deskripsi` VARCHAR(255) NULL,
    `is_deleted` TINYINT NOT NULL DEFAULT 0,

    PRIMARY KEY (`id_kategori`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id_user` CHAR(6) NOT NULL,
    `nis_nip` VARCHAR(6) NOT NULL,
    `nama_lengkap` VARCHAR(30) NOT NULL,
    `username` VARCHAR(12) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'siswa') NOT NULL,
    `is_deleted` TINYINT NOT NULL DEFAULT 0,

    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengaduan` (
    `id_pengaduan` CHAR(10) NOT NULL,
    `tgl_kejadian` DATE NOT NULL,
    `id_user` CHAR(6) NOT NULL,
    `id_kategori` CHAR(5) NOT NULL,
    `judul_laporan` VARCHAR(30) NOT NULL,
    `isi_laporan` TEXT NOT NULL,
    `status` ENUM('Pending', 'Proses', 'Ditolak', 'Selesai') NOT NULL DEFAULT 'Pending',
    `is_deleted` TINYINT NOT NULL DEFAULT 0,

    INDEX `pengaduan_id_user_idx`(`id_user`),
    INDEX `pengaduan_id_kategori_idx`(`id_kategori`),
    PRIMARY KEY (`id_pengaduan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_status_pengaduan` (
    `id_log` CHAR(10) NOT NULL,
    `id_pengaduan` CHAR(10) NOT NULL,
    `status_lama` VARCHAR(10) NULL,
    `status_baru` VARCHAR(10) NULL,
    `tgl_perubahan` DATETIME(0) NOT NULL,

    INDEX `log_status_pengaduan_id_pengaduan_idx`(`id_pengaduan`),
    PRIMARY KEY (`id_log`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pengaduan` ADD CONSTRAINT `pengaduan_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengaduan` ADD CONSTRAINT `pengaduan_id_kategori_fkey` FOREIGN KEY (`id_kategori`) REFERENCES `kategori`(`id_kategori`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_status_pengaduan` ADD CONSTRAINT `log_status_pengaduan_id_pengaduan_fkey` FOREIGN KEY (`id_pengaduan`) REFERENCES `pengaduan`(`id_pengaduan`) ON DELETE CASCADE ON UPDATE CASCADE;
