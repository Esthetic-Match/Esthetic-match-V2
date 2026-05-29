import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        avatar: true,
      
        specialtyIds: true,
      
        city: true,
        country: true,
      
        yearsOfExperience: true,
      
        inClinicPrice: true,
        onlineConsulPrice: true,
        currency: true,
      
        googleRating: true,
        googleReviewCount: true,
      
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });
  
    const formattedDoctors = doctors.map((doctor) => ({
      id: doctor.id,
    
      name: doctor.user.name ?? "Doctor",
    
      specialtyIds: doctor.specialtyIds,
    
      city: doctor.city,
      country: doctor.country,
    
      googleRating: doctor.googleRating,
      googleReviewCount: doctor.googleReviewCount,
    
      yearsOfExperience: doctor.yearsOfExperience,
    
      inClinicPrice: doctor.inClinicPrice,
      onlineConsulPrice: doctor.onlineConsulPrice,
    
      currency: doctor.currency,
    
      avatar:
        doctor.avatar ??
        doctor.user.image ??
        "/images/default-doctor.png",
    }));

    return NextResponse.json(formattedDoctors);
  } catch (error) {
    console.error("Failed to fetch recent doctor profiles:", error);

    return NextResponse.json(
      { error: "Failed to fetch recent doctor profiles" },
      { status: 500 }
    );
  }
}