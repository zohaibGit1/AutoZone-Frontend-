"use client";
import { useState } from "react";
export function ContactSection() {
  const [sent, setSent] = useState(false);
  return (
    <section className="relative overflow-hidden border-t border-white/10 py-28">
      <div className="absolute inset-0 bg-[url('/images/contact-garage.png')] bg-cover bg-center opacity-15" />
      <div className="absolute inset-0 bg-[#0d0c0f]/90" />
      <div className="container relative z-10 grid gap-14 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">Contact Us</p>
          <h2 className="text-5xl sm:text-6xl">
            Have Questions?
            <br />
            <span className="text-[#ea0a0b]">Get In Touch!</span>
          </h2>
          <p className="mt-6 max-w-lg text-[#b9b9bd]">
            Tell us about your vehicle and we will help you choose the right
            service.
          </p>
          <div className="mt-10 space-y-3 text-white">
            <p>785 15th Street, Office 478, Berlin, DE 81566</p>
            <p>+1 800 555 25 69</p>
            <p>info@autozone.com</p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="bg-[#151419] p-8 md:p-10"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {["Name", "Last Name"].map((x) => (
              <input
                key={x}
                required
                placeholder={x}
                className="border border-white/10 bg-[#0d0c0f] px-4 py-4 text-white outline-none focus:border-[#ea0a0b]"
              />
            ))}
          </div>
          <input
            required
            type="email"
            placeholder="Email"
            className="mt-5 w-full border border-white/10 bg-[#0d0c0f] px-4 py-4 text-white outline-none focus:border-[#ea0a0b]"
          />
          <input
            placeholder="Phone"
            className="mt-5 w-full border border-white/10 bg-[#0d0c0f] px-4 py-4 text-white outline-none focus:border-[#ea0a0b]"
          />
          <textarea
            rows={5}
            placeholder="Message"
            className="mt-5 w-full resize-none border border-white/10 bg-[#0d0c0f] px-4 py-4 text-white outline-none focus:border-[#ea0a0b]"
          />
          <button className="mt-6 w-full bg-[#ea0a0b] py-4 font-heading text-sm font-bold uppercase tracking-wide text-white hover:bg-white hover:text-[#0d0c0f]">
            {sent ? "Request Sent" : "Send Request"}
          </button>
        </form>
      </div>
    </section>
  );
}
