'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MascotAvatar } from '@/components/ui/mascot-avatar';
import { getConceptVideoForLesson } from '@/lib/courses/concept-videos';
import type { Lesson } from '@/types/lesson';

export function ConceptIntroCard({ lesson }: { lesson: Lesson }) {
  const [expanded, setExpanded] = useState(false);
  const concept = getConceptVideoForLesson(lesson);

  return (
    <Card className="overflow-hidden border-2 border-[#FDE68A] bg-[#FFFBEB] p-0">
      <div className="flex items-start gap-3 p-4">
        <motion.div
          animate={{ rotate: [-2, 2, -2], y: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="rounded-[18px] bg-white p-2 shadow-kid"
        >
          <MascotAvatar expression="happy" size="md" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-quicksand font-bold uppercase tracking-wide text-[#B45309]">
            卡通概念
          </p>
          <h2 className="mt-1 text-[18px] font-quicksand font-bold text-[#1F2937]">{concept.title}</h2>
          <p className="mt-2 text-[14px] text-[#4B5563]">{concept.concept}</p>
        </div>
      </div>

      <div className="grid gap-3 px-4 pb-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="rounded-[14px] bg-white p-3 shadow-kid">
          <p className="text-[13px] font-quicksand font-bold text-[#92400E]">小比喻</p>
          <p className="mt-1 text-[14px] text-[#374151]">{concept.metaphor}</p>
          <p className="mt-2 rounded-[10px] bg-[#DBEAFE] px-3 py-2 text-[13px] font-quicksand font-bold text-[#1D4ED8]">
            {concept.takeaway}
          </p>
        </div>
        <Button variant="accent" onClick={() => setExpanded((value) => !value)}>
          {expanded ? '收起动画' : '播放动画'}
        </Button>
      </div>

      {expanded && (
        <div className="border-t-2 border-[#FDE68A] bg-white p-4">
          <div className="overflow-hidden rounded-[16px] border-2 border-[#DBEAFE] bg-[#EFF6FF]">
            {concept.embedUrl ? (
              <iframe
                title={`${concept.title} 视频`}
                src={concept.embedUrl}
                allow="fullscreen; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full border-0 bg-black"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="relative p-5">
                <motion.div
                  animate={{ x: ['0%', '12%', '0%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-[56px]"
                  role="img"
                  aria-label="cartoon concept"
                >
                  {concept.title.includes('变量')
                    ? '📦'
                    : concept.title.includes('循环')
                    ? '🔁'
                    : concept.title.includes('海龟')
                    ? '🐢'
                    : '📣'}
                </motion.div>
              </div>
            )}
            <div className="m-3 rounded-[14px] bg-white/90 p-4 shadow-kid">
              <p className="text-[16px] font-quicksand font-bold text-[#1F2937]">{concept.metaphor}</p>
              <p className="mt-2 font-code text-[14px] text-[#2563EB]">{concept.takeaway}</p>
            </div>
          </div>

          <div className="mt-3 rounded-[14px] bg-[#F9FAFB] p-3">
            <p className="text-[13px] font-quicksand font-bold text-[#1F2937]">{concept.question}</p>
            <p className="mt-1 text-[13px] text-[#16A34A]">答案：{concept.answer}</p>
            {concept.sourceUrl && (
              <a
                className="mt-2 inline-flex text-[12px] font-quicksand font-bold text-[#3B82F6] hover:underline"
                href={concept.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                来源：{concept.sourceName}
              </a>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
