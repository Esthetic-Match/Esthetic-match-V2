"use client";

import {
  Stethoscope,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import LumiCarousel from "./LumiCarousel";
import LumiDoctorCard from "./LumiDoctorCard";
import LumiProcedureCard from "./LumiProcedureCard";

import type {
  LumiRecommendResponse,
} from "./types";

type Props = {
  response:
    LumiRecommendResponse;
};

export default function LumiAssistantResponse({
  response,
}: Props) {
  const t = useTranslations(
    "lumi.LumiAssistantResponse",
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
          src="/images/lumi.png"
          alt="Lumi"
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
              <div className="relative h-5 w-5 overflow-hidden rounded-full">
                <Image
                  src="/images/lumi.png"
                  alt="Lumi"
                  fill
                  className="object-cover"
                  sizes="20px"
                />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#D8BD8D]">
                Lumi
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

            <LumiCarousel>
              {response.procedures.map(
                (
                  procedure,
                ) => (
                  <LumiProcedureCard
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
            </LumiCarousel>
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

            <LumiCarousel>
              {response.doctors.map(
                (
                  doctor,
                ) => (
                  <LumiDoctorCard
                    key={
                      doctor.doctorProfileId
                    }
                    doctor={
                      doctor
                    }
                  />
                ),
              )}
            </LumiCarousel>
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