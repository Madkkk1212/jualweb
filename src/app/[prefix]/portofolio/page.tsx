"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function PortofolioRedirect() {
  const router = useRouter();
  const params = useParams();
  const prefix = params?.prefix as string;

  useEffect(() => {
    if (prefix) {
      router.replace(`/${prefix}/portfolio`);
    }
  }, [router, prefix]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8F4EE]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#5C4B40] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-[#7A6F6D] font-medium tracking-wide">Mengalihkan ke portfolio...</p>
      </div>
    </div>
  );
}
