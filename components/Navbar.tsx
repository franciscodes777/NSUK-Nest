"use client"
import Image from "next/image"
import Link from "next/link"
import { FaUserCircle } from "react-icons/fa";
import { Theme } from "./theme";
import { ImCancelCircle } from "react-icons/im";
import { IoIosMenu } from "react-icons/io";
import { use, useState } from "react";
import { NextFont } from "next/dist/compiled/@next/font";
import { useSession, signOut } from "next-auth/react";



 
export default function Navbar () {

    const [navOpen, setNavOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const { data: session } = useSession ()

    const navlinks: object[] = [
        {
            label:"Home",
            url:"/"
        },
        {
            label:"About",
            url: "/about"
        },
        {
            label:"Contact",
            url:"/contact"
        },
        {
            label: "FAQs",
            url: "/faqs"
        }
    ]
    return(
        <main className="font-playfair  flex items-center justify-between lg:px-20 bg-white py-2 shadow-md relative sticky top-0 z-50">
            <Link href={"/"} className="flex items-center z-50">
            <Image 
            src={"/nsuknestlogo.jpg"}
            alt="logo"
            width={1000}
            height={1000} 
            className="w-15 h-15"
            />
            <h1 className=" text-xl font-bold italic text-gray-800 ">NSUK Nest</h1>
            </Link>

            <div className="ml-auto flex items-center gap-6 text-black max-lg:hidden" >
                {
                    navlinks.map((item, i)=> (
                
                <article  key={i} className="group">
                <Link  href={item.url} className="text-base font-bold tracking-tight group-hover:bg-[#075e3b]/50  px-3 py-2 rounded-full">{item.label}</Link>
                {/* <div className="h-1 w-full bg-white group-hover:bg-[#E73F1E] transition-all duration-500"></div> */}
                </article>
                    ))
                }
               
            </div>

            <div className="flex items-center gap-6 ml-6 max-lg:hidden">
  
        {session ? (
    <div className="relative">
        <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-10 h-10 rounded-full bg-[#075e3b] text-white font-bold text-lg flex items-center justify-center"
        >
            {session.user?.name?.charAt(0).toUpperCase()}
        </button>

        {profileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <Link
                    href="/profile"
                    className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => setProfileOpen(false)}
                >
                    View Profile
                </Link>

                <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                    Log Out
                </button>
            </div>
        )}
    </div>
) : (
        <>
            <Link
                className="flex items-center border gap-1 px-5 py-0.5 rounded-full
                border-black text-black font-bold hover:text-[#075e3b] hover:border-[#075e3b]"
                href={"/login"}
            >
                Login <FaUserCircle />
            </Link>

            <Link
                href={"/auth"}
                className="px-6 py-1 rounded-full font-semibold bg-[#075e3b] text-white border text-base hover:bg-white hover:text-[#075e3b] hover:scale-x-95 transition-transform duration-300"
            >
                Get Started
            </Link>
        </>
    )}
</div>

            {/* mobile and tablet view*/}
            <button onClick={()=> setNavOpen(!navOpen)} className="lg:hidden z-60 text-black text-3xl mr-2">
                {
                    navOpen ? <ImCancelCircle /> : <IoIosMenu /> 
                }
            </button>
            <blockquote className= {`lg:hidden absolute top-0 right-0 w-full h-dvh space-y-6 bg-white text-black ${navOpen ? "block" : "hidden"}`}>
            <div className="pt-20 flex flex-col gap-10 items-center ">
                {
                    navlinks.map((item, i)=> (
                
                <Link  key={i} href={item.url} className="text-base font-bold tracking-tight">{item.label}</Link>
               
                    ))
                }
            </div>
            <div className="flex flex-col items-center gap-6 ">
                <Link className="flex items-center border gap-1 px-3 py-0.5 rounded-full
                border-gray-700 " href={"/"}>Login <FaUserCircle /></Link>
                <Link href={"/"} style={{backgroundColor: Theme.primaryColor}} className="px-6 py-1 rounded-full text-white border text-lg">Get Started</Link>
            </div>
            </blockquote>
        </main>
    )
}