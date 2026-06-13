// app/api/doctor-cases/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { doctorId, patientId, procedureId, title } = await req.json();

    if (!doctorId) {
      return NextResponse.json(
        { error: "Missing doctorId" },
        { status: 400 }
      );
    }

    const createdCase = await prisma.beforeAfterCase.create({
      data: {
        doctorId,
        patientId: patientId || null,
        procedure: procedureId || null,
        title: title || null,
      },
    });

    return NextResponse.json(createdCase);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    if (!doctorId) {
      return NextResponse.json(
        { error: "Missing doctorId" },
        { status: 400 }
      );
    }

    const cases = await prisma.beforeAfterCase.findMany({
      where: {
        doctorId,
        beforeImage: {
          not: null,
        },
        afterImage: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    return NextResponse.json(cases);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}