// Lithuanian (lt) + Turkish (tr) translations for the step-video wizards.
// Index-aligned to WIZARDS[slug].steps in ./wizard-steps.ts. Translated from the English block.
import type { WizardSlug } from './wizard-steps-types';

export type WizardLocale = 'lt' | 'tr';

// Per wizard: an array index-aligned to WIZARDS[slug].steps; each entry maps locale → {t,b}.
export const WIZARD_I18N: Record<WizardSlug, Array<Partial<Record<WizardLocale, { t: string; b: string }>>>> = {
  airport: [
    {
      lt: { t: 'Registracija ir bagažo pridavimas', b: 'Vilniuje atvykite maždaug 3 valandomis anksčiau. Priduokite registruotą bagažą, pasiimkite įlaipinimo korteles ir laikykite po ranka pasą bei ihramo krepšį.' },
      tr: { t: 'Check-in ve bagaj teslimi', b: 'Vilnius’a yaklaşık 3 saat önce gelin. Kayıtlı bagajınızı teslim edin, biniş kartlarınızı alın ve pasaportunuzu ile ihram çantanızı elinizde tutun.' },
    },
    {
      lt: { t: 'Saugumo ir paso kontrolė', b: 'Pereikite saugumo patikrą ir pasų kontrolę. Skysčiai turi būti iki 100 ml; telefonus, diržus ir monetas dėkite į padėklą.' },
      tr: { t: 'Güvenlik ve pasaport kontrolü', b: 'Güvenlik kontrolünden ve pasaport kontrolünden geçin. Sıvılar 100 ml’den az olmalı; telefon, kemer ve bozuk paraları kaba koyun.' },
    },
    {
      lt: { t: 'Įlaipinimas į skrydį', b: 'Įlaipinkite pagal zoną, kai pakvies jūsų grupę. Suraskite vietą, įdėkite rankinį bagažą į viršutinę lentyną ir ramiai įsitaisykite.' },
      tr: { t: 'Uçağa biniş', b: 'Grubunuz çağrıldığında bölgenize göre uçağa binin. Koltuğunuzu bulun, kabin çantanızı üst rafa yerleştirin ve sakince oturun.' },
    },
    {
      lt: { t: 'Skrydis į Džidą / Mediną', b: 'Ilsėkitės ir gerkite vandenį. Įgula išdalys atvykimo korteles — užpildykite jas prieš nusileidimą ir nustatykite laikrodį pagal Saudo Arabijos laiką.' },
      tr: { t: 'Cidde / Medine uçuşu', b: 'Dinlenin ve su için. Kabin ekibi varış kartları dağıtır — bunları inişten önce doldurun ve saatinizi Suudi Arabistan saatine ayarlayın.' },
    },
    {
      lt: { t: 'Pasų kontrolė ir biometrija', b: 'Džidoje ar Medinoje sekite nuorodas „Hajj / Umrah“. Prie langelio pateikite pirštų atspaudus ir nuotrauką.' },
      tr: { t: 'Pasaport kontrolü ve biyometri', b: 'Cidde veya Medine’de “Hac / Umre” tabelalarını takip edin. Gişede parmak izinizi ve fotoğrafınızı verin.' },
    },
    {
      lt: { t: 'Bagažo atsiėmimas ir muitinė', b: 'Atsiimkite registruotą bagažą nuo juostos, atitinkančios jūsų skrydžio numerį, ir eikite per žaliąjį muitinės koridorių.' },
      tr: { t: 'Bagaj alımı ve gümrük', b: 'Uçuş numaranıza ait banttan kayıtlı bagajınızı alın, ardından yeşil gümrük koridorundan geçin.' },
    },
    {
      lt: { t: 'Susitikimas, SIM kortelė ir pervežimas', b: 'Susitikimo vietoje suraskite AUJ atstovą. Pasiimkite vietinę SIM kortelę ir sėskite į pervežimą iki viešbučio.' },
      tr: { t: 'Karşılama, SIM kart ve transfer', b: 'Buluşma noktasında AUJ temsilcinizi bulun. Yerel SIM kartınızı alın ve otelinize giden transfere binin.' },
    },
  ],
  luggage: [
    {
      lt: { t: 'Bagažas ir svorio ribos', b: 'Dauguma vežėjų leidžia 2 × 23 kg registruoto ir 1 × 7 kg rankinio bagažo — patikrinkite biliete. Pakuokitės nedaug; bagažą teks nešti per minias.' },
      tr: { t: 'Bagaj ve ağırlık limitleri', b: 'Çoğu havayolu 2 × 23 kg kayıtlı ve 1 × 7 kg kabin bagajına izin verir — biletinizden kontrol edin. Hafif paketleyin; bagajları kalabalık içinde taşıyacaksınız.' },
    },
    {
      lt: { t: 'Ihramas ir apranga', b: 'Vyrai: dvi baltos nesiūtos ihramo paklodės. Moterys: kuklūs, laisvi drabužiai. Įsidėkite atsarginį komplektą ir patogias sandalus.' },
      tr: { t: 'İhram ve giysiler', b: 'Erkekler: iki beyaz dikişsiz ihram örtüsü. Kadınlar: tesettürlü, bol giysiler. Yedek bir takım ve rahat sandalet alın.' },
    },
    {
      lt: { t: 'Higienos priemonės ir vaistai', b: 'Būdami ihrame naudokite bekvapį muilą ir kvapų neturinčias higienos priemones. Asmeninius vaistus su gydytojo pažyma laikykite rankiniame bagaže.' },
      tr: { t: 'Hijyen ürünleri ve ilaçlar', b: 'İhramdayken kokusuz sabun ve parfümsüz hijyen ürünleri kullanın. Kişisel ilaçlarınızı doktor raporuyla birlikte getirin ve kabin bagajında tutun.' },
    },
    {
      lt: { t: 'Dokumentai ir skiepai', b: 'Turėkite pasą, vizą ir meningokokinės infekcijos (ACWY) pažymėjimą — jis būtinas įvažiuojant. Laikykite spausdintas ir skaitmenines kopijas.' },
      tr: { t: 'Belgeler ve aşılama', b: 'Pasaportunuzu, vizenizi ve meningokok (ACWY) sertifikanızı yanınızda bulundurun — girişte zorunludur. Basılı ve dijital kopyaları saklayın.' },
    },
    {
      lt: { t: 'Ką galima vežtis', b: 'Asmeninė apranga, elektronika, sandariai supakuotas asmeninis maistas, Koranas ir religinės knygos bei asmeninio naudojimo higienos priemonės — viskas leidžiama.' },
      tr: { t: 'Yanınıza alabilecekleriniz', b: 'Kişisel giysiler, elektronik cihazlar, ağzı kapalı kişisel gıdalar, bir Kur’an ve dini kitaplar ile kişisel kullanım hijyen ürünleri serbesttir.' },
    },
    {
      lt: { t: 'Ribojama — deklaruoti ar gauti leidimą', b: 'Kai kuriuos daiktus galima vežtis tik deklaravus ar turint leidimą: didelę grynųjų sumą, papildomą tabaką, dronus ir tam tikrus augalus ar sėklas.' },
      tr: { t: 'Kısıtlı — beyan veya izin gerekir', b: 'Bazı eşyalara yalnızca beyan ya da izinle izin verilir: büyük miktarda nakit, fazla tütün, dronlar ve belirli bitki veya tohumlar.' },
    },
    {
      lt: { t: 'Draudžiama — niekada nepakuokite', b: 'Šie daiktai griežtai draudžiami: alkoholis, narkotikai, kiauliena, ginklai ir bet kokia amorali ar tikėjimui priešiška medžiaga. Bausmės griežtos.' },
      tr: { t: 'Yasak — asla bavula koymayın', b: 'Şunlar kesinlikle yasaktır: alkol, uyuşturucu, domuz eti, silahlar ve her türlü ahlaksız veya inanca aykırı materyal. Cezalar ağırdır.' },
    },
    {
      lt: { t: 'Registracija, muitinė ir išvykimas', b: 'Priduodant bagažą pasisverkite ir laikykite dokumentus po ranka. Atvykus rinkitės žaliąjį koridorių, jei neturite ko deklaruoti. Grįžtant sandariai supakuotas Zamzamas paprastai leidžiamas — ramiai persipakuokite ir išsiregistruokite.' },
      tr: { t: 'Check-in, gümrük ve check-out', b: 'Bagaj tesliminde tartılın ve belgeleri elinizde tutun. Varışta beyan edecek bir şeyiniz yoksa yeşil koridoru kullanın. Dönüşte ağzı kapalı Zemzem genellikle serbesttir — sakince yeniden paketleyip çıkış yapın.' },
    },
  ],
  'makkah-ziyarat': [
    {
      lt: { t: 'Masjid al-Haram', b: 'Didžioji Mekos mečetė, supanti Kaabą. Švenčiausia islamo vieta ir kiekvienos Umros bei Hadžo centras.' },
      tr: { t: 'Mescid-i Haram', b: 'Kâbe’yi çevreleyen Mekke’nin Büyük Camisi. İslam’ın en kutsal mekânı ve her Umre ile Hac’cın merkezi.' },
    },
    {
      lt: { t: 'Kaaba ir Juodasis akmuo', b: 'Kisva uždengtas kubas, į kurį meldžiasi musulmonai visame pasaulyje. Rytiniame jo kampe yra Hadžar al-Asvadas.' },
      tr: { t: 'Kâbe ve Hacerü’l-Esved', b: 'Örtüyle (kisve) örtülü, dünyadaki tüm Müslümanların yöneldiği küp. Hacerü’l-Esved doğu köşesinde bulunur.' },
    },
    {
      lt: { t: 'Makam Ibrahim', b: 'Ibrahimo stovėjimo vieta, kurioje saugomas akmuo, ant kurio jis stovėjo statydamas Kaabą. Po tavafo už jo melskitės dvi rak’ah.' },
      tr: { t: 'Makam-ı İbrahim', b: 'İbrahim’in Kâbe’yi yükseltirken üzerinde durduğu taşı barındıran makam. Tavaftan sonra arkasında iki rekât namaz kılın.' },
    },
    {
      lt: { t: 'Safa ir Marva', b: 'Dvi kalvos, tarp kurių einama atliekant Sa’i, prisimenant Hadžar paieškas vandens Ismailiui. Septyni ėjimai užbaigia apeigą.' },
      tr: { t: 'Safa ve Merve', b: 'Hacer’in İsmail için su arayışını anan, Sa’y’de aralarında yürünen iki tepe. Yedi şavt bu ibadeti tamamlar.' },
    },
    {
      lt: { t: 'Zamzamo šulinys', b: 'Palaimintas šaltinis, tūkstantmečius tekantis šalia Kaabos. Gerkite laisvai; vandens aušintuvai išdėstyti visoje mečetėje.' },
      tr: { t: 'Zemzem Kuyusu', b: 'Bin yıllardır Kâbe’nin yanında akan mübarek pınar. Dilediğinizce için; soğutucular caminin her yerinde mevcuttur.' },
    },
    {
      lt: { t: 'Džabal an-Nur ir Hira', b: 'Šviesos kalnas, kuriame yra Hiros urvas, kur Pranašui ﷺ buvo apreikštas pirmasis apreiškimas.' },
      tr: { t: 'Cebel-i Nur ve Hira', b: 'İlk vahyin Peygamber’e ﷺ geldiği Hira Mağarası’nı barındıran Nur Dağı.' },
    },
    {
      lt: { t: 'Džabal Thaur', b: 'Kalnas, kurio urve Pranašas ﷺ ir Abu Bakras slėpėsi per Hidžrą į Mediną.' },
      tr: { t: 'Cebel-i Sevr', b: 'Mağarasında Peygamber’in ﷺ ve Ebû Bekir’in Medine’ye Hicret sırasında sığındığı dağ.' },
    },
    {
      lt: { t: 'Mina', b: 'Palapinių slėnis, kuriame piligrimai apsistoja per Hadžą ir atlieka Džamarato akmenų mėtymą.' },
      tr: { t: 'Mina', b: 'Hacılar’ın Hac sırasında konakladığı ve Cemerat’ta şeytan taşlama ibadetini yerine getirdiği çadırlar vadisi.' },
    },
    {
      lt: { t: 'Arafatas ir Džabal ar-Rahma', b: 'Lyguma, kurioje piligrimai stovi Dhul-Hidžos 9-ąją dieną — Hadžo esmė — šalia Gailestingumo kalno.' },
      tr: { t: 'Arafat ve Cebelü’r-Rahme', b: 'Hacılar’ın Zilhicce’nin 9. günü vakfeye durduğu ova — Hac’cın özü — Rahmet Dağı’nın yanında.' },
    },
    {
      lt: { t: 'Muzdalifa', b: 'Atvira lyguma, kurioje piligrimai praleidžia naktį po Arafato, rinkdami akmenukus mėtymui Minoje.' },
      tr: { t: 'Müzdelife', b: 'Hacılar’ın Arafat’tan sonra geceyi geçirdiği, Mina’daki taşlama için çakıl topladığı açık ova.' },
    },
    {
      lt: { t: 'Džanat al-Mu’alla', b: 'Istorinės Mekos kapinės, kuriose ilsisi Chadidža رضي الله عنها ir daugelis Pranašo šeimos narių.' },
      tr: { t: 'Cennetü’l-Muallâ', b: 'Mekke’nin tarihî mezarlığı; Hatice رضي الله عنها ve Peygamber’in ailesinden pek çok kişinin medfun bulunduğu yer.' },
    },
    {
      lt: { t: 'Aišos mečetė (Tan’im)', b: 'Artimiausias Mikatas už Haramo ribų, kur Mekos gyventojai ir lankytojai įeina į ihramą naujai Umrai.' },
      tr: { t: 'Âişe Mescidi (Ten’im)', b: 'Harem sınırının dışındaki en yakın Mîkat; Mekke sakinleri ve ziyaretçilerin yeni bir Umre için ihrama girdiği yer.' },
    },
    {
      lt: { t: 'Mekos muziejus', b: 'Dviejų Šventųjų mečečių architektūros paroda — Haramaino istorija, menas ir didieji plėtros darbai, parodyti su gausiomis detalėmis.' },
      tr: { t: 'Mekke Müzesi', b: 'İki Kutsal Mescidin Mimarisi Sergisi — Harameyn’in tarihi, sanatı ve büyük genişletmeleri zengin ayrıntılarla sergilenir.' },
    },
    {
      lt: { t: 'Hiros kultūros rajonas', b: 'Modernus kultūros centras Džabal an-Nur papėdėje su Apreiškimo paroda, pasakojančia pirmojo apreiškimo istoriją.' },
      tr: { t: 'Hira Kültür Bölgesi', b: 'Cebel-i Nur’un eteğinde, ilk vahyin hikâyesini anlatan Vahiy Sergisi’ni barındıran modern bir kültür merkezi.' },
    },
    {
      lt: { t: 'Kaabos kisvos fabrikas', b: 'Karaliaus Abdulazizo kompleksas, kuriame meistrai kasmet iš naujo audžia juodai auksinę Kaabos kisvą.' },
      tr: { t: 'Kâbe Kisve Fabrikası', b: 'Kâbe’nin siyah-altın kisvesinin her yıl usta zanaatkârlar tarafından yeniden dokunduğu Kral Abdülaziz Külliyesi.' },
    },
    {
      lt: { t: 'Laikrodžio bokšto muziejus', b: 'Mekos Karališkojo laikrodžio bokšto viduje: galerijos apie laiko matavimą ir astronomiją bei viršutinio aukšto apžvalgos aikštelė virš Haramo.' },
      tr: { t: 'Saat Kulesi Müzesi', b: 'Mekke Kraliyet Saat Kulesi’nin içinde: zaman ölçümü ve astronomi üzerine galeriler ve Harem’e bakan üst kat seyir terası.' },
    },
  ],
  'madina-ziyarat': [
    {
      lt: { t: 'Masjid an-Nabavi', b: 'Pranašo mečetė, antroji švenčiausia islame, kurią pastatė pats Pranašas ﷺ ir kurią vainikuoja Žalioji kupola virš jo poilsio vietos.' },
      tr: { t: 'Mescid-i Nebevî', b: 'İslam’ın ikinci en kutsal mekânı olan Peygamber Mescidi; bizzat Peygamber ﷺ tarafından inşa edilmiş ve kabrinin üzerinde Yeşil Kubbe ile taçlandırılmıştır.' },
    },
    {
      lt: { t: 'Ar-Rauda aš-Šarifa', b: 'Palaiminta vieta tarp Pranašo sakyklos ir jo kambario — „sodas iš Rojaus sodų“. Čia melskitės ir kreipkitės su dua.' },
      tr: { t: 'Ravza-i Şerife', b: 'Peygamber’in minberi ile odası arasındaki mübarek alan — “cennet bahçelerinden bir bahçe”. Burada namaz kılın ve dua edin.' },
    },
    {
      lt: { t: 'Džanat al-Baki', b: 'Pagrindinės Medinos kapinės šalia mečetės, kuriose ilsisi daugelis Pranašo ﷺ kompanionų ir šeimos narių.' },
      tr: { t: 'Cennetü’l-Bakî', b: 'Caminin yanındaki Medine’nin ana mezarlığı; birçok sahabe ile Peygamber’in ﷺ ailesinin medfun bulunduğu yer.' },
    },
    {
      lt: { t: 'Kubos mečetė', b: 'Pirmoji islame pastatyta mečetė. Malda čia, prieš tai atlikus vudu namuose, atneša Umros atlygį.' },
      tr: { t: 'Kuba Mescidi', b: 'İslam’da inşa edilen ilk mescit. Evde abdest aldıktan sonra burada kılınan namaz, bir Umre sevabı taşır.' },
    },
    {
      lt: { t: 'Al-Kiblatain mečetė', b: 'Dviejų Kiblų mečetė, kurioje atėjo įsakymas vidury maldos pasisukti nuo Jeruzalės į Kaabą.' },
      tr: { t: 'Kıbleteyn Mescidi', b: 'İki Kıbleli Mescit; namaz esnasında kıblenin Kudüs’ten Kâbe’ye çevrilmesi emrinin geldiği yer.' },
    },
    {
      lt: { t: 'Uhudo kalnas', b: 'Uhudo mūšio kalnas, apie kurį Pranašas ﷺ pasakė: „Uhudas yra kalnas, kuris mus myli, ir mes jį mylime.“' },
      tr: { t: 'Uhud Dağı', b: 'Uhud Savaşı’nın dağı; Peygamber ﷺ onun hakkında şöyle buyurmuştur: “Uhud bizi seven, bizim de sevdiğimiz bir dağdır.”' },
    },
    {
      lt: { t: 'Uhudo kankiniai', b: 'Septyniasdešimties Uhudo kankinių poilsio vieta, tarp jų — Hamza رضي الله عنه, Pranašo dėdė.' },
      tr: { t: 'Uhud Şehitleri', b: 'Yetmiş Uhud şehidinin medfun bulunduğu yer; aralarında Peygamber’in amcası Hamza رضي الله عنه da vardır.' },
    },
    {
      lt: { t: 'Septynios mečetės', b: 'Mažos istorinės mečetės netoli Tranšėjos mūšio (al-Chandak) vietos, kur buvo atremti sąjungininkai.' },
      tr: { t: 'Yedi Mescit', b: 'Müttefiklerin (Ahzab) püskürtüldüğü Hendek Savaşı (el-Hendek) bölgesinin yakınındaki küçük tarihî mescitler.' },
    },
    {
      lt: { t: 'Al-Ghamama mečetė', b: 'Istorinė mečetė netoli Haramo, kur, kaip tradiciškai manoma, Pranašas ﷺ meldėsi prašydamas lietaus ir atliko Eid maldą.' },
      tr: { t: 'Gamâme Mescidi', b: 'Harem’in yakınında, rivayete göre Peygamber’in ﷺ yağmur duası ile bayram namazını kıldığı tarihî bir mescit.' },
    },
    {
      lt: { t: 'Datulių turgus · Adžva', b: 'Medina garsėja savo datulėmis, ypač Adžva, kurią gyrė Pranašas ﷺ. Aplankykite datulių turgų netoli Kubos.' },
      tr: { t: 'Hurma Pazarı · Acve', b: 'Medine, hurmalarıyla, özellikle Peygamber’in ﷺ övdüğü Acve hurmasıyla ünlüdür. Kuba yakınındaki hurma pazarını ziyaret edin.' },
    },
    {
      lt: { t: 'Pranašo biografijos paroda', b: 'Didžioji As-Salam paroda apie Pranašo ﷺ gyvenimą, charakterį ir palikimą su įtraukiomis multimedijos salėmis šalia Haramo.' },
      tr: { t: 'Siyer-i Nebî Sergisi', b: 'Peygamber’in ﷺ hayatı, ahlakı ve mirası üzerine büyük Es-Selâm sergisi; Harem’in yanında etkileyici multimedya salonlarıyla.' },
    },
    {
      lt: { t: 'Dar Al Madinah muziejus', b: 'Paveldo muziejus, atskleidžiantis Medinos urbanistinę ir socialinę istoriją su detaliais senamiesčio ir jo mečečių maketais.' },
      tr: { t: 'Dârü’l-Medine Müzesi', b: 'Medine’nin kentsel ve toplumsal tarihini anlatan, eski şehrin ve mescitlerinin ayrıntılı maketlerini barındıran bir miras müzesi.' },
    },
    {
      lt: { t: 'Šventojo Korano paroda', b: 'Muziejus, skirtas Korano apreiškimui, išsaugojimui ir menui, esantis netoli Masjid an-Nabavi.' },
      tr: { t: 'Kur’ân-ı Kerîm Sergisi', b: 'Kur’an’ın inişine, korunmasına ve sanatlarına adanmış, Mescid-i Nebevî’ye kısa bir yürüyüş mesafesinde bir müze.' },
    },
    {
      lt: { t: 'Hidžazo geležinkelio muziejus', b: 'Restauruota Osmanų geležinkelio stotis ir muziejus, pasakojantis istorinės linijos nuo Damasko iki Medinos istoriją.' },
      tr: { t: 'Hicaz Demiryolu Müzesi', b: 'Şam’dan Medine’ye uzanan tarihî hattın hikâyesini anlatan, restore edilmiş Osmanlı tren istasyonu ve müzesi.' },
    },
  ],
};
