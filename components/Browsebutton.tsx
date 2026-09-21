"use client"

import Link from "next/link"
import { Theme } from "./theme"

export default function Browsebutton () {
    return(
        <Link href="/accommodation"
        className=" text-white px-6 py-3 rounded-lg hover:scale-90" style={{backgroundColor: Theme.primaryColor}}>Browse Accommodation</Link>

    )
}