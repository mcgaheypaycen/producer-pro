/**
 * Dummy data loaded into demo mode (no Supabase configured) on first run,
 * so the app is explorable without any setup. Media file ids are fake demo
 * ids — enough for the UI to treat media as attached.
 */

const ago = (days) => new Date(Date.now() - days * 86400000).toISOString();
const ahead = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

const performers = [
  { id: 'p-velvet', stageName: 'Velvet Thunder', legalName: 'Jane Morrison', email: 'jane.m@example.com', phone: '(555) 201-4401', paymentMethod: 'Venmo', paymentInfo: '@velvet-thunder', createdAt: ago(90), updatedAt: ago(5) },
  { id: 'p-marvel', stageName: 'Miss Marvel', legalName: 'Maria Chen', email: 'maria.chen@example.com', phone: '(555) 201-4402', paymentMethod: 'CashApp', paymentInfo: '$missmarvel', createdAt: ago(85), updatedAt: ago(12) },
  { id: 'p-onyx', stageName: 'Onyx St. James', legalName: 'James Rivera', email: 'james.r@example.com', phone: '(555) 201-4403', paymentMethod: 'PayPal', paymentInfo: 'onyxstjames@paypal.com', createdAt: ago(60), updatedAt: ago(3) },
  { id: 'p-luna', stageName: 'Luna Foxx', legalName: 'Luna Patterson', email: 'luna.foxx@example.com', phone: '(555) 201-4404', paymentMethod: 'Zelle', paymentInfo: 'luna.foxx@email.com', createdAt: ago(45), updatedAt: ago(8) },
  { id: 'p-diamond', stageName: 'Diamond Dazzle', legalName: 'Diana Brooks', email: 'diana.b@example.com', phone: '(555) 201-4405', paymentMethod: 'Venmo', paymentInfo: '@diamonddazzle', createdAt: ago(30), updatedAt: ago(1) },
];

const venues = [
  { id: 'v-redcurtain', name: 'The Red Curtain Lounge', address: '412 Bourbon Alley, New Orleans, LA 70116', contactName: 'Patrice LeBlanc', contactEmail: 'patrice@redcurtainlounge.com', contactPhone: '(504) 555-0182', capacity: '120', notes: 'Load-in through the alley door. Sound board stage left. Dressing rooms downstairs.', createdAt: ago(120), updatedAt: ago(20) },
  { id: 'v-midnight', name: 'Midnight Mirage Theater', address: '88 Velvet Row, Chicago, IL 60614', contactName: 'Sam Ortiz', contactEmail: 'sam@midnightmirage.com', contactPhone: '(312) 555-0299', capacity: '200', notes: 'Full lighting rig. Two dressing rooms plus green room. Bar opens at 6 PM.', createdAt: ago(100), updatedAt: ago(15) },
  { id: 'v-gilded', name: 'The Gilded Sparrow', address: '15 Pearl Street, Portland, OR 97209', contactName: 'Alex Kim', contactEmail: 'alex@gildedsparrow.com', contactPhone: '(503) 555-0411', capacity: '85', notes: 'Intimate room — house lights dim only. No fog machine allowed.', createdAt: ago(75), updatedAt: ago(7) },
];

const acts = [
  { id: 'a-feathers', performerId: 'p-velvet', name: 'Feathers & Fire', aesthetic: 'Classic burlesque, art deco glam', length: '4:30', tagline: 'A smoldering tribute to the golden age of tease', lightingNotes: 'Deep red wash, follow spot on entrance, blackout on final pose', stageNotes: 'Chair set center stage, glitter cleanup after', mediaFileId: 'demo-media-feathers', mediaName: 'feathers-and-fire.mp3', mediaLink: '', createdAt: ago(80), updatedAt: ago(10) },
  { id: 'a-midnight', performerId: 'p-velvet', name: 'Midnight in Paris', aesthetic: 'French cabaret, chanson', length: '5:15', tagline: 'Where the champagne flows and hearts go up in smoke', lightingNotes: 'Soft amber wash, single follow spot, blue sidelight on chorus', stageNotes: 'Eiffel Tower prop stage right, feather boa reveal at 2:00', mediaFileId: 'demo-media-midnight', mediaName: 'midnight-in-paris.mp3', mediaLink: '', createdAt: ago(70), updatedAt: ago(14) },
  { id: 'a-cosmic', performerId: 'p-marvel', name: 'Cosmic Spin', aesthetic: 'Sci-fi glam, neon futurism', length: '3:45', tagline: 'Blast off into a galaxy of glitter', lightingNotes: 'UV blacklight, strobe on drop, purple and cyan gels', stageNotes: 'Hoop prop, LED gloves, confetti cannon at finale', mediaFileId: 'demo-media-cosmic', mediaName: 'cosmic-spin.mp4', mediaLink: '', createdAt: ago(55), updatedAt: ago(6) },
  { id: 'a-supernova', performerId: 'p-marvel', name: 'Supernova', aesthetic: 'Power pop burlesque', length: '4:00', tagline: 'Faster than a speeding spotlight', lightingNotes: 'White hot center wash, rapid color chase during chorus', stageNotes: 'Cape tear at 1:30, hero pose freeze at end', mediaFileId: 'demo-media-supernova', mediaName: 'supernova.mp3', mediaLink: '', createdAt: ago(40), updatedAt: ago(4) },
  { id: 'a-smoke', performerId: 'p-onyx', name: 'Smoke & Mirrors', aesthetic: 'Film noir, slow burn', length: '6:00', tagline: 'Nothing is what it seems behind the curtain', lightingNotes: 'Low sidelight only, silhouette through haze, single white follow', stageNotes: 'Mirror prop, slow walk from upstage, no music first 30 sec', mediaFileId: 'demo-media-smoke', mediaName: 'smoke-and-mirrors.wav', mediaLink: '', createdAt: ago(50), updatedAt: ago(9) },
  { id: 'a-foxfire', performerId: 'p-luna', name: 'Foxfire', aesthetic: 'Woodland mystic, ethereal', length: '4:20', tagline: 'Wild magic under a harvest moon', lightingNotes: 'Green and gold wash, leaf gobo on floor, moon follow from above', stageNotes: 'Fairy lights in hair, floor-length cape, dry ice at entrance', mediaFileId: '', mediaName: '', mediaLink: '', createdAt: ago(35), updatedAt: ago(2) },
  { id: 'a-diamond', performerId: 'p-diamond', name: 'Diamonds Are Forever', aesthetic: 'Old Hollywood, white tie glamour', length: '5:00', tagline: 'Sparkle like you mean it', lightingNotes: 'Full white wash, mirror ball during bridge, pin spots on jewelry', stageNotes: 'Long gloves, rhinestone gown, staged jewelry reveal', mediaFileId: 'demo-media-diamond', mediaName: 'diamonds-are-forever.mp3', mediaLink: '', createdAt: ago(25), updatedAt: ago(1) },
  { id: 'a-encore', performerId: 'p-diamond', name: 'Curtain Call', aesthetic: 'Showstopper finale energy', length: '3:30', tagline: 'Leave them wanting more — then give them more anyway', lightingNotes: 'Full stage wash, audience lights up 50% for final pose', stageNotes: 'Group bow optional, toss roses to front row', mediaFileId: '', mediaName: '', mediaLink: '', createdAt: ago(20), updatedAt: ago(1) },
];

const shows = [
  {
    id: 's-midnight-revelry',
    title: 'Midnight Revelry',
    dateLabel: ahead(17),
    venueId: 'v-midnight',
    ticketPrice: '35',
    status: 'draft',
    lineup: [
      { key: 'seg-host', type: 'segment', title: 'Host Welcome & House Rules', length: '5:00', notes: 'Welcome the crowd, thank the venue, announce raffle rules and intermission timing.' },
      { key: 'seg-raffle', type: 'segment', title: 'Opening Raffle', length: '3:00', notes: 'Draw three raffle winners. Prizes at the merch table.' },
      { key: 'act-1', type: 'act', actId: 'a-feathers', performerId: 'p-velvet', performerName: 'Velvet Thunder', actName: 'Feathers & Fire' },
      { key: 'act-2', type: 'act', actId: 'a-cosmic', performerId: 'p-marvel', performerName: 'Miss Marvel', actName: 'Cosmic Spin' },
      { key: 'seg-intermission', type: 'segment', title: 'Intermission', length: '15:00', notes: 'Bar service. Merch table open. House lights at 50%.' },
      { key: 'act-3', type: 'act', actId: 'a-smoke', performerId: 'p-onyx', performerName: 'Onyx St. James', actName: 'Smoke & Mirrors' },
      { key: 'act-4', type: 'act', actId: 'a-foxfire', performerId: 'p-luna', performerName: 'Luna Foxx', actName: 'Foxfire' },
      { key: 'seg-game', type: 'segment', title: 'Lip Sync Battle (Audience Pick)', length: '8:00', notes: 'Host invites two audience volunteers. Winner gets a free drink ticket.' },
      { key: 'act-5', type: 'act', actId: 'a-diamond', performerId: 'p-diamond', performerName: 'Diamond Dazzle', actName: 'Diamonds Are Forever' },
      { key: 'seg-thanks', type: 'segment', title: 'Closing Thanks & Next Show Plug', length: '4:00', notes: "Thank performers by name, plug next month's show, remind merch table." },
    ],
    createdAt: ago(14),
    updatedAt: ago(2),
  },
  {
    id: 's-velvet-vinyl',
    title: 'Velvet & Vinyl',
    dateLabel: ago(38).slice(0, 10),
    venueId: 'v-redcurtain',
    ticketPrice: '28',
    status: 'closed',
    lineup: [
      { key: 'seg-open', type: 'segment', title: 'DJ Warm-Up & Host Intro', length: '6:00', notes: 'DJ spins vinyl until host takes the mic. Welcome and thank sponsors.' },
      { key: 'act-1', type: 'act', actId: 'a-midnight', performerId: 'p-velvet', performerName: 'Velvet Thunder', actName: 'Midnight in Paris' },
      { key: 'act-2', type: 'act', actId: 'a-supernova', performerId: 'p-marvel', performerName: 'Miss Marvel', actName: 'Supernova' },
      { key: 'seg-announce', type: 'segment', title: 'Birthday Shout-Outs', length: '2:00', notes: 'Read birthday list from the bar. Free shot for birthday guests.' },
      { key: 'act-3', type: 'act', actId: 'a-smoke', performerId: 'p-onyx', performerName: 'Onyx St. James', actName: 'Smoke & Mirrors' },
      { key: 'act-4', type: 'act', actId: 'a-encore', performerId: 'p-diamond', performerName: 'Diamond Dazzle', actName: 'Curtain Call' },
    ],
    closeout: {
      ticketTiers: [
        { id: 'tier-ga', label: 'General admission', price: '28', quantity: '82' },
        { id: 'tier-vip', label: 'VIP package', price: '55', quantity: '12' },
      ],
      revenues: [
        { source: 'Door cash', amount: '420' },
        { source: 'Venmo', amount: '385.50' },
        { source: 'Eventbrite', amount: '1248' },
      ],
      expenses: [
        { description: 'Venue rental', amount: '450' },
        { description: 'Props & costumes', amount: '127.50' },
        { description: 'Marketing (flyers + social ads)', amount: '85' },
        { description: 'DJ fee', amount: '150' },
      ],
      payouts: [
        { performerId: 'p-velvet', performerName: 'Velvet Thunder', amount: '175', method: 'Venmo' },
        { performerId: 'p-marvel', performerName: 'Miss Marvel', amount: '150', method: 'CashApp' },
        { performerId: 'p-onyx', performerName: 'Onyx St. James', amount: '200', method: 'PayPal' },
        { performerId: 'p-diamond', performerName: 'Diamond Dazzle', amount: '175', method: 'Venmo' },
      ],
      closedAt: ago(38),
    },
    createdAt: ago(52),
    updatedAt: ago(38),
  },
];

export const DEMO_SEED = { performers, venues, acts, shows };
