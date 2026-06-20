-- CreateIndex
CREATE INDEX "doctor_profile_city_idx" ON "doctor_profile"("city");

-- CreateIndex
CREATE INDEX "doctor_profile_country_city_idx" ON "doctor_profile"("country", "city");

-- CreateIndex
CREATE INDEX "doctor_profile_workLatitude_workLongitude_idx" ON "doctor_profile"("workLatitude", "workLongitude");
