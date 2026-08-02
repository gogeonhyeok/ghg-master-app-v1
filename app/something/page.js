"use client"

import NiceComponent from "../../components/nice"

import { useState } from "react"

const Home = () => {
    return (
    <div>
      <h1>Home</h1>
      <Link href="/about">About</Link>
    </div>
    )
}


export default function Page() {
    const [age, setAge] = useState(29)
    return (
        <div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center gap-x-4">
        <div class="shrink-0">
            <img class="size-12" src="/img/logo.svg" alt="ChitChat Logo" />
        </div>
        <div>
            <div class="text-xl font-medium text-black">ChitChat</div>
            <p class="text-slate-500">You have a new message!</p>
        </div>
        <NiceComponent />
        <App />
        </div>
    )
}


