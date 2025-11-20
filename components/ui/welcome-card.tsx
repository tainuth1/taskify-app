"use client";
import { memo } from "react";
import Iridescence from "./i-ride-scence";
import Link from "next/link";

const WelcomeCard = () => {
  return (
    <div className="hidden md:flex md:w-1/2 bg-slate-200 rounded-2xl m-8 p-12 flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0">
        <Iridescence
          color={[0.87, 0.87, 0.87]}
          mouseReact={false}
          amplitude={0.1}
          speed={0.2}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-gray-100 text-sm font-light">You can easily</p>
        <h1 className="text-4xl font-bold text-white mt-2 leading-tight">
          Speed up your work
          <br />
          with our Web App
        </h1>
      </div>

      {/* Access & Contact Section */}
      <div className="relative z-10 mt-8">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Get Access Section */}
          <div className="flex-1 backdrop-blur-xl transition-all hover:backdrop-blur-3xl rounded-xl p-4">
            <h2 className="text-2xl font-bold text-white mb-3">Get Access</h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Sign up at{" "}
              <Link
                href="http://localhost:3000/signup"
                className="underline hover:text-white transition-colors"
                rel="noopener noreferrer"
              >
                taskify.com
              </Link>{" "}
              to start using the app.
            </p>
          </div>

          {/* Questions Section */}
          <div className="flex-1 backdrop-blur-xl transition-all hover:backdrop-blur-3xl rounded-xl p-4">
            <h2 className="text-2xl font-bold text-white mb-3">Questions?</h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Reach us at{" "}
              <Link
                href="mailto:info@taskify.com"
                className="underline hover:text-white transition-colors"
              >
                info@taskify.com
              </Link>
              <br />
              or call{" "}
              <Link
                href="tel:+31850600404"
                className="underline hover:text-white transition-colors"
              >
                +855 8172502033
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(WelcomeCard);
