import { Destination, TravelAdvisory, LocalEvent, CarouselSlide, MunicipalProfile } from '../types';

export const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: 'vega-ancestral-house',
    name: 'Vega Ancestral House',
    category: 'Heritage & Culture',
    barangay: 'Barangay 2 (Poblacion)',
    shortDescription: 'Circa 1800s 1st-transition Bahay-na-Bato with famous sculpted "otí-ot" wooden caryatids.',
    description: `The Vega Ancestral House stands as one of the most historically significant and best-preserved Spanish-colonial residences in all of Northern Mindanao. Built in the early 19th century using ancient Philippine hardwoods—Molave (Tugas), Balayong, and Narra—the structure demonstrates early Spanish-Filipino architectural ingenuity. 

Its most iconic and unique hallmark is the presence of "otí-ot" at the structural corners: intricately hand-carved wooden figures resembling Greek Atlas or Caryatides that physically bolster the second-floor overhang. Historically linked to the prominent Vega family (including Maria Clara Vega-Jimenez, mother of renowned national media personalities Inday Badiday and Letty Jimenez Magsanoc), this storied house has hosted national figures including General Emilio Aguinaldo and President Sergio Osmeña during their official historic visits to Balingasag.`,
    heroImage: 'https://images.unsplash.com/photo-1590059390046-52bb66060c25?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590059390046-52bb66060c25?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582650625119-3a31f8418365?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      {
        time: '08:30 AM',
        activity: 'Arrival & Welcome Briefing',
        notes: 'Meet the heritage caretakers outside the historic gates near Poblacion.',
      },
      {
        time: '09:00 AM',
        activity: 'Architectural & "Otí-Ot" Inspection',
        notes: 'Examine the intricate wooden caryatid carvings and massive Molave support columns.',
      },
      {
        time: '10:00 AM',
        activity: 'Ancestral Living Quarters & Historical Gallery',
        notes: 'Walk through the second-floor salon featuring antique Capiz windows and archival photos.',
      },
      {
        time: '11:00 AM',
        activity: 'Stroll to the Surrounding Bajo de Campana Heritage Zone',
        notes: 'Short walk to the nearby public plaza and Santa Rita Parish Church.',
      },
    ],
    inclusions: [
      'Informational heritage walking tour guidelines',
      'Historical marker & photo documentation zone',
      'Strict preservation notice: please do not lean on antique woodwork or touch century-old carvings',
      'Footwear removal or foot covers provided at the entrance',
      'Strictly educational & cultural discovery (no commercial fees)',
    ],
    bestTimeToVisit: 'Morning hours (8:00 AM – 11:30 AM) or gentle afternoon light (3:00 PM – 5:00 PM)',
    howToGetThere: 'Located along the national highway / corner streets of Poblacion, Balingasag. From Cagayan de Oro Agora Terminal, ride any Butuan-bound or Balingasag bus/van (approx. 1 hour). Disembark at Balingasag Bus Terminal and take a short 2-minute trike or walk to Barangay 2.',
    contactLGU: 'Balingasag Municipal Tourism & Heritage Office - (088) 333-2005',
    coordinates: {
      lat: 8.7441,
      lng: 124.7765,
    },
    featured: true,
    createdAt: Date.now() - 1000000,
    updatedAt: Date.now() - 500000,
  },
  {
    id: 'santa-rita-de-cascia-church',
    name: 'Santa Rita de Cascia Parish Church',
    category: 'Heritage & Culture',
    barangay: 'Barangay 4 (Poblacion)',
    shortDescription: 'Centuries-old Jesuit-built church (1892-1895) anchoring the historic Bajo de Campana town layout.',
    description: `Constructed under the spiritual direction of Spanish Jesuit missionaries between 1892 and 1895, the Santa Rita de Cascia Parish Church (also known as the Balingasag Church) is an enduring monument of Catholic faith and colonial architecture in Northern Mindanao. 

Built in the classical barn-style Romanesque-Baroque transition with thick brickwork foundations, coral stone remnants, and heavy timber trusses, the church serves as the spiritual epicenter of Balingasag. It anchors the municipality’s traditional "bajo de campana" (under the sound of the bell) layout, facing the municipal plaza and surrounded by century-old acacia trees. The parish holds the sacred feast of St. Rita of Cascia every May 22, drawing pilgrims from across the archipelago.`,
    heroImage: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      {
        time: '07:30 AM',
        activity: 'Morning Holy Mass / Solemn Church Visit',
        notes: 'Experience liturgical worship in the heritage sanctuary.',
      },
      {
        time: '08:45 AM',
        activity: 'Brick Façade & Jesuit Historical Markers',
        notes: 'Inspect the exposed Spanish clay bricks and centenary bell tower.',
      },
      {
        time: '09:30 AM',
        activity: 'Centennial Acacia Trees Walk',
        notes: 'Rest in the shade of the parish courtyard and plaza grounds.',
      },
    ],
    inclusions: [
      'Open to public pilgrims and architectural enthusiasts daily',
      'Modest and respectful attire requested within the sacred prayer sanctuary',
      'Photography permitted in exterior courtyards and outside holy mass hours',
      'Wheelchair-accessible ground level entry ramp',
    ],
    bestTimeToVisit: 'Daily 6:00 AM – 6:00 PM; vibrant during Sunday services and the May 22 patronal fiesta',
    howToGetThere: 'Located in the heart of Poblacion across the Balingasag Municipal Hall and Plaza. Easily reachable by tricycle from any terminal in town.',
    contactLGU: 'Parish Pastoral Council & Municipal Tourism Office',
    coordinates: {
      lat: 8.7423,
      lng: 124.7758,
    },
    featured: true,
    createdAt: Date.now() - 950000,
    updatedAt: Date.now() - 480000,
  },
  {
    id: 'balingasag-baywalk-boardwalk',
    name: 'Balingasag Coastal Baywalk & Boardwalk',
    category: 'Coastal & Marine',
    barangay: 'Baliwagan',
    shortDescription: 'Scenic waterfront boulevard along Macajalar Bay with panoramic views of Camiguin Island.',
    description: `The Balingasag Coastal Baywalk stretches gracefully along the shoreline of Barangay Baliwagan and adjacent Poblacion waters, offering panoramic vistas across the sapphire waters of Macajalar Bay. On clear mornings and golden afternoons, travelers can view the majestic volcanic silhouettes of Camiguin Island across the sea.

The baywalk is a beloved civic landmark where locals and visitors gather to savor the sea breeze, watch returning colorful bancas (outrigger boats) laden with fresh daily catch, and enjoy the sunset. The paved boulevard features landscaped seating, solar illumination, and an evening street food hub where regional seafood snacks and cold treats are shared in a friendly community setting.`,
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      {
        time: '04:30 PM',
        activity: 'Coastal Promenade & Jogging',
        notes: 'Take an invigorating walk along the paved seawall promenade.',
      },
      {
        time: '05:30 PM',
        activity: 'Golden Hour Sunset & Camiguin Viewing',
        notes: 'Capture breathtaking sunset photography over Macajalar Bay.',
      },
      {
        time: '06:30 PM',
        activity: 'Evening Plaza Food & Sea Breeze Relaxation',
        notes: 'Relax under the lamp posts and taste fresh local snacks.',
      },
    ],
    inclusions: [
      '24/7 public recreational access',
      'Clean As You Go (CLAYGO) environmental waste stations',
      'Solar-lit security pathways and public benches',
      'Bicycle friendly designated lane',
    ],
    bestTimeToVisit: 'Late afternoon from 4:30 PM to 7:00 PM for optimal sunset and cool breeze',
    howToGetThere: 'Head west from Poblacion center straight down to the coast along the Baliwagan coastal road. 3 minutes via tricycle from bus terminal.',
    contactLGU: 'Balingasag Coastal Resource Management Office',
    coordinates: {
      lat: 8.7465,
      lng: 124.7689,
    },
    featured: true,
    createdAt: Date.now() - 900000,
    updatedAt: Date.now() - 450000,
  },
  {
    id: 'camuayan-waterfalls-springs',
    name: 'Camuayan Natural Cold Springs',
    category: 'Eco Parks & Springs',
    barangay: 'Camuayan',
    shortDescription: 'Refreshing mountain cold springs with crystal clear natural pools nestled in lush tropical highlands.',
    description: `Tucked within the verdant upland terrain of Barangay Camuayan, Camuayan Cold Springs is an unspoiled natural sanctuary fed by pristine mountain aquifers. The cool, emerald-tinged freshwater flows naturally into wide, shaded basins ideal for refreshing swims on warm tropical days.

Surrounded by wild ferns, fruit trees, and forest canopies, this sanctuary offers nature lovers a tranquil retreat far from urban noise. The natural cold spring waters have a rejuvenating chill, staying crystal clear throughout the dry months. Community-maintained walking trails provide an easy-to-moderate eco-hike through picturesque rural landscapes.`,
    heroImage: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      {
        time: '08:30 AM',
        activity: 'Highland Scenic Drive & Barangay Registration',
        notes: 'Brief safety log-in at Barangay Camuayan outpost.',
      },
      {
        time: '09:00 AM',
        activity: 'Eco-Trek through Coconut and Fern Groves',
        notes: 'Scenic 15-minute walk along the forested mountain trail.',
      },
      {
        time: '09:30 AM',
        activity: 'Swimming & Cold Spring Hydrotherapy',
        notes: 'Immerse in the invigorating natural mountain spring water.',
      },
      {
        time: '11:45 AM',
        activity: 'Riverside Relaxation & Eco-Packup',
        notes: 'Strict observance of "Leave No Trace" wilderness etiquette.',
      },
    ],
    inclusions: [
      'Nature trail safety pointers and route signage',
      'Natural freshwater spring swimming access',
      'Water safety guidelines: non-swimmers must remain in shallow natural pools',
      'Zero-plastic wilderness protection mandate',
    ],
    bestTimeToVisit: 'Morning between 8:00 AM and 12:00 PM during dry or moderately sunny weather',
    howToGetThere: 'From Poblacion Balingasag, hire a local habal-habal motorcycle or drive inland along the Balingasag-Camuayan municipal road (approx. 20-25 minutes). Signboards point towards the jump-off point.',
    contactLGU: 'Camuayan Barangay Tourism Desk & MDRRMO Balingasag',
    coordinates: {
      lat: 8.7612,
      lng: 124.8124,
    },
    featured: true,
    createdAt: Date.now() - 850000,
    updatedAt: Date.now() - 400000,
  },
  {
    id: 'punta-gorda-lighthouse',
    name: 'Punta Gorda Historical Lighthouse',
    category: 'Coastal & Marine',
    barangay: 'Hermano',
    shortDescription: 'Historic navigational beacon and scenic coastal lookout over Macajalar Bay and Bohol Sea.',
    description: `Positioned strategically on the prominent headland of Barangay Hermano, the Punta Gorda Lighthouse has guided coastal freighters, inter-island ferries, and local fisherfolk for generations. The lighthouse overlooks the outer mouth of Macajalar Bay as it transitions into the Bohol Sea.

Visitors enjoy panoramic views of breaking waves against rugged headland rocks, sea breezes, and open horizon sweeps. It is a favored stopover for road-trippers traveling the coastal highway connecting Cagayan de Oro to eastern Misamis Oriental and Butuan City.`,
    heroImage: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      {
        time: '10:00 AM',
        activity: 'Scenic Coastal Highway Arrival',
        notes: 'Pull into the Hermano headland rest stop.',
      },
      {
        time: '10:15 AM',
        activity: 'Lighthouse Grounds & Horizon View',
        notes: 'Panoramic lookout across the open waters toward Camiguin and Bohol.',
      },
      {
        time: '11:00 AM',
        activity: 'Coastal Marine Photography',
        notes: 'Capture coastal cliffs, passing boats, and maritime scenery.',
      },
    ],
    inclusions: [
      'Scenic lookout viewpoint',
      'Informational maritime history signage',
      'Highway roadside parking area',
      'Caution: steep rocky cliffs, please remain within designated viewing rails',
    ],
    bestTimeToVisit: 'Early morning for sunrise over coastal cliffs, or late afternoon for sunset winds',
    howToGetThere: 'Situated along the Butuan-Cagayan de Oro-Iligan Highway (BCIR) in Barangay Hermano, approximately 7 km north of Poblacion Balingasag. Accessible by all public buses and private vehicles.',
    contactLGU: 'Philippine Coast Guard Auxiliary / Balingasag Tourism',
    coordinates: {
      lat: 8.7891,
      lng: 124.7712,
    },
    featured: false,
    createdAt: Date.now() - 800000,
    updatedAt: Date.now() - 350000,
  },
  {
    id: 'mahayahay-waterfalls-busay',
    name: 'Mahayahay Falls & Busay Eco-Trail',
    category: 'Nature & Waterfalls',
    barangay: 'Waterfall',
    shortDescription: 'The namesake natural cataract of Barangay Waterfall featuring wild mountain chutes and forest pools.',
    description: `Barangay Waterfall earned its distinctive municipal name from the cluster of cascades nestled in its mountain backcountry, led by the Mahayahay Falls and the Busay Rapids. Flowing through basalt rock formations and deep tropical jungle, the waterfalls deliver an exhilarating wilderness experience.

The trail begins among upland farms where locals cultivate bananas, abaca, and root crops before entering dense forest canopy. The final basin is sheltered by mossy cliffs where clear mountain water provides an invigorating cold swim. It is an ideal eco-adventure for hikers and outdoor enthusiasts seeking untouched natural landscapes.`,
    heroImage: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      {
        time: '07:30 AM',
        activity: 'Barangay Waterfall Eco-Registration',
        notes: 'Register at the Barangay Hall; coordinate with local community trail guides.',
      },
      {
        time: '08:00 AM',
        activity: 'Forest Trek & River Crossing',
        notes: 'Follow the river trail under tropical forest shade.',
      },
      {
        time: '09:00 AM',
        activity: 'Mahayahay Main Falls & Swimming',
        notes: 'Enjoy the natural mountain pool and rock cascade.',
      },
      {
        time: '11:30 AM',
        activity: 'Return Hike & Local Refreshments',
        notes: 'Rest at the barangay center with fresh young coconut water.',
      },
    ],
    inclusions: [
      'Eco-trekking safety orientation',
      'Natural cataract and swimming basin access',
      'Dry bag strongly advised for smartphones and cameras',
      'Moderate physical fitness advised for river crossings',
    ],
    bestTimeToVisit: 'Dry season mornings (November through May). Avoid during heavy continuous rainfall.',
    howToGetThere: 'From Poblacion Balingasag, take a habal-habal motorcycle uphill toward Barangay Waterfall (approx. 30 minutes). Follow signs to the Barangay Hall jump-off.',
    contactLGU: 'Barangay Waterfall Council / Balingasag MDRRMO',
    coordinates: {
      lat: 8.7234,
      lng: 124.8456,
    },
    featured: false,
    createdAt: Date.now() - 750000,
    updatedAt: Date.now() - 300000,
  },
  {
    id: 'madelines-park-san-isidro',
    name: "Madeline's Park and Botanical Gardens",
    category: 'Eco Parks & Springs',
    barangay: 'San Isidro',
    shortDescription: 'Lush upland botanical sanctuary featuring freshwater ponds, shaded gazebos, and landscape gardens.',
    description: `Situated in the cool, rolling hills of Barangay San Isidro, Madeline’s Park is an inland eco-leisure sanctuary known for its colorful flora, landscaped bridges, natural freshwater fishponds, and serene mountain backdrop. 

Designed for gentle leisure, nature contemplation, and family outings, the park features winding stone walkways lined with bougainvilleas, orchids, and tropical palms. Gentle mountain springs feed its scenic ponds, creating a micro-climate noticeably cooler than the coastal lowlands.`,
    heroImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      {
        time: '09:00 AM',
        activity: 'Botanical Walk & Garden Bridges',
        notes: 'Explore landscaped terraces and vibrant endemic flower gardens.',
      },
      {
        time: '10:15 AM',
        activity: 'Freshwater Pond & Fish Observation',
        notes: 'Relax beside the spring-fed koi and tilapia ponds.',
      },
      {
        time: '11:30 AM',
        activity: 'Gazebo Relaxation & Mountain Breeze',
        notes: 'Unwind in traditional native pavilions overlooking the green hills.',
      },
    ],
    inclusions: [
      'Botanical garden walking trails',
      'Shaded picnic pavilions and scenic benches',
      'Photography & family leisure zones',
      'CLAYGO environmental guidelines observed at all times',
    ],
    bestTimeToVisit: 'Daily from 8:00 AM to 5:00 PM; peaceful on weekday mornings',
    howToGetThere: 'Take the eastern upland road from Balingasag Poblacion toward Barangay San Isidro (approx. 15 minutes by tricycle or car).',
    contactLGU: 'Balingasag Eco-Tourism Desk',
    coordinates: {
      lat: 8.7356,
      lng: 124.8012,
    },
    featured: false,
    createdAt: Date.now() - 700000,
    updatedAt: Date.now() - 250000,
  },
  {
    id: 'balagnan-marine-sanctuary',
    name: 'Balagnan Coastal Marine Sanctuary & Mangrove Boardwalk',
    category: 'Coastal & Marine',
    barangay: 'Balagnan',
    shortDescription: 'Protected coastal mangrove ecosystem preserving rich marine biodiversity and coastal avian life.',
    description: `The Balagnan Coastal Marine Sanctuary represents Balingasag's grassroots commitment to marine conservation. Located along the calm shores of Barangay Balagnan, this protected ecosystem comprises expansive mangrove forests (Bakauan) that serve as critical breeding grounds for fish, mud crabs, and coastal bird species.

An elevated eco-boardwalk weaves through the thick mangrove canopy, allowing travelers to witness marine nurseries, fiddler crabs scuttling on the tidal mudflats, and egrets nesting overhead without disrupting the fragile habitat. Local fisherfolk organizations collaborate with the municipal government to maintain strict marine sanctuary protections.`,
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      {
        time: '07:00 AM',
        activity: 'High Tide Mangrove Boardwalk Tour',
        notes: 'Walk along the shaded wooden boardwalk over the tidal mangrove waters.',
      },
      {
        time: '08:15 AM',
        activity: 'Bird Watching & Marine Biology Briefing',
        notes: 'Spot migratory coastal birds and learn about local coral rehabilitation.',
      },
      {
        time: '09:30 AM',
        activity: 'Fisherfolk Community Dialogue',
        notes: 'Discover how the community protects Macajalar Bay fisheries.',
      },
    ],
    inclusions: [
      'Elevated wooden boardwalk access',
      'Marine conservation educational boards',
      'Sun hat and UV protection recommended',
      'Strict zero-disturbance policy for marine and avian wildlife',
    ],
    bestTimeToVisit: 'Early morning during morning high tide for optimal bird activity and calm waters',
    howToGetThere: 'Head southward along the coast from Balingasag town proper toward Barangay Balagnan (approx. 10 minutes by tricycle).',
    contactLGU: 'Balingasag FARMC & MENRO Office',
    coordinates: {
      lat: 8.7189,
      lng: 124.7645,
    },
    featured: false,
    createdAt: Date.now() - 650000,
    updatedAt: Date.now() - 200000,
  },
  {
    id: 'casa-amante-tablea-farm',
    name: 'CASA Amante Traditional Tablea & Agro-Heritage Farm',
    category: 'Agro-Tourism & Delicacies',
    barangay: 'Quezon',
    shortDescription: 'Authentic Balingasag native cacao farm producing traditional stone-ground Tablea for rich Sikwate.',
    description: `Balingasag has a rich agricultural legacy of heirloom Criollo and Trinitario cacao varieties, celebrated at the CASA Amante Traditional Tablea and Agro-Heritage Farm in Barangay Quezon. Here, pure chocolate production is preserved as an artisanal cultural tradition passed down through generations.

Travelers can walk among mature cacao trees, witness the multi-day fermentation and sun-drying process, and observe the traditional wood-fired roasting and stone grinding into rich, aromatic cacao discs (Tablea). The farm is a premier destination for experiencing authentic Filipino "Sikwate" (pure hot chocolate) paired with native rice delicacies.`,
    heroImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      {
        time: '01:30 PM',
        activity: 'Cacao Orchard Walk',
        notes: 'Identify ripe cacao pods and learn sustainable organic farming practices.',
      },
      {
        time: '02:15 PM',
        activity: 'Artisanal Roasting & Stone-Grinding Demo',
        notes: 'Watch raw cacao beans transformed into aromatic 100% pure Tablea disks.',
      },
      {
        time: '03:00 PM',
        activity: 'Traditional Sikwate Frothing & Tasting',
        notes: 'Enjoy authentic hot Sikwate whipped with a wooden batirol.',
      },
    ],
    inclusions: [
      'Agro-tourism farm walk and cacao processing demonstration',
      'Sikwate tasting experience with native pairings',
      'Farm-gate authentic tablea souvenir corner',
      'Covered demonstration pavilion',
    ],
    bestTimeToVisit: 'Afternoon sessions (1:00 PM – 4:00 PM) Tuesday through Sunday',
    howToGetThere: 'Located in Barangay Quezon, 10 minutes east from Balingasag town center via municipal road. Accessible by tricycle or private vehicle.',
    contactLGU: 'Balingasag Municipal Agriculture & Tourism Office',
    coordinates: {
      lat: 8.7501,
      lng: 124.7954,
    },
    featured: true,
    createdAt: Date.now() - 600000,
    updatedAt: Date.now() - 150000,
  },
  {
    id: 'balingasag-plaza-bajo-de-campana',
    name: 'Balingasag Municipal Plaza & Bajo de Campana Heritage Park',
    category: 'Heritage & Culture',
    barangay: 'Barangay 1 (Poblacion)',
    shortDescription: 'Historic Spanish colonial town center with centenary acacia trees, civic monuments, and plaza.',
    description: `The Balingasag Municipal Plaza represents the classic Spanish colonial "bajo de campana" town planning layout, where civic administration, spiritual life, and commerce coalesced within the sound radius of the church bell. 

Shaded by colossal, century-old acacia trees planted during the turn of the 20th century, the plaza features stone pathways, monuments honoring local forebears, the historic municipal hall, and open civic spaces. It serves as the primary stage for municipal cultural festivals, street dancing exhibitions, and community assemblies.`,
    heroImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
    ],
    itinerary: [
      {
        time: '04:00 PM',
        activity: 'Centennial Acacia Walk & Heritage Monuments',
        notes: 'Explore civic monuments and admire the massive umbrella acacias.',
      },
      {
        time: '04:45 PM',
        activity: 'Civic Architecture Photo Walk',
        notes: 'View the Municipal Hall and the historic surrounding streetscape.',
      },
      {
        time: '05:30 PM',
        activity: 'Community Sunset Gathering',
        notes: 'Join locals in the vibrant town plaza as evening lamps illuminate.',
      },
    ],
    inclusions: [
      'Open public civic park 24/7',
      'Free community Wi-Fi zone',
      'Illuminated night pathways and shaded benches',
      'Wheelchair friendly level walkways',
    ],
    bestTimeToVisit: '4:00 PM onwards for cool afternoon breezes and illuminated evenings',
    howToGetThere: 'Center of Poblacion Balingasag, directly adjacent to the Municipal Hall and Church.',
    contactLGU: 'Balingasag Mayor’s Office & Tourism Division',
    coordinates: {
      lat: 8.7431,
      lng: 124.7749,
    },
    featured: false,
    createdAt: Date.now() - 550000,
    updatedAt: Date.now() - 100000,
  },
];

export const INITIAL_ADVISORIES: TravelAdvisory[] = [
  {
    id: 'advisory-1',
    title: 'Sunny Coastal Weather & Calm Seas across Macajalar Bay',
    severity: 'info',
    message: 'Ideal conditions for coastal boardwalk strolls, marine sanctuary visits in Balagnan, and sunset viewing. Low tides expected in mid-afternoon.',
    issuedBy: 'MDRRMO Balingasag / LGU Tourism Desk',
    date: 'Current Update',
    isActive: true,
    createdAt: Date.now() - 400000,
  },
  {
    id: 'advisory-2',
    title: 'Mountain Trail Eco-Trek Guidelines for Camuayan Springs',
    severity: 'advisory',
    message: 'Visitors heading to Camuayan Cold Springs are advised to register at the Barangay Hall and coordinate with community trail guides. Wear non-slip footwear.',
    issuedBy: 'Barangay Camuayan Tourism Committee',
    date: 'Active Notice',
    isActive: true,
    createdAt: Date.now() - 300000,
  },
  {
    id: 'advisory-3',
    title: 'Heritage Zone Preservation & Zero-Litter Mandate',
    severity: 'info',
    message: 'Strict preservation notice in Poblacion heritage buildings including Vega Ancestral House and Santa Rita Church. Clean As You Go (CLAYGO) is strictly enforced in all 30 barangays.',
    issuedBy: 'MENRO & Municipal Tourism Office',
    date: 'Standing Advisory',
    isActive: true,
    createdAt: Date.now() - 200000,
  },
];

export const INITIAL_EVENTS: LocalEvent[] = [
  {
    id: 'event-1',
    title: 'Lambangus Festival 2026',
    category: 'Festival',
    date: 'May 15 – 22, 2026',
    time: 'Whole Day Festivities',
    location: 'Balingasag Municipal Plaza & Poblacion Streets',
    barangay: 'Barangay 1 (Poblacion)',
    description: 'The premier annual cultural festival of Balingasag celebrating the bounty of milkfish (Bangus) and the town’s maritime heritage with colorful street dancing, grand civic parade, agro-fair, and trade exhibits.',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    organizer: 'LGU Balingasag & Lambangus Executive Committee',
    createdAt: Date.now() - 500000,
  },
  {
    id: 'event-2',
    title: 'Feast Day of Santa Rita de Cascia',
    category: 'Cultural',
    date: 'May 22, 2026',
    time: '6:00 AM – 8:00 PM',
    location: 'Santa Rita de Cascia Parish Church',
    barangay: 'Barangay 4 (Poblacion)',
    description: 'Solemn patronal feast honoring St. Rita of Cascia, the patron saint of impossible causes. Features dawn rosary, concelebrated pontifical mass, floral offerings, and parish procession around the bajo de campana town square.',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&w=1200&q=80',
    organizer: 'Santa Rita de Cascia Parish Pastoral Council',
    createdAt: Date.now() - 400000,
  },
  {
    id: 'event-3',
    title: 'Sakay-Sakay Fluvial Festival & Sto. Niño Diyandi',
    category: 'Festival',
    date: 'Third Weekend of January',
    time: '6:00 AM Fluvial Parade',
    location: 'Baliwagan Coast & Macajalar Bay Sea Route',
    barangay: 'Baliwagan',
    description: 'A vibrant fluvial celebration where the holy image of Sto. Niño sails across Macajalar Bay in a decorated flotilla of fishing boats, accompanied by indigenous Higaonon music, Sinulog dances, and marine blessing rituals.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    organizer: 'Balingasag Fluvial Fisherfolk Association & LGU',
    createdAt: Date.now() - 300000,
  },
  {
    id: 'event-4',
    title: 'Balingasag Agro-Heritage Fair & CASA Amante Tablea Showcase',
    category: 'Eco-Tourism',
    date: 'December 10 – 16, 2026',
    time: '8:00 AM – 9:00 PM Daily',
    location: 'Balingasag Boulevard Grounds',
    barangay: 'Baliwagan',
    description: 'Showcasing authentic local products from all 30 barangays: pure native cacao tablea, dried danggit, coastal crafts, fresh upland vegetables, and traditional delicacies.',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80',
    organizer: 'Municipal Agriculture Office & DTI Misamis Oriental',
    createdAt: Date.now() - 200000,
  },
];

export const INITIAL_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-vega',
    title: 'Vega Ancestral House',
    subtitle: 'Circa 1800s Spanish Bahay-na-Bato with Hand-Carved Otí-Ot',
    imageUrl: 'https://images.unsplash.com/photo-1590059390046-52bb66060c25?auto=format&fit=crop&w=1920&q=85',
    order: 1,
    isActive: true,
    createdAt: Date.now() - 500000,
  },
  {
    id: 'slide-church',
    title: 'Santa Rita de Cascia Parish Church',
    subtitle: 'Jesuit Brickwork Sanctuary Built 1892 • Bajo de Campana Center',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&w=1920&q=85',
    order: 2,
    isActive: true,
    createdAt: Date.now() - 400000,
  },
  {
    id: 'slide-falls',
    title: 'Camuayan Natural Cold Springs',
    subtitle: 'Refreshing Mountain Springs & Pristine Aquifers of Mt. Balatukan Ridges',
    imageUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1920&q=85',
    order: 3,
    isActive: true,
    createdAt: Date.now() - 300000,
  },
  {
    id: 'slide-baywalk',
    title: 'Macajalar Baywalk & Coastal Boulevard',
    subtitle: 'Scenic Coastal Sunset Vistas Overlooking Camiguin Island',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=85',
    order: 4,
    isActive: true,
    createdAt: Date.now() - 200000,
  },
  {
    id: 'slide-balagnan',
    title: 'Balagnan Marine Sanctuary & Mangrove Lagoon',
    subtitle: 'Protected Coastal Reefs & Thriving Eco-Park in Macajalar Bay',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=85',
    order: 5,
    isActive: true,
    createdAt: Date.now() - 100000,
  },
];

export const INITIAL_MUNICIPAL_PROFILE: MunicipalProfile = {
  barangaysCount: 30,
  urbanCount: 6,
  urbanizingCount: 11,
  ruralCount: 13,
  population: 74385,
  populationYear: '2020 Census',
  populationProvinceShare: '7.77% of Misamis Oriental',
  populationRegionShare: '1.48% of Northern Mindanao (Region X)',
  landAreaHectares: 18235.36,
  landAreaDescription: 'Coast to Highland Ridges',
  headlineTitle: 'Balingasag at a Glance',
  headlineSubtitle: 'A 1st-class coastal municipality in Eastern Misamis Oriental blending deep Spanish colonial roots, maritime livelihoods, and expansive upland watersheds.',
  spanishHeritageNote: 'Centrally organized under Spanish Bajo de Campana',
  psaCertifiedNote: 'Philippine Statistics Authority (PSA) Certified',
  updatedAt: Date.now(),
};
