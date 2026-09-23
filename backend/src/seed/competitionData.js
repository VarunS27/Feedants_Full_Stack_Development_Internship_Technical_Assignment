const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * The design's own dates (Aug–Sep 2026) are used when seeding with --literal-dates.
 * By default every competition is anchored relative to seed time so the countdown on
 * the details screen is genuinely live and each lifecycle state is demonstrable.
 */
const LITERAL_DATES = {
  registrationOpensAt: new Date('2026-08-01T00:00:00+05:30'),
  registerBefore: new Date('2026-08-10T23:50:00+05:30'),
  submissionStarts: new Date('2026-08-06T04:00:00+05:30'),
  submissionEnds: new Date('2026-08-30T23:55:00+05:30'),
  resultDate: new Date('2026-09-01T23:50:00+05:30'),
};

const relativeDates = (now) => ({
  registrationOpensAt: new Date(now.getTime() - 5 * DAY),
  // Mirrors the design's "01d : 06h : 28m" registration countdown.
  registerBefore: new Date(now.getTime() + DAY + 6 * HOUR + 28 * MINUTE),
  submissionStarts: new Date(now.getTime() - 2 * DAY),
  submissionEnds: new Date(now.getTime() + 20 * DAY),
  resultDate: new Date(now.getTime() + 22 * DAY),
});

// Seeded placeholder images: stable per seed string, so the same face always renders
// for the same person. Replace with real CDN assets when they exist.
const IMAGES = {
  judge: 'https://picsum.photos/seed/manju-dubey/200/200',
  winner1: 'https://picsum.photos/seed/riya-shah/300/300',
  winner2: 'https://picsum.photos/seed/aarav-mehta/300/300',
  winner3: 'https://picsum.photos/seed/neha-verma/300/300',
  winner4: 'https://picsum.photos/seed/ishita-chopra/300/300',
  banner: 'https://picsum.photos/seed/feedants-dance/800/400',
};

// Third-party placeholder media. These are demo stand-ins for competition videos, not
// project assets, so a real deployment serves its own CDN files instead — a public
// sample host can revoke access at any time and every play button dies with it.
const VIDEOS = {
  intro: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
  entry: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
};

const classicalDance = (dates) => ({
  slug: 'feedants-classical-dance',
  title: {
    en: 'Feedants Classical Dance',
    hi: 'फीडेंट्स शास्त्रीय नृत्य',
  },
  category: 'Dance',
  tags: [
    { en: 'Dance', hi: 'नृत्य' },
    { en: 'Multi-Win', hi: 'मल्टी-विन' },
  ],
  isMultiWin: true,
  certificateProvided: true,
  prizePool: 1500,
  entryFee: 99,
  currency: 'INR',
  capacity: { totalSpots: 20, bookedSpots: 0 },
  judge: {
    name: { en: 'Manju Dubey', hi: 'मंजू दुबे' },
    title: { en: 'Professional Kathak Dancer', hi: 'पेशेवर कथक नृत्यांगना' },
    experienceYears: 12,
    photoUrl: IMAGES.judge,
    introVideoUrl: VIDEOS.intro,
  },
  dates,
  content: {
    about: {
      en: 'This is an online classical dance competition open for all age groups.\nParticipate from anywhere and showcase your talent.\nExpress your passion through traditional dance.',
      hi: 'यह एक ऑनलाइन शास्त्रीय नृत्य प्रतियोगिता है जो सभी आयु वर्ग के लिए खुली है।\nकहीं से भी भाग लें और अपनी प्रतिभा दिखाएं।\nपारंपरिक नृत्य के माध्यम से अपना जुनून व्यक्त करें।',
    },
    judgingParameters: [
      { en: 'Technique and precision of classical movements', hi: 'शास्त्रीय मुद्राओं की तकनीक और सटीकता' },
      { en: 'Expression and storytelling (Abhinaya)', hi: 'भाव और अभिनय' },
      { en: 'Rhythm and synchronisation with the beat', hi: 'लय और ताल के साथ तालमेल' },
      { en: 'Costume, presentation and stage presence', hi: 'वेशभूषा, प्रस्तुति और मंच उपस्थिति' },
      { en: 'Overall creativity and originality', hi: 'समग्र रचनात्मकता और मौलिकता' },
    ],
    rulesAndEligibility: [
      { en: 'Open to participants of all age groups across India.', hi: 'भारत भर के सभी आयु वर्ग के प्रतिभागियों के लिए खुला।' },
      { en: 'Only one entry is allowed per registered participant.', hi: 'प्रत्येक पंजीकृत प्रतिभागी केवल एक प्रविष्टि भेज सकता है।' },
      { en: 'The performance video must be between 2 and 5 minutes long.', hi: 'प्रदर्शन वीडियो 2 से 5 मिनट के बीच होना चाहिए।' },
      { en: 'The video must be original and recorded for this competition.', hi: 'वीडियो मौलिक होना चाहिए और इसी प्रतियोगिता के लिए रिकॉर्ड किया जाना चाहिए।' },
      { en: 'Entries submitted after the deadline will not be considered.', hi: 'अंतिम तिथि के बाद भेजी गई प्रविष्टियाँ स्वीकार नहीं की जाएंगी।' },
      { en: "The judge's decision will be final and binding.", hi: 'निर्णायक का निर्णय अंतिम और सर्वमान्य होगा।' },
    ],
  },
  rewards: [
    { position: 1, amount: 550 },
    { position: 2, amount: 300 },
    { position: 3, amount: 240 },
    { position: 4, amount: 200 },
    { position: 5, amount: 130 },
    { position: 6, amount: 80 },
  ],
  previousWinners: [
    { name: 'Riya Shah', position: 1, thumbnailUrl: IMAGES.winner1, videoUrl: VIDEOS.entry, season: 'Season 3' },
    { name: 'Aarav Mehta', position: 1, thumbnailUrl: IMAGES.winner2, videoUrl: VIDEOS.entry, season: 'Season 3' },
    { name: 'Neha Verma', position: 2, thumbnailUrl: IMAGES.winner3, videoUrl: VIDEOS.entry, season: 'Season 3' },
    { name: 'Ishita Chopra', position: 3, thumbnailUrl: IMAGES.winner4, videoUrl: VIDEOS.entry, season: 'Season 3' },
  ],
  disclaimer: {
    en: 'Only contributions from paid participants will be considered for judging.',
    hi: 'केवल भुगतान करने वाले प्रतिभागियों की प्रविष्टियाँ ही निर्णय हेतु मानी जाएंगी।',
  },
  media: { bannerUrl: IMAGES.banner, prizeMoneyVideoUrl: VIDEOS.intro },
  policies: { refundPolicyUrl: 'https://feedants.com/refund-policy', paymentPartner: 'Razorpay' },
  referral: { isEnabled: true, bonusPerSignup: 10, baseUrl: 'https://feedants.com/r' },
  status: 'published',
});

/** Variants that make every edge case on the screen demonstrable without waiting for time to pass. */
const variants = (now) => {
  // Main competition uses relative dates so the countdown is always live when seeded.
  const base = classicalDance(relativeDates(now));

  return [
    base,
    {
      ...base,
      slug: 'feedants-singing-sold-out',
      title: { en: 'Feedants Singing Stars', hi: 'फीडेंट्स सिंगिंग स्टार्स' },
      category: 'Singing',
      tags: [
        { en: 'Singing', hi: 'गायन' },
        { en: 'Multi-Win', hi: 'मल्टी-विन' },
      ],
      // Every spot taken: the CTA must render as "Registration Full", which only shows
      // while the window is still open — so this one keeps live relative dates.
      dates: relativeDates(now),
      capacity: { totalSpots: 15, bookedSpots: 15 },
      prizePool: 2500,
      entryFee: 149,
    },
    {
      ...base,
      slug: 'feedants-painting-closed',
      title: { en: 'Feedants Painting Challenge', hi: 'फीडेंट्स पेंटिंग चैलेंज' },
      category: 'Art',
      tags: [{ en: 'Art', hi: 'कला' }],
      capacity: { totalSpots: 50, bookedSpots: 31 },
      // Registration deadline passed, submissions still open.
      dates: {
        registrationOpensAt: new Date(now.getTime() - 20 * DAY),
        registerBefore: new Date(now.getTime() - 2 * DAY),
        submissionStarts: new Date(now.getTime() - 1 * DAY),
        submissionEnds: new Date(now.getTime() + 6 * DAY),
        resultDate: new Date(now.getTime() + 9 * DAY),
      },
    },
    {
      ...base,
      slug: 'feedants-photography-results',
      title: { en: 'Feedants Photography Awards', hi: 'फीडेंट्स फोटोग्राफी अवार्ड्स' },
      category: 'Photography',
      tags: [
        { en: 'Photography', hi: 'फोटोग्राफी' },
        { en: 'Multi-Win', hi: 'मल्टी-विन' },
      ],
      capacity: { totalSpots: 40, bookedSpots: 40 },
      // Fully finished: results already declared.
      dates: {
        registrationOpensAt: new Date(now.getTime() - 60 * DAY),
        registerBefore: new Date(now.getTime() - 40 * DAY),
        submissionStarts: new Date(now.getTime() - 38 * DAY),
        submissionEnds: new Date(now.getTime() - 10 * DAY),
        resultDate: new Date(now.getTime() - 5 * DAY),
      },
    },
  ];
};

module.exports = { classicalDance, relativeDates, variants, LITERAL_DATES };
