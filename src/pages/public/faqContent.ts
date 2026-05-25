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
    description: 'Ce este Faber Companii, pentru cine este și cum începeți.',
    items: [
      {
        q: 'Ce este Faber Companii?',
        a: 'Faber Companii este o platformă cloud de tip FSM (Field Service Management) și CRM, creată pentru companii din Moldova care gestionează echipe pe teren: instalări, mentenanță, intervenții tehnice, curățenie și alte servicii cu clienți recurenți.',
      },
      {
        q: 'Pentru ce tip de business este potrivită?',
        a: 'Platforma se potrivește firmelor cu 1–50+ tehnicieni care au nevoie să țină evidența clienților, lucrărilor, ofertelor și facturilor într-un singur loc — fără haos în WhatsApp, Excel sau carnet de hârtie.',
      },
      {
        q: 'Trebuie să instalez ceva pe calculator?',
        a: 'Nu. Faber Companii funcționează în browser (Chrome, Safari, Edge). Tehnicienii folosesc același cont de pe telefon, tabletă sau laptop, fără instalări suplimentare.',
      },
      {
        q: 'Platforma funcționează pe telefon mobil?',
        a: 'Da. Interfața este adaptivă: tehnicienii pot vedea lucrările alocate, actualiza statusul și adăuga note direct de pe telefon, iar clienții pot accesa portalul mobil fără aplicație dedicată.',
      },
      {
        q: 'În ce limbi este disponibilă platforma?',
        a: 'Interfața publică și cabinetele sunt optimizate pentru limba română. Termenii, politica de confidențialitate și mesajele cheie sunt disponibile pe site-ul fabercompanii.',
      },
    ],
  },
  {
    id: 'companii',
    title: 'Companii & abonamente',
    description: 'Profil, verificare, echipă și planuri tarifare.',
    items: [
      {
        q: 'Cât costă utilizarea platformei?',
        a: 'În perioada de acces timpuriu, companiile înscrise pot folosi platforma gratuit. Există planuri Free, Pro și Business — detaliile complete sunt pe pagina Abonamente. Nu solicităm card bancar la înregistrare.',
      },
      {
        q: 'Cum îmi înregistrez compania?',
        a: 'Creați un cont de tip „Companie”, completați profilul juridic (IDNO, adresă, oraș, categorie), logo și date de contact. După salvare, compania apare în cabinetul dvs. și poate fi trimisă spre verificare de administrator.',
      },
      {
        q: 'De ce trebuie verificată compania?',
        a: 'Verificarea manuală de către admin asigură că în catalogul public apar doar firme reale. După verificare puteți publica profilul pe pagina Companii, vizibil clienților.',
      },
      {
        q: 'Ce diferență este între planurile Free, Pro și Business?',
        a: 'Free include profil public, catalog servicii, lucrări (până la 20/lună), calendar și 1 tehnician. Pro adaugă CRM clienți, cereri (leads), portal clienți, catalog intern de servicii și fișă de execuție pe teren (până la 10 tehnicieni, 150 lucrări/lună). Business adaugă smete inteligente, oferte, facturi TVA și export — fără limite de tehnicieni sau lucrări.',
      },
      {
        q: 'Pot invita colegi în echipă?',
        a: 'Da. Din cabinet → Echipă puteți trimite invitații pe email cu rol Manager sau Tehnician. Proprietarul companiei are acces complet; managerii pot gestiona operațiunile zilnice.',
      },
      {
        q: 'Telefonul și emailul de contact se completează automat?',
        a: 'Da. La profilul companiei, dacă nu ați setat deja contacte publice, platforma preia emailul (și telefonul, dacă l-ați indicat la înregistrare) din contul dvs. de utilizator.',
      },
    ],
  },
  {
    id: 'clienti',
    title: 'Clienți & portal',
    description: 'Legarea clienților, invitații și accesul la portal.',
    items: [
      {
        q: 'Cum accesează clienții ofertele și facturile?',
        a: 'Fiecare client poate avea un portal securizat. Compania îi trimite un link de invitație sau clientul se înregistrează cu același telefon/email pe care compania l-a introdus în fișa client — contul se leagă automat.',
      },
      {
        q: 'Clientul trebuie să își creeze cont?',
        a: 'Da, pentru portal este nevoie de cont END_CLIENT (email, telefon obligatoriu, parolă). Procesul durează câteva minute; linkul de invitație pre-completează legătura cu compania dvs.',
      },
      {
        q: 'Ce se întâmplă dacă clientul se înregistrează fără invitație?',
        a: 'Dacă telefonul sau emailul coincide cu o singură fișă client nelegată, contul se leagă automat. Altfel, clientul vede mesaj că profilul portal nu este încă conectat — trimiteți link de invitație din Clienți.',
      },
      {
        q: 'Cum generez link de invitație portal?',
        a: 'În cabinet → Clienți, deschideți fișa clientului și apăsați „Generează link portal”. Linkul se copiază automat; trimiteți-l prin SMS, WhatsApp sau email.',
      },
      {
        q: 'Pot lăsa recenzii clienții?',
        a: 'Da. După ce marcați o lucrare ca Finalizată, Facturată sau Plătită, clientul poate lăsa o recenzie cu stele și comentariu din portal. Recenziile apar pe profilul public al companiei și în cabinet → Recenzii.',
      },
      {
        q: 'Câte recenzii poate lăsa un client per lucrare?',
        a: 'O singură recenzie per lucrare (intervenție). Ratingul mediu al companiei se recalculează automat.',
      },
    ],
  },
  {
    id: 'lucrari',
    title: 'Lucrări, oferte & facturi',
    description: 'Fluxul operațional de la client la factură.',
    items: [
      {
        q: 'Ce este o „lucrare” (intervenție)?',
        a: 'O lucrare reprezintă o comandă de serviciu: client, adresă, tip, status (nouă, programată, în lucru, finalizată etc.), tehnician alocat și istoric. Este centrul operațiunilor din cabinet.',
      },
      {
        q: 'Cum funcționează calendarul?',
        a: 'Lucrările cu dată programată apar în Calendar. Puteți planifica vizitele echipei și evita suprapunerile — util pentru firme cu mai mulți tehnicieni.',
      },
      {
        q: 'Ce sunt pachetele de servicii?',
        a: 'Pachetele sunt servicii predefinite (ex: „Instalare boiler”) cu preț și descriere. Le folosiți rapid la crearea lucrărilor și le puteți afișa pe profilul public al companiei.',
      },
      {
        q: 'Cum emit oferte (devize)?',
        a: 'Din cabinet → Oferte creați devize legate de clienți și lucrări. Clientul le poate consulta în portal. Disponibil pe plan Business.',
      },
      {
        q: 'Cum emit facturi?',
        a: 'Facturile se gestionează în cabinet → Facturi, legate de lucrări finalizate. Clientul le descarcă din portal. Funcționalitate Business.',
      },
      {
        q: 'Pot exporta sau tipări documentele?',
        a: 'Documentele generate în platformă pot fi vizualizate online de client; exportul PDF și integrări contabile extinse sunt în roadmap — contactați-ne pentru nevoi specifice.',
      },
    ],
  },
  {
    id: 'cont',
    title: 'Cont & autentificare',
    description: 'Înregistrare, login și tipuri de cont.',
    items: [
      {
        q: 'Cum mă autentific?',
        a: 'Puteți intra cu email sau număr de telefon (+373...) plus parolă. Aceeași parolă funcționează indiferent dacă folosiți emailul sau telefonul introdus la înregistrare.',
      },
      {
        q: 'Ce tipuri de cont există?',
        a: 'Companie (personal firmă), Client (portal pentru clienți finali) și Admin platformă (doar echipa Faber). La înregistrare alegeți Companie sau Client.',
      },
      {
        q: 'De ce este obligatoriu telefonul pentru clienți?',
        a: 'Telefonul permite legarea automată cu fișa client creată de companie și confirmarea identității la suport. Format recomandat: +373XXXXXXXX.',
      },
      {
        q: 'Trebuie să accept termenii la înregistrare?',
        a: 'Da. Bifați acceptarea Termenilor de utilizare și Politicii de confidențialitate — fără aceasta contul nu poate fi creat. Documentele sunt pe /terms și /privacy.',
      },
      {
        q: 'Am uitat parola. Ce fac?',
        a: 'Funcția de resetare parolă este în dezvoltare. Până atunci, contactați suportul la adresa din pagina Contacte cu emailul contului.',
      },
      {
        q: 'Pot avea același email pentru cont companie și client?',
        a: 'Nu — fiecare email este unic în sistem. Folosiți adrese diferite dacă testați ambele tipuri de cont.',
      },
    ],
  },
  {
    id: 'securitate',
    title: 'Securitate & confidențialitate',
    description: 'Protecția datelor, cookie-uri și conformitate.',
    items: [
      {
        q: 'Datele mele sunt în siguranță?',
        a: 'Folosim conexiuni HTTPS, parole stocate ca hash (argon2), autentificare cu token și baze de date izolate. Accesul la datele companiei este restricționat la membrii echipei dvs.',
      },
      {
        q: 'Respectați GDPR?',
        a: 'Da. Politica de confidențialitate descrie ce date colectăm, temeiul legal, drepturile utilizatorilor (acces, rectificare, ștergere) și contactul DPO. Citiți pagina Privacy completă.',
      },
      {
        q: 'Ce cookie-uri folosiți?',
        a: 'Cookie-uri esențiale pentru sesiune și preferințe (ex: consimțământ cookie). La prima vizită puteți Accepta sau Refuza bannerul — alegerea se salvează local în browser.',
      },
      {
        q: 'Cine vede datele clienților mei?',
        a: 'Doar utilizatorii din compania dvs. cu acces activ. Administratorii platformei Faber au acces tehnic limitat pentru suport și moderare (ex: verificare companii), conform politicii interne.',
      },
      {
        q: 'Unde sunt stocate datele?',
        a: 'Infrastructura este găzduită pe servere securizate în UE/zone conforme. Detalii suplimentare la cerere pentru clienți business.',
      },
      {
        q: 'Cum pot solicita ștergerea contului?',
        a: 'Trimiteți cerere la emailul din Contacte. Vom șterge sau anonimiza datele în termenele legale, exceptând evidențele fiscale pe care legea impune păstrarea lor.',
      },
    ],
  },
];
