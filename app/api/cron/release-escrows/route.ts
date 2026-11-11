import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { releaseOverdueEscrows } from "@/lib/escrow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Scheduled job: release held payments whose inspection period
 * has ended without the student confirming or disputing.
 *
 * Call with header:  Authorization: Bearer <CRON_SECRET>
 * Vercel Cron sends this header automatically when CRON_SECRET
 * is set. Any other scheduler (e.g. cron-job.org) can call it
 * the same way.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret) {
    return false;
  }

  const header = request.headers.get("authorization") || "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    console.error("CRON_SECRET is not configured.");

    return NextResponse.json(
      { error: "Cron is not configured." },
      { status: 500 }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await releaseOverdueEscrows();

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Cron] Escrow auto-release failed:", error);

    return NextResponse.json(
      { error: "Auto-release failed." },
      { status: 500 }
    );
  }
}
