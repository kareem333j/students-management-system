"use client";
import { usePathname, useSearchParams } from "next/navigation";
import MainBack from "../components/mainBack";
import SearchResult from "@/components/searchResult";

export default function Home() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const searchQuery = searchParams.get("search") || "";
  const isProfilePage = pathname.startsWith("/profile/");
  
  if(searchQuery || isProfilePage){
    return (
      <div>
        <SearchResult searchParams={searchQuery} />
      </div>
    );
  }
  
  return (
    <div>
      <MainBack />
    </div>
  );
}
