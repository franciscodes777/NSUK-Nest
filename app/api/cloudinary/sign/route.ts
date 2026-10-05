
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
const session = await auth();

if (!session?.user) {
return NextResponse.json(
{ error: "Unauthorized" },
{ status: 401 }
);
}

let uploadType = "property";

try {
const bodyText = await request.text();

if (bodyText) {
  const body = JSON.parse(bodyText);

  if (body?.type === "profile") {
    uploadType = "profile";
  }
}


} catch {
uploadType = "property";
}

const timestamp = Math.round(Date.now() / 1000);

let folder = "nsuk-nest/properties";

if (uploadType === "profile") {
if (
session.user.role !== "student" &&
session.user.role !== "agent"
) {
return NextResponse.json(
{ error: "Only students and agents can upload profile photos" },
{ status: 403 }
);
}


folder = "nsuk-nest/profiles";


} else {
if (session.user.role !== "agent") {
return NextResponse.json(
{ error: "Only agents can upload property media" },
{ status: 403 }
);
}
}

const signature = cloudinary.utils.api_sign_request(
{
timestamp,
folder,
},
process.env.CLOUDINARY_API_SECRET!
);

return NextResponse.json({
timestamp,
signature,
folder,
cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
});
}
