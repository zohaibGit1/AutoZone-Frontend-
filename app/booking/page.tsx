import { ContentShell } from "@/components/content-shell";
export default function Booking() {
  return (
    <ContentShell
      title="Online Booking"
      eyebrow="Reserve A Bay"
      image="/images/hero-car.png"
    >
      <section className="container max-w-4xl pb-28">
        <div className="grid gap-5 md:grid-cols-2">
          <input
            type="date"
            className="border border-white/10 bg-[#111015] p-4 text-white"
          />
          <input
            type="time"
            className="border border-white/10 bg-[#111015] p-4 text-white"
          />
          <select className="border border-white/10 bg-[#111015] p-4 text-white md:col-span-2">
            <option>Choose a service</option>
            <option>Full Detail</option>
            <option>Ceramic Coating</option>
            <option>Protection Film</option>
          </select>
          <input
            placeholder="Name"
            className="border border-white/10 bg-[#111015] p-4 text-white"
          />
          <input
            placeholder="Phone"
            className="border border-white/10 bg-[#111015] p-4 text-white"
          />
          <button className="bg-[#ea0a0b] p-4 font-heading font-bold uppercase text-white md:col-span-2">
            Request Booking
          </button>
        </div>
      </section>
    </ContentShell>
  );
}
