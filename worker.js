/* PokePanion worker — serves the static site and the community-meta API.
   Routes:
     POST /api/log   body: {mons:[{species, ability?, item?, nature?, moves?[]}]}
     GET  /api/meta  ?days=30  → aggregated community snapshot
   Everything else falls through to static assets. */

const SPECIES = new Set(["Abomasnow", "Abomasnow-Mega", "Abra", "Absol", "Absol-Mega", "Absol-Mega-Z", "Accelgor", "Aegislash-Blade", "Aegislash-Shield", "Aerodactyl", "Aerodactyl-Mega", "Aggron", "Aggron-Mega", "Aipom", "Alakazam", "Alakazam-Mega", "Alcremie", "Alomomola", "Altaria", "Altaria-Mega", "Amaura", "Ambipom", "Amoonguss", "Ampharos", "Ampharos-Mega", "Annihilape", "Anorith", "Appletun", "Applin", "Araquanid", "Arbok", "Arboliva", "Arcanine", "Arcanine-Hisui", "Arceus", "Archaludon", "Archen", "Archeops", "Arctibax", "Arctovish", "Arctozolt", "Ariados", "Armaldo", "Armarouge", "Aromatisse", "Aron", "Arrokuda", "Articuno", "Articuno-Galar", "Audino", "Audino-Mega", "Aurorus", "Avalugg", "Avalugg-Hisui", "Axew", "Azelf", "Azumarill", "Azurill", "Bagon", "Baltoy", "Banette", "Banette-Mega", "Barbaracle", "Barbaracle-Mega", "Barboach", "Barraskewda", "Basculegion-Female", "Basculegion-Male", "Basculin", "Bastiodon", "Baxcalibur", "Baxcalibur-Mega", "Bayleef", "Beartic", "Beautifly", "Beedrill", "Beedrill-Mega", "Beheeyem", "Beldum", "Bellibolt", "Bellossom", "Bellsprout", "Bergmite", "Bewear", "Bibarel", "Bidoof", "Binacle", "Bisharp", "Blacephalon", "Blastoise", "Blastoise-Mega", "Blaziken", "Blaziken-Mega", "Blipbug", "Blissey", "Blitzle", "Boldore", "Boltund", "Bombirdier", "Bonsly", "Bouffalant", "Bounsweet", "Braixen", "Brambleghast", "Bramblin", "Braviary", "Braviary-Hisui", "Breloom", "Brionne", "Bronzong", "Bronzor", "Brute Bonnet", "Bruxish", "Budew", "Buizel", "Bulbasaur", "Buneary", "Bunnelby", "Burmy", "Butterfree", "Buzzwole", "Cacnea", "Cacturne", "Calyrex", "Calyrex-Ice", "Calyrex-Shadow", "Camerupt", "Camerupt-Mega", "Capsakid", "Carbink", "Carkol", "Carnivine", "Carracosta", "Carvanha", "Cascoon", "Castform", "Castform-Rainy", "Castform-Snowy", "Castform-Sunny", "Caterpie", "Celebi", "Celesteela", "Centiskorch", "Ceruledge", "Cetitan", "Cetoddle", "Chandelure", "Chandelure-Mega", "Chansey", "Charcadet", "Charizard", "Charizard-Mega-X", "Charizard-Mega-Y", "Charjabug", "Charmander", "Charmeleon", "Chatot", "Cherrim", "Cherubi", "Chesnaught", "Chesnaught-Mega", "Chespin", "Chewtle", "Chi-Yu", "Chien-Pao", "Chikorita", "Chimchar", "Chimecho", "Chimecho-Mega", "Chinchou", "Chingling", "Cinccino", "Cinderace", "Clamperl", "Clauncher", "Clawitzer", "Claydol", "Clefable", "Clefable-Mega", "Clefairy", "Cleffa", "Clobbopus", "Clodsire", "Cloyster", "Coalossal", "Cobalion", "Cofagrigus", "Combee", "Combusken", "Comfey", "Conkeldurr", "Copperajah", "Corphish", "Corsola", "Corsola-Galar", "Corviknight", "Corvisquire", "Cosmoem", "Cosmog", "Cottonee", "Crabominable", "Crabominable-Mega", "Crabrawler", "Cradily", "Cramorant", "Cranidos", "Crawdaunt", "Cresselia", "Croagunk", "Crobat", "Crocalor", "Croconaw", "Crustle", "Cryogonal", "Cubchoo", "Cubone", "Cufant", "Cursola", "Cutiefly", "Cyclizar", "Cyndaquil", "Dachsbun", "Darkrai", "Darkrai-Mega", "Darmanitan-Galar-Standard", "Darmanitan-Galar-Zen", "Darmanitan-Standard", "Darmanitan-Zen", "Dartrix", "Darumaka", "Darumaka-Galar", "Decidueye", "Decidueye-Hisui", "Dedenne", "Deerling", "Deino", "Delcatty", "Delibird", "Delphox", "Delphox-Mega", "Deoxys-Attack", "Deoxys-Defense", "Deoxys-Normal", "Deoxys-Speed", "Dewgong", "Dewott", "Dewpider", "Dhelmise", "Dialga", "Dialga-Origin", "Diancie", "Diancie-Mega", "Diggersby", "Diglett", "Diglett-Alola", "Dipplin", "Ditto", "Dodrio", "Doduo", "Dolliv", "Dondozo", "Donphan", "Dottler", "Doublade", "Dracovish", "Dracozolt", "Dragalge", "Dragalge-Mega", "Dragapult", "Dragonair", "Dragonite", "Dragonite-Mega", "Drakloak", "Drampa", "Drampa-Mega", "Drapion", "Dratini", "Drednaw", "Dreepy", "Drifblim", "Drifloon", "Drilbur", "Drizzile", "Drowzee", "Druddigon", "Dubwool", "Ducklett", "Dudunsparce", "Dugtrio", "Dugtrio-Alola", "Dunsparce", "Duosion", "Duraludon", "Durant", "Dusclops", "Dusknoir", "Duskull", "Dustox", "Dwebble", "Eelektrik", "Eelektross", "Eelektross-Mega", "Eevee", "Eiscue-Ice", "Eiscue-Noice", "Ekans", "Eldegoss", "Electabuzz", "Electivire", "Electrike", "Electrode", "Electrode-Hisui", "Elekid", "Elgyem", "Emboar", "Emboar-Mega", "Emolga", "Empoleon", "Enamorus-Incarnate", "Enamorus-Therian", "Entei", "Escavalier", "Espathra", "Espeon", "Espurr", "Eternatus", "Excadrill", "Excadrill-Mega", "Exeggcute", "Exeggutor", "Exeggutor-Alola", "Exploud", "Falinks", "Falinks-Mega", "Farfetch'd", "Farfetch'd-Galar", "Farigiraf", "Fearow", "Feebas", "Fennekin", "Feraligatr", "Feraligatr-Mega", "Ferroseed", "Ferrothorn", "Fezandipiti", "Fidough", "Finizen", "Finneon", "Flaaffy", "Flabébé", "Flamigo", "Flapple", "Flareon", "Fletchinder", "Fletchling", "Flittle", "Floatzel", "Floette-Eternal", "Floette-Mega", "Floragato", "Florges", "Flutter Mane", "Flygon", "Fomantis", "Foongus", "Forretress", "Fraxure", "Frigibax", "Frillish-Male", "Froakie", "Frogadier", "Froslass", "Froslass-Mega", "Frosmoth", "Fuecoco", "Furfrou", "Furret", "Gabite", "Gallade", "Gallade-Mega", "Galvantula", "Garbodor", "Garchomp", "Garchomp-Mega", "Garchomp-Mega-Z", "Gardevoir", "Gardevoir-Mega", "Garganacl", "Gastly", "Gastrodon", "Genesect", "Gengar", "Gengar-Mega", "Geodude", "Geodude-Alola", "Gholdengo", "Gible", "Gigalith", "Gimmighoul", "Gimmighoul-Roaming", "Girafarig", "Giratina-Altered", "Giratina-Origin", "Glaceon", "Glalie", "Glalie-Mega", "Glameow", "Glastrier", "Gligar", "Glimmet", "Glimmora", "Glimmora-Mega", "Gliscor", "Gloom", "Gogoat", "Golbat", "Goldeen", "Golduck", "Golem", "Golem-Alola", "Golett", "Golisopod", "Golisopod-Mega", "Golurk", "Golurk-Mega", "Goodra", "Goodra-Hisui", "Goomy", "Gorebyss", "Gossifleur", "Gothita", "Gothitelle", "Gothorita", "Gouging Fire", "Gourgeist-Average", "Gourgeist-Large", "Gourgeist-Small", "Gourgeist-Super", "Grafaiai", "Granbull", "Grapploct", "Graveler", "Graveler-Alola", "Great Tusk", "Greavard", "Greedent", "Greninja", "Greninja-Ash", "Greninja-Mega", "Grimer", "Grimer-Alola", "Grimmsnarl", "Grookey", "Grotle", "Groudon", "Groudon-Primal", "Grovyle", "Growlithe", "Growlithe-Hisui", "Grubbin", "Grumpig", "Gulpin", "Gumshoos", "Gurdurr", "Guzzlord", "Gyarados", "Gyarados-Mega", "Hakamo-o", "Happiny", "Hariyama", "Hatenna", "Hatterene", "Hattrem", "Haunter", "Hawlucha", "Hawlucha-Mega", "Haxorus", "Heatmor", "Heatran", "Heatran-Mega", "Heliolisk", "Helioptile", "Heracross", "Heracross-Mega", "Herdier", "Hippopotas", "Hippowdon", "Hitmonchan", "Hitmonlee", "Hitmontop", "Ho-Oh", "Honchkrow", "Honedge", "Hoopa", "Hoopa-Unbound", "Hoothoot", "Hoppip", "Horsea", "Houndoom", "Houndoom-Mega", "Houndour", "Houndstone", "Huntail", "Hydrapple", "Hydreigon", "Hypno", "Igglybuff", "Illumise", "Impidimp", "Incineroar", "Indeedee-Female", "Indeedee-Male", "Infernape", "Inkay", "Inteleon", "Iron Boulder", "Iron Bundle", "Iron Crown", "Iron Hands", "Iron Jugulis", "Iron Leaves", "Iron Moth", "Iron Thorns", "Iron Treads", "Iron Valiant", "Ivysaur", "Jangmo-o", "Jellicent-Male", "Jigglypuff", "Jirachi", "Jolteon", "Joltik", "Jumpluff", "Jynx", "Kabuto", "Kabutops", "Kadabra", "Kakuna", "Kangaskhan", "Kangaskhan-Mega", "Karrablast", "Kartana", "Kecleon", "Keldeo", "Kilowattrel", "Kingambit", "Kingdra", "Kingler", "Kirlia", "Klang", "Klawf", "Kleavor", "Klefki", "Klink", "Klinklang", "Koffing", "Komala", "Kommo-o", "Koraidon", "Krabby", "Kricketot", "Kricketune", "Krokorok", "Krookodile", "Kubfu", "Kyogre", "Kyogre-Primal", "Kyurem", "Kyurem-Black", "Kyurem-White", "Lairon", "Lampent", "Landorus-Incarnate", "Landorus-Therian", "Lanturn", "Lapras", "Larvesta", "Larvitar", "Latias", "Latias-Mega", "Latios", "Latios-Mega", "Leafeon", "Leavanny", "Lechonk", "Ledian", "Ledyba", "Lickilicky", "Lickitung", "Liepard", "Lileep", "Lilligant", "Lilligant-Hisui", "Lillipup", "Linoone", "Linoone-Galar", "Litleo", "Litten", "Litwick", "Lokix", "Lombre", "Lopunny", "Lopunny-Mega", "Lotad", "Loudred", "Lucario", "Lucario-Mega", "Lucario-Mega-Z", "Ludicolo", "Lugia", "Lumineon", "Lunala", "Lunatone", "Lurantis", "Luvdisc", "Luxio", "Luxray", "Lycanroc-Dusk", "Lycanroc-Midday", "Lycanroc-Midnight", "Mabosstiff", "Machamp", "Machoke", "Machop", "Magby", "Magcargo", "Magearna", "Magearna-Mega", "Magikarp", "Magmar", "Magmortar", "Magnemite", "Magneton", "Magnezone", "Makuhita", "Malamar", "Malamar-Mega", "Mamoswine", "Manaphy", "Mandibuzz", "Manectric", "Manectric-Mega", "Mankey", "Mantine", "Mantyke", "Maractus", "Mareanie", "Mareep", "Marill", "Marowak", "Marowak-Alola", "Marshadow", "Marshtomp", "Maschiff", "Masquerain", "Maushold", "Mawile", "Mawile-Mega", "Medicham", "Medicham-Mega", "Meditite", "Meganium", "Meganium-Mega", "Melmetal", "Meloetta-Aria", "Meloetta-Pirouette", "Meltan", "Meowscarada", "Meowstic-Female", "Meowstic-Male", "Meowstic-Male-Mega", "Meowth", "Meowth-Alola", "Meowth-Galar", "Mesprit", "Metagross", "Metagross-Mega", "Metang", "Metapod", "Mew", "Mewtwo", "Mewtwo-Mega-X", "Mewtwo-Mega-Y", "Mienfoo", "Mienshao", "Mightyena", "Milcery", "Milotic", "Miltank", "Mime Jr.", "Mimikyu", "Minccino", "Minior", "Minior-Red", "Minun", "Miraidon", "Misdreavus", "Mismagius", "Moltres", "Moltres-Galar", "Monferno", "Morelull", "Morgrem", "Morpeko", "Mothim", "Mr-Mime-Galar", "Mr. Mime", "Mr. Rime", "Mudbray", "Mudkip", "Mudsdale", "Muk", "Muk-Alola", "Munchlax", "Munkidori", "Munna", "Murkrow", "Musharna", "Nacli", "Naclstack", "Naganadel", "Natu", "Necrozma", "Necrozma-Dawn", "Necrozma-Dusk", "Necrozma-Ultra", "Nickit", "Nidoking", "Nidoqueen", "Nidoran♀", "Nidoran♂", "Nidorina", "Nidorino", "Nihilego", "Nincada", "Ninetales", "Ninetales-Alola", "Ninjask", "Noctowl", "Noibat", "Noivern", "Nosepass", "Numel", "Nuzleaf", "Nymble", "Obstagoon", "Octillery", "Oddish", "Ogerpon", "Ogerpon-Cornerstone-Mask", "Ogerpon-Hearthflame-Mask", "Ogerpon-Wellspring-Mask", "Oinkologne-Female", "Oinkologne-Male", "Okidogi", "Omanyte", "Omastar", "Onix", "Oranguru", "Orbeetle", "Oricorio-Baile", "Oricorio-Pau", "Oricorio-Pom-Pom", "Oricorio-Sensu", "Orthworm", "Oshawott", "Overqwil", "Pachirisu", "Palafin-Hero", "Palafin-Zero", "Palkia", "Palkia-Origin", "Palossand", "Palpitoad", "Pancham", "Pangoro", "Panpour", "Pansage", "Pansear", "Paras", "Parasect", "Passimian", "Patrat", "Pawmi", "Pawmo", "Pawmot", "Pawniard", "Pecharunt", "Pelipper", "Perrserker", "Persian", "Persian-Alola", "Petilil", "Phanpy", "Phantump", "Pheromosa", "Phione", "Pichu", "Pidgeot", "Pidgeot-Mega", "Pidgeotto", "Pidgey", "Pidove", "Pignite", "Pikachu", "Pikipek", "Piloswine", "Pincurchin", "Pineco", "Pinsir", "Pinsir-Mega", "Piplup", "Plusle", "Poipole", "Politoed", "Poliwag", "Poliwhirl", "Poliwrath", "Poltchageist", "Polteageist", "Ponyta", "Ponyta-Galar", "Poochyena", "Popplio", "Porygon", "Porygon-Z", "Porygon2", "Primarina", "Primeape", "Prinplup", "Probopass", "Psyduck", "Pumpkaboo-Average", "Pumpkaboo-Large", "Pumpkaboo-Small", "Pumpkaboo-Super", "Pupitar", "Purrloin", "Purugly", "Pyroar-Male", "Pyroar-Mega", "Pyukumuku", "Quagsire", "Quaquaval", "Quaxly", "Quaxwell", "Quilava", "Quilladin", "Qwilfish", "Qwilfish-Hisui", "Raboot", "Rabsca", "Raging Bolt", "Raichu", "Raichu-Alola", "Raichu-Mega-X", "Raichu-Mega-Y", "Raikou", "Ralts", "Rampardos", "Rapidash", "Rapidash-Galar", "Raticate", "Raticate-Alola", "Rattata", "Rattata-Alola", "Rayquaza", "Rayquaza-Mega", "Regice", "Regidrago", "Regieleki", "Regigigas", "Regirock", "Registeel", "Relicanth", "Rellor", "Remoraid", "Reshiram", "Reuniclus", "Revavroom", "Rhydon", "Rhyhorn", "Rhyperior", "Ribombee", "Rillaboom", "Riolu", "Roaring Moon", "Rockruff", "Roggenrola", "Rolycoly", "Rookidee", "Roselia", "Roserade", "Rotom", "Rotom-Fan", "Rotom-Frost", "Rotom-Heat", "Rotom-Mow", "Rotom-Wash", "Rowlet", "Rufflet", "Runerigus", "Sableye", "Sableye-Mega", "Salamence", "Salamence-Mega", "Salandit", "Salazzle", "Samurott", "Samurott-Hisui", "Sandaconda", "Sandile", "Sandshrew", "Sandshrew-Alola", "Sandslash", "Sandslash-Alola", "Sandy Shocks", "Sandygast", "Sawk", "Sawsbuck", "Scatterbug", "Sceptile", "Sceptile-Mega", "Scizor", "Scizor-Mega", "Scolipede", "Scolipede-Mega", "Scorbunny", "Scovillain", "Scovillain-Mega", "Scrafty", "Scrafty-Mega", "Scraggy", "Scream Tail", "Scyther", "Seadra", "Seaking", "Sealeo", "Seedot", "Seel", "Seismitoad", "Sentret", "Serperior", "Servine", "Seviper", "Sewaddle", "Sharpedo", "Sharpedo-Mega", "Shaymin-Land", "Shaymin-Sky", "Shedinja", "Shelgon", "Shellder", "Shellos", "Shelmet", "Shieldon", "Shiftry", "Shiinotic", "Shinx", "Shroodle", "Shroomish", "Shuckle", "Shuppet", "Sigilyph", "Silcoon", "Silicobra", "Silvally", "Simipour", "Simisage", "Simisear", "Sinistcha", "Sinistea", "Sirfetch'd", "Sizzlipede", "Skarmory", "Skarmory-Mega", "Skeledirge", "Skiddo", "Skiploom", "Skitty", "Skorupi", "Skrelp", "Skuntank", "Skwovet", "Slaking", "Slakoth", "Sliggoo", "Sliggoo-Hisui", "Slither Wing", "Slowbro", "Slowbro-Galar", "Slowbro-Mega", "Slowking", "Slowking-Galar", "Slowpoke", "Slowpoke-Galar", "Slugma", "Slurpuff", "Smeargle", "Smoliv", "Smoochum", "Sneasel", "Sneasel-Hisui", "Sneasler", "Snivy", "Snom", "Snorlax", "Snorunt", "Snover", "Snubbull", "Sobble", "Solgaleo", "Solosis", "Solrock", "Spearow", "Spectrier", "Spewpa", "Spheal", "Spidops", "Spinarak", "Spinda", "Spiritomb", "Spoink", "Sprigatito", "Spritzee", "Squawkabilly", "Squirtle", "Stakataka", "Stantler", "Staraptor", "Staraptor-Mega", "Staravia", "Starly", "Starmie", "Starmie-Mega", "Staryu", "Steelix", "Steelix-Mega", "Steenee", "Stonjourner", "Stoutland", "Stufful", "Stunfisk", "Stunfisk-Galar", "Stunky", "Sudowoodo", "Suicune", "Sunflora", "Sunkern", "Surskit", "Swablu", "Swadloon", "Swalot", "Swampert", "Swampert-Mega", "Swanna", "Swellow", "Swinub", "Swirlix", "Swoobat", "Sylveon", "Tadbulb", "Taillow", "Talonflame", "Tandemaus", "Tangela", "Tangrowth", "Tapu Bulu", "Tapu Fini", "Tapu Koko", "Tapu Lele", "Tarountula", "Tatsugiri", "Tatsugiri-Curly-Mega", "Tauros", "Tauros-Paldea-Aqua-Breed", "Tauros-Paldea-Blaze-Breed", "Tauros-Paldea-Combat-Breed", "Teddiursa", "Tentacool", "Tentacruel", "Tepig", "Terapagos", "Terapagos-Stellar", "Terapagos-Terastal", "Terrakion", "Thievul", "Throh", "Thundurus-Incarnate", "Thundurus-Therian", "Thwackey", "Timburr", "Ting-Lu", "Tinkatink", "Tinkaton", "Tinkatuff", "Tirtouga", "Toedscool", "Toedscruel", "Togedemaru", "Togekiss", "Togepi", "Togetic", "Torchic", "Torkoal", "Tornadus-Incarnate", "Tornadus-Therian", "Torracat", "Torterra", "Totodile", "Toucannon", "Toxapex", "Toxel", "Toxicroak", "Toxtricity", "Tranquill", "Trapinch", "Treecko", "Trevenant", "Tropius", "Trubbish", "Trumbeak", "Tsareena", "Turtonator", "Turtwig", "Tympole", "Tynamo", "Type: Null", "Typhlosion", "Typhlosion-Hisui", "Tyranitar", "Tyranitar-Mega", "Tyrantrum", "Tyrogue", "Tyrunt", "Umbreon", "Unfezant", "Unown", "Ursaluna", "Ursaluna-Bloodmoon", "Ursaring", "Urshifu-Rapid-Strike", "Urshifu-Single-Strike", "Uxie", "Vanillish", "Vanillite", "Vanilluxe", "Vaporeon", "Varoom", "Veluza", "Venipede", "Venomoth", "Venonat", "Venusaur", "Venusaur-Mega", "Vespiquen", "Vibrava", "Victini", "Victreebel", "Victreebel-Mega", "Vigoroth", "Vikavolt", "Vileplume", "Virizion", "Vivillon", "Volbeat", "Volcanion", "Volcarona", "Voltorb", "Voltorb-Hisui", "Vullaby", "Vulpix", "Vulpix-Alola", "Wailmer", "Wailord", "Walking Wake", "Walrein", "Wartortle", "Watchog", "Wattrel", "Weavile", "Weedle", "Weepinbell", "Weezing", "Weezing-Galar", "Whimsicott", "Whirlipede", "Whiscash", "Whismur", "Wigglytuff", "Wiglett", "Wimpod", "Wingull", "Wishiwashi-School", "Wishiwashi-Solo", "Wo-Chien", "Wobbuffet", "Woobat", "Wooloo", "Wooper", "Wooper-Paldea", "Wormadam-Plant", "Wormadam-Sandy", "Wormadam-Trash", "Wugtrio", "Wurmple", "Wynaut", "Wyrdeer", "Xatu", "Xerneas", "Xurkitree", "Yamask", "Yamask-Galar", "Yamper", "Yanma", "Yanmega", "Yungoos", "Yveltal", "Zacian", "Zacian-Crowned", "Zamazenta", "Zamazenta-Crowned", "Zangoose", "Zapdos", "Zapdos-Galar", "Zarude", "Zebstrika", "Zekrom", "Zeraora", "Zeraora-Mega", "Zigzagoon", "Zigzagoon-Galar", "Zoroark", "Zoroark-Hisui", "Zorua", "Zorua-Hisui", "Zubat", "Zweilous", "Zygarde", "Zygarde-10-Power-Construct", "Zygarde-Complete", "Zygarde-Mega"]);

const JSONH = {"content-type": "application/json", "cache-control": "no-store"};
const ok = (obj, status = 200) => new Response(JSON.stringify(obj), {status, headers: JSONH});

async function ipKey(req){
  const ip = req.headers.get("cf-connecting-ip") || "0";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("pokepanion-salt|" + ip));
  return [...new Uint8Array(buf)].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}

const clean = (v, max) => (typeof v === "string" ? v.slice(0, max).trim() : "");

async function handleLog(req, env){
  let body;
  try{ body = await req.json(); }catch(_){ return ok({error: "bad json"}, 400); }
  const mons = Array.isArray(body && body.mons) ? body.mons.slice(0, 6) : [];
  const rows = [];
  for(const m of mons){
    if(!m) continue;
    const species = clean(m.species, 40);
    if(!SPECIES.has(species)) continue;            // catalog-validated
    const moves = (Array.isArray(m.moves) ? m.moves : []).slice(0, 4)
      .map(x => clean(x, 30)).filter(Boolean);
    rows.push({species, ability: clean(m.ability, 30), item: clean(m.item, 30),
               nature: clean(m.nature, 12), moves: JSON.stringify(moves)});
  }
  if(!rows.length) return ok({error: "no valid mons"}, 400);

  const day = new Date().toISOString().slice(0, 10);
  const ip = await ipKey(req);
  // per-IP daily cap: 60 logged battles
  const cap = await env.DB.prepare("SELECT count FROM ipcount WHERE ip=?1 AND day=?2").bind(ip, day).first();
  if(cap && cap.count >= 60) return ok({error: "daily limit"}, 429);
  await env.DB.prepare(
    "INSERT INTO ipcount(ip, day, count) VALUES(?1, ?2, 1) " +
    "ON CONFLICT(ip, day) DO UPDATE SET count = count + 1"
  ).bind(ip, day).run();

  const ts = Date.now();
  const battle = ts + "_" + Math.random().toString(36).slice(2, 8);
  const stmt = env.DB.prepare(
    "INSERT INTO logs(ts, day, battle, species, ability, item, nature, moves) VALUES(?1,?2,?3,?4,?5,?6,?7,?8)");
  const batch = rows.map(r => stmt.bind(ts, day, battle, r.species, r.ability, r.item, r.nature, r.moves));
  await env.DB.batch(batch);
  return ok({logged: rows.length});
}

async function handleMeta(req, env){
  const url = new URL(req.url);
  const days = Math.min(365, Math.max(1, parseInt(url.searchParams.get("days") || "30", 10) || 30));
  const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const res = await env.DB.prepare(
    "SELECT species, ability, item, nature, moves, battle FROM logs WHERE day >= ?1 ORDER BY ts DESC LIMIT 60000"
  ).bind(since).all();
  const rows = res.results || [];
  const battles = new Set(), bySpec = new Map();
  for(const r of rows){
    battles.add(r.battle);
    let s = bySpec.get(r.species);
    if(!s){ s = {n: 0, items: {}, abils: {}, natures: {}, moves: {}}; bySpec.set(r.species, s); }
    s.n++;
    if(r.item) s.items[r.item] = (s.items[r.item] || 0) + 1;
    if(r.ability) s.abils[r.ability] = (s.abils[r.ability] || 0) + 1;
    if(r.nature) s.natures[r.nature] = (s.natures[r.nature] || 0) + 1;
    try{ for(const mv of JSON.parse(r.moves || "[]")) s.moves[mv] = (s.moves[mv] || 0) + 1; }catch(_){}
  }
  const tops = (o, k) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, k)
    .map(([name, n]) => [name, n]);
  const total = battles.size;
  const out = [...bySpec.entries()]
    .sort((a, b) => b[1].n - a[1].n).slice(0, 40)
    .map(([species, s]) => ({
      species, n: s.n,
      pct: total ? Math.round(1000 * s.n / total) / 10 : 0,
      items: tops(s.items, 3), abils: tops(s.abils, 2),
      natures: tops(s.natures, 2), moves: tops(s.moves, 4)
    }));
  return ok({battles: total, days, updated: new Date().toISOString().slice(0, 10), species: out});
}

/* ---- Replica code lookup ----
   Resolves a Team ID through champions.karthikb.dev's viewer (credit: Karthik
   Bandagonda). Cached 24h at the edge and normalized to a simple mons array. */
const REPLICA_TRIES = code => [
  "https://champions.karthikb.dev/api/replica/" + code,
  "https://champions.karthikb.dev/api/replica?id=" + code,
  "https://champions.karthikb.dev/api/team/" + code,
  "https://champions.karthikb.dev/replica/" + code + "/__data.json"
];
const STAT_KEYS_MAP = [["hp","hp"],["atk","attack"],["def","defense"],["spa","sp_atk"],["spd","sp_def"],["spe","speed"]];
function replicaScan(node, out){
  if(!node || typeof node !== "object") return;
  if(Array.isArray(node)){
    node.forEach(x => replicaScan(x, out));
    return;
  }
  const keys = Object.keys(node).map(k => k.toLowerCase());
  const hasSpecies = keys.some(k => ["species","pokemon","name","mon"].includes(k));
  const hasMoves = keys.some(k => k.startsWith("move"));
  if(hasSpecies && hasMoves){ out.push(node); return; }
  Object.values(node).forEach(v => replicaScan(v, out));
}
function replicaField(o, names){
  for(const k of Object.keys(o)){
    if(names.includes(k.toLowerCase())){
      const v = o[k];
      if(typeof v === "string") return v;
      if(v && typeof v === "object" && typeof v.name === "string") return v.name;
    }
  }
  return "";
}
function replicaMoves(o){
  for(const k of Object.keys(o)){
    if(k.toLowerCase() === "moves" && Array.isArray(o[k]))
      return o[k].map(m => (typeof m === "string" ? m : (m && m.name) || "")).filter(Boolean).slice(0, 4);
  }
  const singles = [];
  for(let i = 1; i <= 4; i++){
    const k = Object.keys(o).find(x => x.toLowerCase() === "move" + i || x.toLowerCase() === "move_" + i);
    if(k && o[k]) singles.push(typeof o[k] === "string" ? o[k] : o[k].name || "");
  }
  return singles.filter(Boolean);
}
function replicaEvs(o){
  const evsObj = Object.keys(o).find(k => k.toLowerCase() === "evs" || k.toLowerCase() === "stat_points" || k.toLowerCase() === "sp");
  const src = evsObj ? o[evsObj] : o;
  if(!src || typeof src !== "object") return null;
  const out = {};
  for(const [short, long] of STAT_KEYS_MAP){
    for(const k of Object.keys(src)){
      const lk = k.toLowerCase().replace(/[^a-z]/g, "");
      if(lk === short || lk === long || lk === "ev" + short || lk === short + "ev" || lk === long.replace("_","")){
        const n = Number(src[k]);
        if(Number.isFinite(n) && n >= 0 && n <= 64){ out[short] = n; break; }
      }
    }
  }
  return Object.keys(out).length ? out : null;
}
function replicaNormalize(json){
  const found = [];
  replicaScan(json, found);
  const mons = found.slice(0, 6).map(o => ({
    species: replicaField(o, ["species","pokemon","mon","name"]),
    item: replicaField(o, ["item","held_item","helditem"]),
    ability: replicaField(o, ["ability"]),
    nature: replicaField(o, ["nature","stat_alignment"]),
    moves: replicaMoves(o),
    evs: replicaEvs(o)
  })).filter(m => m.species && m.moves.length);
  return mons.length ? mons : null;
}
async function handleReplica(req, env, code){
  if(!/^[A-Za-z0-9]{6,14}$/.test(code)) return ok({error: "bad code"}, 400);
  code = code.toUpperCase();
  const cacheKey = new Request("https://cache.poke-panion.com/replica/" + code);
  const cached = await caches.default.match(cacheKey);
  if(cached) return cached;
  for(const url of REPLICA_TRIES(code)){
    try{
      const r = await fetch(url, {headers: {
        "accept": "application/json",
        "user-agent": "PokePanion replica lookup (poke-panion.com, contact@poke-panion.com)"
      }});
      if(!r.ok) continue;
      const text = await r.text();
      let json; try{ json = JSON.parse(text); }catch(_){ continue; }
      const mons = replicaNormalize(json);
      if(!mons) continue;
      const res = ok({code, mons, source: "champions.karthikb.dev"});
      res.headers.set("cache-control", "public, max-age=86400");
      await caches.default.put(cacheKey, res.clone());
      return res;
    }catch(_){ /* try next */ }
  }
  return ok({error: "not found", note: "Lookup service unavailable or unknown Team ID"}, 404);
}

/* Replica lookup upstream — paste the real lookup URL here when known, with
   {code} where the Team ID goes, e.g. "https://example.com/api/replica/{code}".
   Until it's set, /api/replica answers 404 and the app falls back gracefully. */
const REPLICA_UPSTREAM = "";

async function handleReplica(req, code){
  if(!/^[A-Z0-9]{8,12}$/.test(code)) return ok({error: "bad code"}, 400);
  if(!REPLICA_UPSTREAM) return ok({error: "lookup source not configured"}, 404);
  const cache = caches.default;
  const key = new Request("https://replica-cache.local/" + code);
  const hit = await cache.match(key);
  if(hit) return hit;
  const res = await fetch(REPLICA_UPSTREAM.replace("{code}", code), {headers: {"user-agent": "PokePanion replica lookup"}});
  if(!res.ok) return ok({error: "not found"}, 404);
  const body = await res.text();
  const out = new Response(body, {status: 200, headers: {...JSONH, "cache-control": "public, max-age=86400"}});
  await cache.put(key, out.clone());
  return out;
}

export default {
  async fetch(req, env){
    const url = new URL(req.url);
    const rm = url.pathname.match(/^\/api\/replica\/([A-Za-z0-9]+)$/);
    if(rm && req.method === "GET") {
      try{ return await handleReplica(req, rm[1].toUpperCase()); }catch(e){ return ok({error: "server"}, 500); }
    }
    if(url.pathname === "/api/log" && req.method === "POST") {
      try{ return await handleLog(req, env); }catch(e){ return ok({error: "server"}, 500); }
    }
    const rep = url.pathname.match(/^\/api\/replica\/([A-Za-z0-9]+)$/);
    if(rep && req.method === "GET") {
      try{ return await handleReplica(req, env, rep[1]); }catch(e){ return ok({error: "server"}, 500); }
    }
    if(url.pathname === "/api/meta" && req.method === "GET") {
      try{ return await handleMeta(req, env); }catch(e){ return ok({error: "server"}, 500); }
    }
    return env.ASSETS.fetch(req);
  }
};
