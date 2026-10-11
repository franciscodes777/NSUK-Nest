"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
propertyId: string;
className?: string;
style?: React.CSSProperties;
};

export default function BookAccommodationButton({
propertyId,
className,
style,
}: Props) {
const router = useRouter();
const [loading, setLoading] = useState(false);

function handleBooking() {
if (!propertyId || loading) return;


setLoading(true);
router.push(`/dashboard/student/booking/${encodeURIComponent(propertyId)}`);


}

return (
<button
type="button"
onClick={handleBooking}
disabled={loading}
className={`${className || ""} disabled:cursor-not-allowed disabled:opacity-60`}
style={style}
>
{loading ? "Opening Booking..." : "Book Accommodation"} </button>
);
}
