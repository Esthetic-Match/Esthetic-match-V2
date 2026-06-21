// app/admin/catalogue/page.tsx
import CatalogueAdmin from "@/components/dashboard/admin/CatalogueAdmin";
import { DoctorCatalog } from "@/lib/doctorCatalogue";
import { SPECIALTY_CATEGORY_MAP } from "@/lib/specialtyCategoryMap";

// Load your existing translation files however you serve them
import specialitiesName    from "@/messages/en/specialitiesName.json";
import categoriesName      from "@/messages/en/categoriesName.json";
import subcategoriesName   from "@/messages/en/subcategoriesName.json";
import proceduresName      from "@/messages/en/proceduresName.json";
import specialitiesName_fr from "@/messages/fr/specialitiesName.json";
import categoriesName_fr      from "@/messages/fr/categoriesName.json";
import subcategoriesName_fr   from "@/messages/fr/subcategoriesName.json";
import proceduresName_fr      from "@/messages/fr/proceduresName.json";


export default function CatalogueAdminManager() {
  return (
    <CatalogueAdmin
      initialCatalog={JSON.parse(JSON.stringify(DoctorCatalog))}         
      initialSpecialtyMap={JSON.parse(JSON.stringify(SPECIALTY_CATEGORY_MAP))}  
      initialTranslations={{
        specialitiesName,
        categoriesName,
        subcategoriesName,
        proceduresName,
        specialitiesName_fr,
        categoriesName_fr,
        subcategoriesName_fr,
        proceduresName_fr,
      }}
    />
  );
}