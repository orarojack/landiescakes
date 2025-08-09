-- AlterTable
ALTER TABLE `orders` ADD COLUMN `customerEmail` VARCHAR(191) NULL,
    ADD COLUMN `customerName` VARCHAR(191) NULL,
    ADD COLUMN `mpesaCheckoutRequestId` VARCHAR(191) NULL,
    ADD COLUMN `mpesaMerchantRequestId` VARCHAR(191) NULL,
    ADD COLUMN `mpesaPaymentTimestamp` DATETIME(3) NULL,
    ADD COLUMN `mpesaPhoneNumber` VARCHAR(191) NULL,
    ADD COLUMN `mpesaTransactionId` VARCHAR(191) NULL;
