import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

export function useLandingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const successParam = searchParams.get("success");
    const errorParam = searchParams.get("error");

    if (successParam === "google") {
      toast.success("Successfully logged in with Google!");
      cleanUrl();
    } else if (errorParam) {
      toast.error("Authentication failed. Please try again.");
      cleanUrl();
    }

    function cleanUrl() {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("success");
      params.delete("error");
      const query = params.toString();
      const cleanPath = query ? `${pathname}?${query}` : pathname;
      router.replace(cleanPath, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  useEffect(() => {
    const sections = ["features", "how-it-works", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
      if (window.scrollY < 100) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return {
    activeSection,
    setActiveSection,
    isScrolled,
    setIsScrolled,
  };
}
