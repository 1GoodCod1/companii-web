import { Link } from 'react-router-dom';
import {
  LegalDocumentLayout,
  LegalList,
  LegalParagraph,
  LegalSection,
  LegalSubsection,
} from '@/components/legal/LegalDocumentLayout';

const UPDATED_AT = '25 mai 2026';

const TOC = [
  { id: 'introducere', label: 'Introducere și operator de date' },
  { id: 'date-colectate', label: 'Categorii de date colectate' },
  { id: 'temei-legal', label: 'Temeiul legal al procesării' },
  { id: 'scop', label: 'Scopurile procesării' },
  { id: 'destinatari', label: 'Destinatari și împuterniciți' },
  { id: 'stocare', label: 'Durata stocării' },
  { id: 'drepturi', label: 'Drepturile persoanelor vizate' },
  { id: 'securitate', label: 'Măsuri de securitate' },
  { id: 'cookie', label: 'Cookie-uri și tehnologii similare' },
  { id: 'transfer', label: 'Transferuri internaționale' },
  { id: 'minori', label: 'Protecția minorilor' },
  { id: 'modificari', label: 'Modificări ale politicii' },
  { id: 'contact', label: 'Contact privind protecția datelor' },
];

export function PrivacyPage() {
  return (
    <LegalDocumentLayout
      badge="GDPR & Legea 133/2011"
      title="Politica de Confidențialitate"
      updatedAt={UPDATED_AT}
      intro="Această politică descrie modul în care Faber Companii colectează, utilizează, stochează și protejează datele personale ale utilizatorilor platformei SaaS de management operațional (FSM & CRM), în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și legislația Republicii Moldova privind protecția datelor cu caracter personal."
      toc={TOC}
      relatedLink={{ href: '/terms', label: 'Consultă Termenii și Condițiile' }}
    >
      <LegalSection id="introducere" number={1} title="Introducere și operator de date">
        <LegalParagraph>
          Operatorul de date responsabil pentru procesarea datelor personale în cadrul platformei{' '}
          <strong>Faber Companii</strong> este entitatea care administrează serviciul, cu sediul în
          Republica Moldova. Pentru orice solicitări privind protecția datelor ne puteți contacta la{' '}
          <a href="mailto:privacy@faber.md">privacy@faber.md</a>.
        </LegalParagraph>
        <LegalParagraph>
          Prezenta politică se aplică tuturor persoanelor care accesează site-ul public, creează
          conturi de utilizator, sunt înregistrate ca membri ai echipelor companiilor partenere sau
          accesează portalul dedicat clienților finali. Utilizarea platformei implică acceptarea
          practicilor descrise în acest document.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="date-colectate" number={2} title="Categorii de date colectate">
        <LegalParagraph>
          Colectăm doar datele necesare pentru furnizarea serviciului, securitatea conturilor și
          respectarea obligațiilor legale. În funcție de rolul dvs. în platformă, pot fi prelucrate
          următoarele categorii:
        </LegalParagraph>
        <LegalSubsection title="Date de identificare și contact">
          <LegalList
            items={[
              {
                label: 'Utilizatori înregistrați:',
                text: 'nume, prenume, adresă de e-mail, număr de telefon, parolă (stocată exclusiv sub formă criptată).',
              },
              {
                label: 'Companii partenere:',
                text: 'denumirea legală, IDNO/CUI, adresa sediului, date de contact comercial, descriere publică, logo și imagini de galerie.',
              },
              {
                label: 'Clienți finali:',
                text: 'nume, telefon, adresă, date de identificare necesare pentru lucrări, oferte și facturare.',
              },
            ]}
          />
        </LegalSubsection>
        <LegalSubsection title="Date operaționale și financiare">
          <LegalList
            items={[
              {
                text: 'Informații despre lucrări, intervenții, programări, oferte comerciale, facturi și plăți generate prin platformă.',
              },
              {
                text: 'Istoricul activității în cont, preferințe de notificare și setări de profil.',
              },
              {
                text: 'Date tehnice: adresă IP, tip browser, sistem de operare, jurnale de autentificare și evenimente de securitate.',
              },
            ]}
          />
        </LegalSubsection>
        <LegalParagraph>
          Nu solicităm în mod intenționat categorii speciale de date (date medicale, biometrice,
          religie etc.), cu excepția cazurilor în care compania parteneră le introduce voluntar în
          cadrul propriilor procese operaționale și își asumă responsabilitatea pentru temeiul legal
          al prelucrării.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="temei-legal" number={3} title="Temeiul legal al procesării">
        <LegalParagraph>Procesăm datele personale pe baza unuia sau mai multor temeiuri legale:</LegalParagraph>
        <LegalList
          items={[
            {
              label: 'Executarea contractului:',
              text: 'crearea și administrarea contului, furnizarea funcționalităților SaaS, generarea documentelor operaționale.',
            },
            {
              label: 'Obligație legală:',
              text: 'păstrarea evidențelor contabile și fiscale, răspunsul la solicitări ale autorităților competente.',
            },
            {
              label: 'Interes legitim:',
              text: 'securitatea platformei, prevenirea fraudelor, îmbunătățirea serviciului, comunicări administrative necesare.',
            },
            {
              label: 'Consimțământ:',
              text: 'pentru comunicări comerciale opționale sau cookie-uri neesențiale, acolo unde este cazul.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="scop" number={4} title="Scopurile procesării">
        <LegalParagraph>Datele sunt utilizate exclusiv în scopurile de mai jos:</LegalParagraph>
        <LegalList
          items={[
            {
              text: 'Prestarea serviciilor contractate: digitalizarea gestionării clienților, lucrărilor, ofertelor, calendarului și facturării.',
            },
            {
              text: 'Autentificarea securizată, administrarea sesiunilor și controlul accesului pe roluri (administrator platformă, personal companie, client final).',
            },
            {
              text: 'Publicarea profilurilor verificate ale companiilor în catalogul public Faber Companii.',
            },
            {
              text: 'Suport tehnic, notificări operaționale și comunicări legate de cont sau abonament.',
            },
            {
              text: 'Analiza agregată și anonimă a utilizării, pentru îmbunătățirea performanței și stabilității serviciului.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="destinatari" number={5} title="Destinatari și împuterniciți">
        <LegalParagraph>
          Nu vindem și nu închiriem datele personale către terți. Accesul la date poate fi acordat
          doar în următoarele situații:
        </LegalParagraph>
        <LegalList
          items={[
            {
              text: 'Furnizori de infrastructură (hosting, stocare, e-mail tranzacțional, monitorizare) care acționează ca împuterniciți și sunt obligați contractual să respecte confidențialitatea.',
            },
            {
              text: 'Compania parteneră căreia îi aparține contul, în cazul datelor clienților finali introduse de aceasta în platformă.',
            },
            {
              text: 'Autorități publice, atunci când legea impune transmiterea informațiilor.',
            },
          ]}
        />
        <LegalParagraph>
          Toți partenerii tehnologici sunt selectați conform unor criterii stricte de securitate și
          sunt supuși obligațiilor de confidențialitate și procesare conform instrucțiunilor noastre.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="stocare" number={6} title="Durata stocării">
        <LegalParagraph>
          Păstrăm datele personale atât timp cât contul este activ și cât este necesar pentru
          îndeplinirea scopurilor descrise. După închiderea contului:
        </LegalParagraph>
        <LegalList
          items={[
            {
              text: 'Datele operaționale pot fi șterse sau anonimizate în termen de 30–90 de zile, cu excepția cazurilor în care legea impune păstrarea mai îndelungată.',
            },
            {
              text: 'Documentele fiscale și contabile pot fi păstrate conform termenelor legale aplicabile în Republica Moldova.',
            },
            {
              text: 'Jurnalele tehnice de securitate sunt păstrate pe perioade limitate, proporțional cu necesitatea investigării incidentelor.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="drepturi" number={7} title="Drepturile persoanelor vizate">
        <LegalParagraph>
          În conformitate cu GDPR și Legea nr. 133/2011 privind protecția datelor cu caracter
          personal, beneficiați de următoarele drepturi:
        </LegalParagraph>
        <LegalList
          items={[
            {
              label: 'Dreptul de acces:',
              text: 'puteți solicita confirmarea prelucrării și o copie a datelor deținute.',
            },
            {
              label: 'Dreptul la rectificare:',
              text: 'puteți corecta date incomplete sau inexacte direct din setările contului sau prin solicitare scrisă.',
            },
            {
              label: 'Dreptul la ștergere:',
              text: 'puteți solicita ștergerea datelor, cu excepția cazurilor în care legea impune păstrarea acestora.',
            },
            {
              label: 'Dreptul la restricționare:',
              text: 'puteți solicita limitarea prelucrării în anumite circumstanțe prevăzute de lege.',
            },
            {
              label: 'Dreptul la portabilitate:',
              text: 'puteți solicita exportul datelor într-un format structurat, utilizat în mod curent.',
            },
            {
              label: 'Dreptul de opoziție:',
              text: 'puteți vă opune prelucrării bazate pe interes legitim, inclusiv profilării, în condițiile legii.',
            },
            {
              label: 'Dreptul de a depune plângere:',
              text: 'puteți contacta Centrul Național pentru Protecția Datelor cu Caracter Personal al Republicii Moldova.',
            },
          ]}
        />
        <LegalParagraph>
          Solicitările se trimit la <a href="mailto:privacy@faber.md">privacy@faber.md</a>. Răspundem
          în termen de maximum 30 de zile calendaristice de la confirmarea identității solicitantului.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="securitate" number={8} title="Măsuri de securitate">
        <LegalParagraph>
          Implementăm măsuri tehnice și organizatorice adecvate pentru protejarea datelor împotriva
          accesului neautorizat, pierderii, distrugerii sau alterării:
        </LegalParagraph>
        <LegalList
          items={[
            {
              text: 'Criptarea conexiunilor prin HTTPS/TLS pentru tot traficul dintre browser și server.',
            },
            {
              text: 'Parole stocate exclusiv sub formă hash cu algoritmi moderni (bcrypt), fără păstrarea textului clar.',
            },
            {
              text: 'Token-uri de acces cu durată limitată și refresh token securizat în cookie httpOnly.',
            },
            {
              text: 'Control al accesului pe bază de roluri, jurnalizare a evenimentelor critice și backup periodic.',
            },
            {
              text: 'Separarea mediilor de dezvoltare, testare și producție; acces intern restricționat la datele clienților.',
            },
          ]}
        />
        <LegalParagraph>
          În cazul unui incident de securitate care poate afecta drepturile persoanelor vizate, vom
          notifica autoritatea competentă și, după caz, persoanele afectate, în termenele prevăzute de
          lege.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="cookie" number={9} title="Cookie-uri și tehnologii similare">
        <LegalParagraph>
          Platforma utilizează cookie-uri strict necesare pentru autentificare, menținerea sesiunii
          și securitate. Cookie-ul de refresh este httpOnly și nu este accesibil din JavaScript.
          Putem utiliza, de asemenea, stocare locală (sessionStorage) pentru token-ul de acces în
          sesiunea curentă a browserului.
        </LegalParagraph>
        <LegalParagraph>
          Cookie-urile analitice sau de marketing, dacă vor fi introduse ulterior, vor fi activate
          numai cu consimțământul explicit al utilizatorului, printr-un mecanism dedicat de
          preferințe.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="transfer" number={10} title="Transferuri internaționale">
        <LegalParagraph>
          Datele sunt procesate preponderent în centre de date situate în Uniunea Europeană sau în
          jurisdicții care oferă un nivel adecvat de protecție. Dacă transferul către țări terțe
          devine necesar, vom implementa garanții adecvate (clauze contractuale standard, decizii de
          adecvare sau alte mecanisme recunoscute de GDPR).
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="minori" number={11} title="Protecția minorilor">
        <LegalParagraph>
          Faber Companii este destinat utilizării de către persoane fizice cu vârsta de minimum 18
          ani sau reprezentanți legali ai companiilor. Nu colectăm în mod intenționat date de la
          minori. Dacă aflăm că am prelucrat astfel de date fără consimțământul părinților sau
          tutorilor legali, le vom șterge prompt.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="modificari" number={12} title="Modificări ale politicii">
        <LegalParagraph>
          Ne rezervăm dreptul de a actualiza periodic această politică pentru a reflecta modificări
          legislative, tehnologice sau operaționale. Versiunea curentă va fi publicată pe această
          pagină, cu data ultimei actualizări. Pentru modificări substanțiale, vom notifica
          utilizatorii înregistrați prin e-mail sau printr-un mesaj vizibil în platformă.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="contact" number={13} title="Contact privind protecția datelor">
        <LegalParagraph>
          Pentru exercitarea drepturilor, întrebări sau reclamații privind prelucrarea datelor
          personale, contactați Responsabilul cu protecția datelor la:{' '}
          <a href="mailto:privacy@faber.md">privacy@faber.md</a>.
        </LegalParagraph>
        <LegalParagraph>
          Pentru aspecte contractuale generale, ne puteți scrie și la{' '}
          <a href="mailto:office@faber.md">office@faber.md</a>. Pentru termenii de utilizare ai
          platformei, consultați pagina <Link to="/terms">Termeni și Condiții</Link>.
        </LegalParagraph>
      </LegalSection>
    </LegalDocumentLayout>
  );
}
