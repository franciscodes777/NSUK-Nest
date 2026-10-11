import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { paylukRequest, syncBookingFromEscrow } from "@/lib/payluk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BookingData = {
  studentId?: string;
  studentEmail?: string;
  paylukPaymentToken?: string;
};

type PaylukEscrow = {
  id?: string;
  paymentToken?: string;
  status?: string;
  state?: string;
  paidAt?: string | number | null;
  paymentDetails?: {
    status?: string;
    reference?: string;
  } | null;
};

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Please sign in to verify your booking." },
        { status: 401 }
      );
    }

    if (session.user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can verify their bookings." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as
      | { bookingId?: string }
      | null;

    const bookingId = body?.bookingId?.trim();

    if (!bookingId) {
      return NextResponse.json(
        { error: "A booking ID is required." },
        { status: 400 }
      );
    }

    const bookingRef = adminDb.collection("bookings").doc(bookingId);
    const bookingSnapshot = await bookingRef.get();

    if (!bookingSnapshot.exists) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    const booking = bookingSnapshot.data() as BookingData;

    if (
      booking.studentEmail?.toLowerCase() !==
        session.user.email.toLowerCase() ||
      !booking.paylukPaymentToken
    ) {
      return NextResponse.json(
        { error: "You cannot verify this booking." },
        { status: 403 }
      );
    }

    const escrow = await paylukRequest<PaylukEscrow>(
      `/v1/escrow/verify/${encodeURIComponent(
        booking.paylukPaymentToken
      )}`
    );

    const status = await syncBookingFromEscrow(bookingRef, escrow);

    return NextResponse.json({
      ...status,
      paylukStatus: escrow.status || "UNKNOWN",
      paylukState: escrow.state || "UNKNOWN",
    });
  } catch (error: unknown) {
    console.error("Payluk booking verification error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not verify the payment with Payluk.",
      },
      { status: 502 }
    );
  }
}