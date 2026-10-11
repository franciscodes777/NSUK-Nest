import { NextResponse } from "next/server";
import { createBooking } from "@/app/actions/booking";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Please sign in to continue." },
        { status: 401 }
      );
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can create bookings." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as
      | { propertyId?: string }
      | null;

    const propertyId = body?.propertyId?.trim();

    if (!propertyId) {
      return NextResponse.json(
        { error: "A property ID is required." },
        { status: 400 }
      );
    }

    const result = await createBooking(propertyId);

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    console.error("Create booking API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create your booking.",
      },
      { status: 500 }
    );
  }
}