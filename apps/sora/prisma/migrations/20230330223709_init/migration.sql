-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Candidate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `counter` INTEGER NOT NULL DEFAULT 0,
    `name` VARCHAR(191) NOT NULL,
    `img` VARCHAR(50) NOT NULL,
    `lastChoosedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Candidate_name_key`(`name`),
    UNIQUE INDEX `Candidate_img_key`(`img`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Participant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `qrId` VARCHAR(30) NOT NULL,
    `alreadyAttended` BOOLEAN NOT NULL DEFAULT false,
    `attendedAt` DATETIME(3) NULL,
    `alreadyChoosing` BOOLEAN NOT NULL DEFAULT false,
    `choosingAt` DATETIME(3) NULL,

    UNIQUE INDEX `Participant_name_key`(`name`),
    UNIQUE INDEX `Participant_qrId_key`(`qrId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
