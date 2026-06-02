export type FaqItem = { q: string; a: string };

export type FaqSection = {
  id: string;
  title: string;
  description: string;
  items: FaqItem[];
};

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'platforma',
    title: 'Despre platformă',
    description: 'Ce este Faber, pentru cine și cum începeți.',
    items: [
      {
        q: 'Ce este Faber?',
        a: 'O platformă cloud pentru gestionarea echipelor de teren și CRM. Creată pentru firmele cu brigăzi mobile — instalații, reparații, mentenanță, curățenie.',
      },
      {
        q: 'Cui i se potrivește?',
        a: 'Firmelor cu 1–50+ angajați care vor clienți, lucrări, smete, oferte și facturi într-un singur loc — fără Excel, WhatsApp și hârtie.',
      },
      {
        q: 'Trebuie instalat ceva?',
        a: 'Nu. Totul funcționează în browser — Chrome, Safari, Edge. Angajații și clienții intră de pe telefon, tabletă sau laptop.',
      },
      {
        q: 'Merge pe mobil?',
        a: 'Da. Interfața e adaptată pentru telefon. Angajații văd sarcinile și schimbă statusul din mers. Clienții folosesc portalul fără aplicație.',
      },
      {
        q: 'În ce limbi e disponibilă?',
        a: 'Română și rusă. Interfața, cabinetele și documentele cheie sunt în ambele limbi.',
      },
    ],
  },
  {
    id: 'companii',
    title: 'Companii & abonamente',
    description: 'Înregistrare, verificare, echipă și planuri tarifare.',
    items: [
      {
        q: 'Cât costă?',
        a: 'Momentan, acces gratuit în perioada early-access. Avem trei planuri: Free, Pro și Business. Cardul nu e necesar la înregistrare.',
      },
      {
        q: 'Cum îmi înregistrez compania?',
        a: 'Creați cont „Companie”, completați profilul: IDNO, adresă, oraș, categorie, logo și contacte. După salvare, trimiteți compania spre verificare.',
      },
      {
        q: 'De ce e nevoie de verificare?',
        a: 'Un moderator confirmă manual că firma e reală. După verificare, profilul apare în catalogul public și devine vizibil pentru clienți.',
      },
      {
        q: 'Care e diferența între planuri?',
        a: 'Free: profil public, catalog servicii, până la 20 lucrări/lună, calendar, 3 angajați. Pro: +CRM clienți, cereri, portal, până la 10 angajați și 150 lucrări/lună. Business: +smete inteligente, oferte comerciale, facturi cu TVA, export CSV — fără limite.',
      },
      {
        q: 'Cum adaug colegi în echipă?',
        a: 'La „Echipă” trimiteți invitație pe email. Roluri: Angajat sau Manager. Proprietarul vede tot, managerul — operaționalul.',
      },
      {
        q: 'Contactele se completează automat?',
        a: 'Da. Dacă n-ați setat contacte publice, profilul preia emailul și telefonul din contul dvs.',
      },
    ],
  },
  {
    id: 'clienti',
    title: 'Clienți & portal',
    description: 'Conectarea clienților, invitații și acces la portal.',
    items: [
      {
        q: 'Cum vede clientul ofertele și facturile?',
        a: 'Printr-un portal securizat. Compania trimite link de invitație, clientul se înregistrează — contul se leagă automat.',
      },
      {
        q: 'Clientul are nevoie de cont separat?',
        a: 'Da, tip END_CLIENT — email, telefon și parolă. Înregistrarea durează câteva minute. Linkul de invitație îl leagă direct de compania dvs.',
      },
      {
        q: 'Dar dacă clientul s-a înregistrat singur?',
        a: 'Dacă telefonul sau emailul coincid cu fișa client — legarea e automată. Dacă nu, trimiteți invitație din „Clienți”.',
      },
      {
        q: 'Cum generez un link de invitație?',
        a: 'Clienți → fișa clientului → „Generează link”. Copiați și trimiteți prin SMS, WhatsApp sau email.',
      },
      {
        q: 'Clienții pot lăsa recenzii?',
        a: 'Da. După finalizarea sau plata lucrării, clientul dă stele și comentariu din portal. Recenziile apar pe profilul public al companiei.',
      },
      {
        q: 'Câte recenzii per lucrare?',
        a: 'Una. Ratingul mediu se recalculează automat.',
      },
    ],
  },
  {
    id: 'lucrari',
    title: 'Lucrări, oferte & facturi',
    description: 'Ciclul complet: de la cerere la plată.',
    items: [
      {
        q: 'Ce este o lucrare?',
        a: 'O comandă de serviciu: client, adresă, tip, status, angajat alocat și istoric. Elementul central al cabinetului.',
      },
      {
        q: 'Cum funcționează calendarul?',
        a: 'Lucrările cu dată apar în calendar. Planificați vizitele și evitați suprapunerile — mai ales cu mai mulți angajați.',
      },
      {
        q: 'Ce sunt pachetele de servicii?',
        a: 'Șabloane de servicii cu nume, preț și descriere. Le folosiți rapid la crearea lucrărilor. Se pot afișa în profilul public.',
      },
      {
        q: 'Cum funcționează smetele inteligente?',
        a: 'Calculator încorporat: introduceți dimensiunile încăperii și dotările — motorul calculează materiale, ore și cost. Smeta gata în câteva secunde.',
      },
      {
        q: 'Cum emit o factură?',
        a: 'La „Smete” și „Facturi”. TVA-ul și marja se calculează automat. Documentul apare instant în portalul clientului.',
      },
      {
        q: 'Pot exporta în PDF?',
        a: 'Da. Smetele, ofertele și facturile se descarcă PDF. Imprimare direct din cabinet. Suport complet pentru diacritice.',
      },
    ],
  },
  {
    id: 'cont',
    title: 'Cont & autentificare',
    description: 'Înregistrare, tipuri de cont și recuperare acces.',
    items: [
      {
        q: 'Cum mă autentific?',
        a: 'Cu email sau telefon (+373...) și parolă. Parola e aceeași — indiferent prin ce intrați.',
      },
      {
        q: 'Ce tipuri de cont există?',
        a: 'Companie — pentru business. Client — pentru clienții finali. Admin — doar echipa Faber. Alegeți la înregistrare.',
      },
      {
        q: 'De ce e obligatoriu telefonul pentru clienți?',
        a: 'Pentru legarea automată cu fișa client și confirmarea identității la suport. Format: +373XXXXXXXX.',
      },
      {
        q: 'Trebuie să accept condițiile?',
        a: 'Da. Fără acceptarea Termenilor și a Politicii de confidențialitate contul nu se creează. Documente: /terms și /privacy.',
      },
      {
        q: 'Am uitat parola. Ce fac?',
        a: 'Resetarea parolei e în dezvoltare. Deocamdată — scrieți la suport cu emailul contului. Contacte pe pagina „Contacte”.',
      },
      {
        q: 'Un email = un cont?',
        a: 'Da. Emailul e unic în sistem. Pentru testarea ambelor tipuri de cont folosiți adrese diferite.',
      },
    ],
  },
  {
    id: 'securitate',
    title: 'Securitate & date',
    description: 'Cum vă protejăm informația.',
    items: [
      {
        q: 'Datele sunt în siguranță?',
        a: 'HTTPS, hash parole (argon2), token-uri de acces, baze de date izolate. Accesul la datele companiei — doar echipa dvs.',
      },
      {
        q: 'Respectați GDPR?',
        a: 'Da. Politica de confidențialitate detaliază: ce date colectăm, temeiul legal, drepturile utilizatorilor și contactul DPO.',
      },
      {
        q: 'Ce cookie-uri folosiți?',
        a: 'Doar cele esențiale: sesiune și salvare consimțământ. La prima vizită — banner „Accept / Refuz”. Alegerea se salvează în browser.',
      },
      {
        q: 'Cine vede datele clienților mei?',
        a: 'Doar angajații companiei dvs. cu acces activ. Adminii platformei — acces limitat, pentru suport și moderare.',
      },
      {
        q: 'Unde sunt stocate datele fizic?',
        a: 'Pe servere securizate în UE. Detalii — la cerere pentru clienții Business.',
      },
      {
        q: 'Cum îmi șterg contul?',
        a: 'Scrieți la emailul din „Contacte”. Datele vor fi șterse sau anonimizate în termene legale. Evidențele fiscale se păstrează conform legii.',
      },
    ],
  },
];