import Link from "next/link";
const accommodations = [ 
  { 
    id: "1", 
    name: "Princess Sarah Lodge", 
    type: "Self Contain", 
    location: "Keffi, Nasarawa State", 
    price: "₦300,000", 
    image: "/Nsuknesthero1.jpg", 
  }, 
  { 
    id: "2", 
    name: "NSUK View Lodge", 
    type: "1 Bedroom", 
    location: "Keffi, Nasarawa State", 
    price: "₦450,000", 
    image: "/Nsuknesthero1.jpg", 
  }, 
  { 
    id: "3", 
    name: "Campus Gardens", 
    type: "2 Bedroom", 
    location: "Keffi, Nasarawa State", 
    price: "₦650,000", 
    image: "/Nsuknesthero1.jpg", 
  },
 ];
export default function Accommodation() { return ( <main className="min-h-screen bg-gray-50 px-6 py-12"> <div className="mx-auto max-w-7xl">
    <div className="mb-10">
      <h1 className="text-4xl font-bold text-gray-900">
        Find Your Accommodation
      </h1>

      <p className="mt-2 text-gray-600">
        Discover accommodation options around NSUK.
      </p>
    </div>

    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {accommodations.map((accommodation) => (
        <div
          key={accommodation.id}
          className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
        >
          
          {/* Image */}
          <div className="h-56 overflow-hidden">
            <img
              src={accommodation.image}
              alt={accommodation.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-5">
            <h2 className="text-xl font-semibold text-gray-900">
              {accommodation.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {accommodation.type}
            </p>

            <p className="mt-2 text-sm text-gray-600">
              📍 {accommodation.location}
            </p>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-green-600">
                  {accommodation.price}
                </p>

                <p className="text-xs text-gray-500">
                  per year
                </p>
              </div>

              <Link
                href={`/accommodation/${accommodation.id}`}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
              >
                View Details
              </Link>
            </div>
          </div>

        </div>
      ))}
    </div>

  </div>
</main>
); }