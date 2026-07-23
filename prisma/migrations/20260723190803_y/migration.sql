-- CreateTable
CREATE TABLE "catalog_locale" (
    "code" VARCHAR(35) NOT NULL,
    "displayName" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_locale_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "specialty_group" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialty_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialty_group_translation" (
    "specialtyGroupId" TEXT NOT NULL,
    "localeCode" VARCHAR(35) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "specialty_group_translation_pkey" PRIMARY KEY ("specialtyGroupId","localeCode")
);

-- CreateTable
CREATE TABLE "specialty" (
    "id" TEXT NOT NULL,
    "specialtyGroupId" TEXT NOT NULL,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialty_translation" (
    "specialtyId" TEXT NOT NULL,
    "localeCode" VARCHAR(35) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "specialty_translation_pkey" PRIMARY KEY ("specialtyId","localeCode")
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "href" TEXT,
    "homeImage" TEXT,
    "dashboardImage" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_translation" (
    "categoryId" TEXT NOT NULL,
    "localeCode" VARCHAR(35) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "category_translation_pkey" PRIMARY KEY ("categoryId","localeCode")
);

-- CreateTable
CREATE TABLE "specialty_category" (
    "specialtyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialty_category_pkey" PRIMARY KEY ("specialtyId","categoryId")
);

-- CreateTable
CREATE TABLE "subcategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategory_translation" (
    "subcategoryId" TEXT NOT NULL,
    "localeCode" VARCHAR(35) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "subcategory_translation_pkey" PRIMARY KEY ("subcategoryId","localeCode")
);

-- CreateTable
CREATE TABLE "procedure" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_translation" (
    "procedureId" TEXT NOT NULL,
    "localeCode" VARCHAR(35) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "procedure_translation_pkey" PRIMARY KEY ("procedureId","localeCode")
);

-- CreateTable
CREATE TABLE "procedure_subcategory" (
    "procedureId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_subcategory_pkey" PRIMARY KEY ("subcategoryId","procedureId")
);

-- CreateTable
CREATE TABLE "doctor_specialty" (
    "doctorProfileId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_specialty_pkey" PRIMARY KEY ("doctorProfileId","specialtyId")
);

-- CreateTable
CREATE TABLE "doctor_subcategory" (
    "doctorProfileId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_subcategory_pkey" PRIMARY KEY ("doctorProfileId","subcategoryId")
);

-- CreateTable
CREATE TABLE "doctor_procedure" (
    "doctorProfileId" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "topRank" INTEGER,
    "price" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_procedure_pkey" PRIMARY KEY ("doctorProfileId","procedureId")
);

-- CreateIndex
CREATE INDEX "catalog_locale_isActive_sortOrder_idx" ON "catalog_locale"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "specialty_group_isActive_sortOrder_idx" ON "specialty_group"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "specialty_group_translation_localeCode_name_idx" ON "specialty_group_translation"("localeCode", "name");

-- CreateIndex
CREATE INDEX "specialty_specialtyGroupId_sortOrder_idx" ON "specialty"("specialtyGroupId", "sortOrder");

-- CreateIndex
CREATE INDEX "specialty_isActive_sortOrder_idx" ON "specialty"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "specialty_translation_localeCode_name_idx" ON "specialty_translation"("localeCode", "name");

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");

-- CreateIndex
CREATE INDEX "category_isActive_sortOrder_idx" ON "category"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "category_translation_localeCode_name_idx" ON "category_translation"("localeCode", "name");

-- CreateIndex
CREATE INDEX "specialty_category_categoryId_specialtyId_idx" ON "specialty_category"("categoryId", "specialtyId");

-- CreateIndex
CREATE INDEX "specialty_category_specialtyId_isActive_sortOrder_idx" ON "specialty_category"("specialtyId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "subcategory_categoryId_sortOrder_idx" ON "subcategory"("categoryId", "sortOrder");

-- CreateIndex
CREATE INDEX "subcategory_isActive_sortOrder_idx" ON "subcategory"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "subcategory_translation_localeCode_name_idx" ON "subcategory_translation"("localeCode", "name");

-- CreateIndex
CREATE INDEX "procedure_isActive_idx" ON "procedure"("isActive");

-- CreateIndex
CREATE INDEX "procedure_translation_localeCode_name_idx" ON "procedure_translation"("localeCode", "name");

-- CreateIndex
CREATE INDEX "procedure_subcategory_procedureId_subcategoryId_idx" ON "procedure_subcategory"("procedureId", "subcategoryId");

-- CreateIndex
CREATE INDEX "procedure_subcategory_subcategoryId_isActive_sortOrder_idx" ON "procedure_subcategory"("subcategoryId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "doctor_specialty_specialtyId_doctorProfileId_idx" ON "doctor_specialty"("specialtyId", "doctorProfileId");

-- CreateIndex
CREATE INDEX "doctor_specialty_doctorProfileId_position_idx" ON "doctor_specialty"("doctorProfileId", "position");

-- CreateIndex
CREATE INDEX "doctor_subcategory_subcategoryId_doctorProfileId_idx" ON "doctor_subcategory"("subcategoryId", "doctorProfileId");

-- CreateIndex
CREATE INDEX "doctor_subcategory_doctorProfileId_position_idx" ON "doctor_subcategory"("doctorProfileId", "position");

-- CreateIndex
CREATE INDEX "doctor_procedure_procedureId_doctorProfileId_idx" ON "doctor_procedure"("procedureId", "doctorProfileId");

-- CreateIndex
CREATE INDEX "doctor_procedure_doctorProfileId_position_idx" ON "doctor_procedure"("doctorProfileId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_procedure_doctorProfileId_topRank_key" ON "doctor_procedure"("doctorProfileId", "topRank");

-- AddForeignKey
ALTER TABLE "specialty_group_translation" ADD CONSTRAINT "specialty_group_translation_specialtyGroupId_fkey" FOREIGN KEY ("specialtyGroupId") REFERENCES "specialty_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialty_group_translation" ADD CONSTRAINT "specialty_group_translation_localeCode_fkey" FOREIGN KEY ("localeCode") REFERENCES "catalog_locale"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialty" ADD CONSTRAINT "specialty_specialtyGroupId_fkey" FOREIGN KEY ("specialtyGroupId") REFERENCES "specialty_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialty_translation" ADD CONSTRAINT "specialty_translation_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialty_translation" ADD CONSTRAINT "specialty_translation_localeCode_fkey" FOREIGN KEY ("localeCode") REFERENCES "catalog_locale"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translation" ADD CONSTRAINT "category_translation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translation" ADD CONSTRAINT "category_translation_localeCode_fkey" FOREIGN KEY ("localeCode") REFERENCES "catalog_locale"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialty_category" ADD CONSTRAINT "specialty_category_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialty_category" ADD CONSTRAINT "specialty_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategory" ADD CONSTRAINT "subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategory_translation" ADD CONSTRAINT "subcategory_translation_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategory_translation" ADD CONSTRAINT "subcategory_translation_localeCode_fkey" FOREIGN KEY ("localeCode") REFERENCES "catalog_locale"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_translation" ADD CONSTRAINT "procedure_translation_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_translation" ADD CONSTRAINT "procedure_translation_localeCode_fkey" FOREIGN KEY ("localeCode") REFERENCES "catalog_locale"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_subcategory" ADD CONSTRAINT "procedure_subcategory_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_subcategory" ADD CONSTRAINT "procedure_subcategory_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialty" ADD CONSTRAINT "doctor_specialty_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialty" ADD CONSTRAINT "doctor_specialty_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_subcategory" ADD CONSTRAINT "doctor_subcategory_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_subcategory" ADD CONSTRAINT "doctor_subcategory_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_procedure" ADD CONSTRAINT "doctor_procedure_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_procedure" ADD CONSTRAINT "doctor_procedure_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
