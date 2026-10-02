import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import PropertyMediaUpload from "@/components/PropertyMediaUpload"
import {
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBed,
  FaBath,
  FaTint,
  FaBolt,
  FaShieldAlt,
  FaCar,
  FaWifi,
  FaWater,
  FaCouch,
  FaUtensils,
  FaDoorOpen,
  FaHome,
} from "react-icons/fa"

async function createProperty(formData: FormData) {
  "use server"

  try {
    const session = await auth()

    if (!session?.user) {
      redirect("/login")
    }

    if (session.user.role !== "agent") {
      redirect("/dashboard/student")
    }

    const propertyName = String(
      formData.get("propertyName") ?? ""
    ).trim()

    const location = String(
      formData.get("location") ?? ""
    ).trim()

    const propertyType = String(
      formData.get("propertyType") ?? ""
    )

    const address = String(
      formData.get("address") ?? ""
    ).trim()

    const description = String(
      formData.get("description") ?? ""
    ).trim()

    const price = Number(formData.get("price"))

    const images = [
      String(formData.get("image1") ?? ""),
      String(formData.get("image2") ?? ""),
      String(formData.get("image3") ?? ""),
      String(formData.get("image4") ?? ""),
      String(formData.get("image5") ?? ""),
    ]

    const video = String(
      formData.get("video") ?? ""
    )

    console.log("PROPERTY DATA:", {
      propertyName,
      location,
      propertyType,
      price,
      images,
      video,
    })

    if (
      !propertyName ||
      !location ||
      !propertyType ||
      !address ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      console.log("VALIDATION FAILED")
      return
    }

    if (images.some((image) => !image) || !video) {
      console.log("MEDIA MISSING:", {
        images,
        video,
      })

      return
    }

    const userSnapshot = await adminDb
      .collection("users")
      .where("email", "==", session.user.email)
      .limit(1)
      .get()

    if (userSnapshot.empty) {
      console.log("AGENT NOT FOUND")
      return
    }

    const agentDoc = userSnapshot.docs[0]

    await adminDb.collection("properties").add({
      name: propertyName,
      location,
      type: propertyType,
      price,
      address,
      description,

      features: {
        bedroom: formData.get("bedroom") === "on",
        bathroom: formData.get("bathroom") === "on",

        water: formData.get("water") === "on",
        electricity:
          formData.get("electricity") === "on",

        security:
          formData.get("security") === "on",

        parking:
          formData.get("parking") === "on",

        internet:
          formData.get("internet") === "on",

        borehole:
          formData.get("borehole") === "on",

        furnished:
          formData.get("furnished") === "on",

        kitchen:
          formData.get("kitchen") === "on",

        wardrobe:
          formData.get("wardrobe") === "on",

        balcony:
          formData.get("balcony") === "on",
      },

      agentId: agentDoc.id,
      agentName: session.user.name || "",
      agentEmail: session.user.email || "",
      agentImage: session.user.image || "",

      status: "pending",

      images,
      video,

      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("PROPERTY CREATED SUCCESSFULLY")

    revalidatePath("/dashboard/agent")
    revalidatePath("/dashboard/agent/properties")

    redirect("/dashboard/agent")
  } catch (error) {
    console.error("CREATE PROPERTY ERROR:", error)
    throw error
  }
}

export default function AddPropertyPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* TOP BAR */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center px-6 lg:px-10">
        <div className="flex items-center gap-4">

          <Link
            href="/dashboard/agent"
            className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
          >
            <FaArrowLeft />
          </Link>

          <div>
            <p className="text-sm text-slate-500">
              Agent / Owner Dashboard
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Add Property
            </h1>
          </div>

        </div>
      </header>

      {/* CONTENT */}
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Create a new listing
          </h2>

          <p className="text-slate-500 mt-1">
            Add the details students need to know about your accommodation.
          </p>
        </div>

        <form action={createProperty} className="space-y-6">

          {/* BASIC INFORMATION */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-lg bg-[#075e3b]/10 flex items-center justify-center text-[#075e3b]">
                <FaBuilding />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Basic Information
                </h3>

                <p className="text-sm text-slate-500">
                  Tell students about the property.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* PROPERTY NAME */}
              <div className="md:col-span-2">

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Property Name
                </label>

                <input
                  type="text"
                  name="propertyName"
                  placeholder="e.g. Princess Sarah Lodge"
                  required
                  className="w-full text-black border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-[#075e3b]"
                />

              </div>

              {/* LOCATION */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Location
                </label>

                <div className="relative">

                  <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#075e3b]" />

                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Keffi"
                    required
                    className="w-full border text-black border-slate-300 rounded-lg pl-11 pr-4 py-3 outline-none focus:border-[#075e3b]"
                  />

                </div>

              </div>

              {/* PROPERTY TYPE */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Property Type
                </label>

                <select
                  name="propertyType"
                  required
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-[#075e3b] bg-white"
                >
                  <option value="">
                    Select type
                  </option>

                  <option value="self-contain">
                    Self Contain
                  </option>

                  <option value="1-bedroom">
                    1 Bedroom
                  </option>

                  <option value="2-bedroom">
                    2 Bedroom
                  </option>

                  <option value="3-bedroom">
                    3 Bedroom
                  </option>

                  <option value="4-bedroom">
                    4 Bedroom
                  </option>
                </select>

              </div>

              {/* PRICE */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Annual Rent
                </label>

                <div className="relative">

                  <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-[#075e3b]" />

                  <input
                    type="number"
                    name="price"
                    placeholder="300000"
                    required
                    className="w-full border border-slate-300 rounded-lg pl-11 pr-4 py-3 outline-none focus:border-[#075e3b]"
                  />

                </div>

              </div>

              {/* ADDRESS */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Address
                </label>

                <input
                  type="text"
                  name="address"
                  placeholder="Enter property address"
                  required
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-[#075e3b]"
                />

              </div>

            </div>
          </section>

          {/* FEATURES */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6">

            <h3 className="font-bold text-slate-900">
              Property Features
            </h3>

            <p className="text-sm text-slate-500 mt-1 mb-6">
              Add the facilities available in the property.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* BEDROOM */}
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#075e3b] transition">
                <input
                  type="checkbox"
                  name="bedroom"
                />

                <FaBed className="text-[#075e3b]" />

                <span className="text-sm font-medium text-slate-700">
                  Bedroom
                </span>
              </label>

              {/* BATHROOM */}
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#075e3b] transition">
                <input
                  type="checkbox"
                  name="bathroom"
                />

                <FaBath className="text-[#075e3b]" />

                <span className="text-sm font-medium text-slate-700">
                  Bathroom
                </span>
              </label>

              {/* WATER */}
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#075e3b] transition">
                <input
                  type="checkbox"
                  name="water"
                />

                <FaTint className="text-[#075e3b]" />

                <span className="text-sm font-medium text-slate-700">
                  Water
                </span>
              </label>

              {/* ELECTRICITY */}
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#075e3b] transition">
                <input
                  type="checkbox"
                  name="electricity"
                />

                <FaBolt className="text-[#075e3b]" />

                <span className="text-sm font-medium text-slate-700">
                  Electricity
                </span>
              </label>

              {/* SECURITY */}
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#075e3b] transition">
                <input
                  type="checkbox"
                  name="security"
                />

                <FaShieldAlt className="text-[#075e3b]" />

                <span className="text-sm font-medium text-slate-700">
                  Security
                </span>
              </label>

              {/* PARKING */}
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#075e3b] transition">
                <input
                  type="checkbox"
                  name="parking"
                />

                <FaCar className="text-[#075e3b]" />

                <span className="text-sm font-medium text-slate-700">
                  Parking
                </span>
              </label>

              {/* INTERNET */}
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#075e3b] transition">
                <input
                  type="checkbox"
                  name="internet"
                />

                <FaWifi className="text-[#075e3b]" />

                <span className="text-sm font-medium text-slate-700">
                  Internet
                </span>
              </label>

              {/* BOREHOLE */}
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#075e3b] transition">
                <input
                  type="checkbox"
                  name="borehole"
                />

                <FaWater className="text-[#075e3b]" />

                <span className="text-sm font-medium text-slate-700">
                  Borehole 
                </span>
              </label>

              {/* FURNISHED */}
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#075e3b] transition">
                <input
                  type="checkbox"
                  name="furnished"
                />

                <FaCouch className="text-[#075e3b]" />

                <span className="text-sm font-medium text-slate-700">
                  Furnished
                </span>
              </label>

              {/* KITCHEN */}
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#075e3b] transition">
                <input
                  type="checkbox"
                  name="kitchen"
                />

                <FaUtensils className="text-[#075e3b]" />

                <span className="text-sm font-medium text-slate-700">
                  Kitchen
                </span>
              </label>

              {/* WARDROBE */}
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#075e3b] transition">
                <input
                  type="checkbox"
                  name="wardrobe"
                />

                <FaDoorOpen className="text-[#075e3b]" />

                <span className="text-sm font-medium text-slate-700">
                  Wardrobe
                </span>
              </label>

              {/* BALCONY */}
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#075e3b] transition">
                <input
                  type="checkbox"
                  name="balcony"
                />

                <FaHome className="text-[#075e3b]" />

                <span className="text-sm font-medium text-slate-700">
                  Balcony
                </span>
              </label>

            </div>
          </section>

          {/* DESCRIPTION */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6">

            <h3 className="font-bold text-slate-900">
              Description
            </h3>

            <textarea
              name="description"
              rows={6}
              placeholder="Describe the accommodation, nearby landmarks, access roads, facilities, and other useful information..."
              className="w-full mt-4 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-[#075e3b] resize-none"
            />

          </section>

          {/* MEDIA UPLOAD */}
          <PropertyMediaUpload />

          {/* ACTIONS */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

            <Link
              href="/dashboard/agent"
              className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold text-center hover:bg-white transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-[#075e3b] text-white font-semibold hover:bg-[#064d31] transition"
            >
              Create Property
            </button>

          </div>

        </form>
      </div>
    </main>
  )
}

