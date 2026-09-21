export default function AccomodationCard({
  name,
  location,
  price
}: {
  name: string
  location: string
  price: string
}) {
    return(
        <div className="bg-white rounded-xl shadow-md p-6 max-w-sm">
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="text-gray-500 mt-2">{location}Behind NSUK main gate</p>
            <p className="font-semibold mt-4">{price} per year</p>
            <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg">View details</button>
        </div>
    )
}