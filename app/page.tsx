import { HeroSection } from "@/components/sections/hero-section";
// import { Navigation } from "@/components/navigation";
// import { StorySection } from "@/components/sections/story-section";
// import { EventSection } from "@/components/sections/event-section";
import { AttireSection } from "@/components/sections/attire-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { LocationSection } from "@/components/sections/location-section";
import { RSVPSection } from "@/components/sections/rsvp-section";
import { GiftsSection } from "@/components/sections/gifts-section";
import { SectionDivider } from "@/components/section-divider";
// import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      {/* <Navigation /> */}
      <main>
        <HeroSection />
        <SectionDivider
          topColor="#0d0d0d"
          bottomColor="#fdfdfd"
          variant="wave"
          overlay
        />
        {/* <StorySection />
        <EventSection /> */}
        <AttireSection />
        <SectionDivider
          topColor="#fdfdfd"
          bottomColor="#E6DBAB"
          variant="gentle"
        />
        <GallerySection />
        <SectionDivider
          topColor="#E6DBAB"
          bottomColor="#1F250B"
          variant="arch"
        />
        <RSVPSection />
        <SectionDivider
          topColor="#1F250B"
          bottomColor="#E6DBAB"
          variant="gentle"
          flip
        />
        <GiftsSection />
        <SectionDivider
          topColor="#E6DBAB"
          bottomColor="#c3e5c9"
          variant="gentle"
        />
        <LocationSection />
      </main>
      {/* <Footer /> */}
    </>
  );
}
