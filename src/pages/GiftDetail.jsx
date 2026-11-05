import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getGift, gifts } from "@/data/gifts";
import { Image } from "@/components/ui/image";
import ObservationSpecimen from "@/components/ObservationSpecimen";
import CreativitySpecimen from "@/components/CreativitySpecimen";
import OrganizationSpecimen from "@/components/OrganizationSpecimen";
import StorytellingSpecimen from "@/components/StorytellingSpecimen";

export default function GiftDetail() {
  const { giftId } = useParams();
  const navigate = useNavigate();
  const gift = getGift(giftId);

  if (!gift) {
    return (
      <div className="paper-bg flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-[var(--font-label)] text-2xl text-[#2D2D2D]">
          Specimen not found
        </p>
        <button
          onClick={() => navigate("/")}
          className="font-[var(--font-body)] text-sm uppercase tracking-[0.2em] text-[#8B4513]"
        >
          Return to Atlas
        </button>
      </div>
    );
  }

  const index = gifts.findIndex((g) => g.id === gift.id);

  return (
    <motion.div
      initial={{ scale: 1.18, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="paper-bg min-h-screen w-full overflow-x-hidden"
    >
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-8 md:pt-12">
        {/* back */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 font-[var(--font-body)] text-[12px] uppercase tracking-[0.25em] text-[#8B4513] transition-opacity hover:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Atlas
        </button>

        {/* heading */}
        <div className="mt-6 text-center">
          <p className="font-[var(--font-body)] text-[11px] uppercase tracking-[0.4em] text-[#8B4513]">
            {`Plate No. ${index + 1} — A Faculty of Illustrate`}
          </p>
          <h1
            className="mt-1 text-[#2D2D2D]"
            style={{ fontFamily: "var(--font-label)", fontSize: "min(10vw, 56px)" }}
          >
            {gift.name}
          </h1>
        </div>

        {/* specimen + index */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:mt-12 md:grid-cols-2 md:gap-12">
          {/* specimen plate */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {gift.id === "observation" ? (
              <div className="w-full max-w-[420px]">
                <ObservationSpecimen
                  plate={gift.image}
                  alt={`Scientific specimen illustrating ${gift.name}: ${gift.specimen}`}
                />
              </div>
            ) : gift.id === "creativity" ? (
              <div className="w-full max-w-[420px]">
                <CreativitySpecimen
                  plate={gift.image}
                  alt={`Scientific specimen illustrating ${gift.name}: ${gift.specimen}`}
                />
              </div>
            ) : gift.id === "organization" ? (
              <div className="w-full max-w-[420px]">
                <OrganizationSpecimen
                  plate={gift.image}
                  alt={`Scientific specimen illustrating ${gift.name}: ${gift.specimen}`}
                />
              </div>
            ) : gift.id === "storytelling" ? (
              <div className="w-full max-w-[740px]">
                <StorytellingSpecimen
                  plate={gift.image}
                  alt={`Scientific specimen illustrating ${gift.name}: ${gift.specimen}`}
                />
              </div>
            ) : gift.cutout ? (
              <div className="w-full max-w-[420px]">
                <Image
                  src={gift.image}
                  alt={`Scientific specimen illustrating ${gift.name}: ${gift.specimen}`}
                  fittingType="fit"
                  className="h-auto w-full"
                />
              </div>
            ) : (
              <div className="w-full max-w-[360px] overflow-hidden rounded-sm ring-1 ring-[#8B4513]/30 shadow-[0_10px_50px_-15px_rgba(60,40,20,0.4)]">
                <motion.div
                  initial={{ scale: 1.25 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={gift.image}
                    alt={`Scientific specimen illustrating ${gift.name}: ${gift.specimen}`}
                    fittingType="fit"
                    className="aspect-[4/5] w-full bg-[#f4f0e6]"
                  />
                </motion.div>
              </div>
            )}
            <p className="mt-3 max-w-[320px] text-center font-[var(--font-body)] text-[11px] italic leading-relaxed text-[#5a5148]">
              {`Fig. ${index + 1}. — ${gift.specimen}.`}
            </p>
          </motion.div>

          {/* index / key */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="border-l border-[#8B4513]/30 pl-5 md:pl-7"
          >
            <section>
              <h2 className="font-[var(--font-label)] text-[13px] uppercase tracking-[0.3em] text-[#8B4513]">
                Applicable Vocations
              </h2>
              <ul className="mt-3 space-y-2">
                {gift.jobs.map((job) => (
                  <li
                    key={job}
                    className="flex items-baseline gap-3 font-[var(--font-body)] text-[16px] text-[#2D2D2D]"
                  >
                    <span className="text-[#8B4513]">§</span>
                    <span>{job}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="my-6 h-px w-24 bg-[#8B4513]/30" />

            <section>
              <h2 className="font-[var(--font-label)] text-[13px] uppercase tracking-[0.3em] text-[#8B4513]">
                Daily Practices
              </h2>
              <p className="mt-1 font-[var(--font-body)] text-[11px] italic text-[#5a5148]/80">
                Small, measurable, repeatable.
              </p>
              <ol className="mt-4 space-y-3">
                {gift.actions.map((action, i) => (
                  <li
                    key={i}
                    className="flex gap-3 font-[var(--font-body)] text-[15px] leading-relaxed text-[#2D2D2D]"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border border-[#8B4513]/50 font-[var(--font-body)] text-[10px] text-[#8B4513]">
                      {i + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ol>
            </section>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}