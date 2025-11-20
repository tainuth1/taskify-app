"use client";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Image
        src="/taskify-logo-light.png"
        alt="Taskify"
        className="w-auto h-auto object-cover"
        width={250}
        height={112}
        loading="eager"
      />
      <h1 className="text-2xl font-bold">Welcome to Taskify.</h1>
      <p className="text-gray-500">This is a task management system.</p>
    </div>
  );
}
