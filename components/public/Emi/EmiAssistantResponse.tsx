"use client";

import {
  Stethoscope,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import EmiCarousel from "./EmiCarousel";
import EmiDoctorCard from "./EmiDoctorCard";
import EmiProcedureCard from "./EmiProcedureCard";

import type {
  EmiRecommendResponse,
} from "./types";

type Props = {
  response:
    EmiRecommendResponse;
};

export default function EmiAssistantResponse({
  response,
}: Props) {
  const t = useTranslations(
    "Emi.EmiAssistantResponse",
  );

  const insightMap =
    new Map(
      (
        response.procedureInsights ??
        []
      ).map(
        (insight) => [
          insight.procedureId,
          insight.description,
        ],
      ),
    );

  return (
    <div className="flex items-start gap-3">
      <div className="relative hidden h-9 w-9 shrink-0 overflow-hidden rounded-full shadow-sm sm:block">
        <Image
          src="/images/Emi.png"
          alt="Emi"
          fill
          className="object-cover"
          sizes="36px"
        />
      </div>

      <div className="min-w-0 flex-1">
        {/* AI RESPONSE */}
        {response.answer && (
          <div className="rounded-[1.6rem] rounded-tl-md border border-[#283C5D]/8 bg-white px-5 py-5 shadow-sm sm:px-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#D8BD8D]">
                EMi
              </span>
            </div>

            <div className="whitespace-pre-wrap text-[15px] leading-7 text-[#283C5D]">
              {response.answer}
            </div>
          </div>
        )}

        {/* PROCEDURES */}
        {response.procedures.length >
          0 && (
          <section className="mt-7">
            <div className="mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#D8BD8D]">
                {t(
                  "treatmentsLabel",
                )}
              </p>

              <h2 className="mt-1 text-lg font-semibold text-[#061A2D]">
                {t(
                  "proceduresTitle",
                )}
              </h2>
            </div>

            <EmiCarousel>
              {response.procedures.map(
                (
                  procedure,
                ) => (
                  <EmiProcedureCard
                    key={
                      procedure.procedureId
                    }
                    procedure={
                      procedure
                    }
                    aiDescription={
                      insightMap.get(
                        procedure.procedureId,
                      ) ??
                      null
                    }
                  />
                ),
              )}
            </EmiCarousel>
          </section>
        )}

        {/* DOCTORS */}
        {response.doctors.length >
          0 && (
          <section className="mt-8">
            <div className="mb-3">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#D8BD8D]">
                <Stethoscope
                  size={13}
                />

                {t(
                  "doctorsLabel",
                )}
              </p>

              <h2 className="mt-1 text-lg font-semibold text-[#061A2D]">
                {t(
                  "doctorsTitle",
                )}
              </h2>
            </div>

            <EmiCarousel>
              {response.doctors.map(
                (
                  doctor,
                ) => (
                  <EmiDoctorCard
                    key={
                      doctor.doctorProfileId
                    }
                    doctor={
                      doctor
                    }
                  />
                ),
              )}
            </EmiCarousel>
          </section>
        )}

        {response.doctors.length ===
          0 && (
          <div className="mt-7 rounded-[1.4rem] border border-[#283C5D]/10 bg-white p-4 text-sm leading-6 text-[#283C5D]/60">
            {t(
              "noDoctors",
            )}
          </div>
        )}

        {response.warning && (
          <p className="mt-4 text-xs text-[#283C5D]/45">
            {response.warning}
          </p>
        )}
      </div>
    </div>
  );
}