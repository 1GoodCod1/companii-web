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
  { id: 'general', label: 'Informații generale' },
  { id: 'definitii', label: 'Definiții' },
  { id: 'acceptare', label: 'Acceptarea termenilor' },
  { id: 'serviciu', label: 'Descrierea serviciului' },
  { id: 'conturi', label: 'Conturi și eligibilitate' },
  { id: 'abonamente', label: 'Abonamente și plăți' },
  { id: 'obligatii', label: 'Obligațiile utilizatorului' },
  { id: 'continut', label: 'Conținutul introdus de utilizatori' },
  { id: 'proprietate', label: 'Proprietate intelectuală' },
  { id: 'disponibilitate', label: 'Disponibilitate și suport' },
  { id: 'raspundere', label: 'Limitarea răspunderii' },
  { id: 'reziliere', label: 'Suspendare și reziliere' },
  { id: 'lege', label: 'Legea aplicabilă' },
  { id: 'modificari', label: 'Modificări ale termenilor' },
  { id: 'contact', label: 'Contact juridic' },
];

export function TermsPage() {
  return (
    <LegalDocumentLayout
      badge="Contract SaaS B2B"
      title="Termeni și Condiții de Utilizare"
      updatedAt={UPDATED_AT}
      intro="Prezentul document reglementează accesul și utilizarea platformei Faber Companii — soluție software ca serviciu (SaaS) pentru management operațional, relații cu clienții (CRM) și field service management (FSM). Vă rugăm să citiți cu atenție acești termeni înainte de crearea unui cont."
      toc={TOC}
      relatedLink={{ href: '/privacy', label: 'Consultă Politica de Confidențialitate' }}
    >
      <LegalSection id="general" number={1} title="Informații generale">
        <LegalParagraph>
          Platforma <strong>Faber Companii</strong> este operată de entitatea administratoare a
          serviciului, cu sediul în Republica Moldova. Acești Termeni și Condiții constituie un
          acord legal între operator și orice persoană fizică sau juridică care accesează site-ul,
          creează un cont sau utilizează funcționalitățile platformei.
        </LegalParagraph>
        <LegalParagraph>
          Documentul se completează cu Politica de Confidențialitate, descrierile planurilor de
          abonament publicate pe site și orice condiții comerciale suplimentare acceptate explicit
          de client.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="definitii" number={2} title="Definiții">
        <LegalList
          items={[
            {
              label: 'Platformă:',
              text: 'ecosistemul software Faber Companii, inclusiv site-ul public, panourile de administrare, API-urile și portalul clienților.',
            },
            {
              label: 'Utilizator:',
              text: 'orice persoană care accesează platforma, cu sau fără cont înregistrat.',
            },
            {
              label: 'Companie parteneră:',
              text: 'entitate economică înregistrată în platformă pentru gestionarea operațiunilor proprii.',
            },
            {
              label: 'Client final:',
              text: 'persoană fizică sau juridică a cărei date sunt gestionate de o companie parteneră prin platformă.',
            },
            {
              label: 'Conținut utilizator:',
              text: 'date, texte, imagini, documente și alte materiale introduse de utilizatori în platformă.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="acceptare" number={3} title="Acceptarea termenilor">
        <LegalParagraph>
          Prin crearea unui cont, autentificare, accesarea catalogului public sau utilizarea
          oricărei funcționalități a platformei, confirmați că ați citit, înțeles și acceptat
          integral prezentii Termeni și Condiții. Dacă nu sunteți de acord cu vreo prevedere, vă
          rugăm să nu utilizați serviciul.
        </LegalParagraph>
        <LegalParagraph>
          Pentru companii, acceptarea se consideră formulată de reprezentantul legal sau de
          persoana autorizată să creeze contul în numele entității respective.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="serviciu" number={4} title="Descrierea serviciului">
        <LegalParagraph>
          Faber Companii oferă o platformă SaaS destinată digitalizării proceselor companiilor de
          servicii. Funcționalitățile pot include, fără a se limita la:
        </LegalParagraph>
        <LegalList
          items={[
            {
              text: 'Profil public al companiei în catalogul Faber Companii, cu logo, galerie foto și pachete de servicii.',
            },
            {
              text: 'Gestionarea clienților, lucrărilor, ofertelor, programărilor și facturilor.',
            },
            {
              text: 'Conturi pentru membrii echipei (administratori, dispeceri, tehnicieni).',
            },
            {
              text: 'Portal securizat pentru clienții finali, cu acces la solicitări, oferte și documente.',
            },
            {
              text: 'Planuri de abonament Free, Pro și Business, cu limite și funcții diferențiate.',
            },
          ]}
        />
        <LegalParagraph>
          Operatorul poate adăuga, modifica sau retrage funcționalități pentru a îmbunătăți
          serviciul, cu informarea utilizatorilor în cazul modificărilor care afectează substanțial
          utilizarea planului activ.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="conturi" number={5} title="Conturi și eligibilitate">
        <LegalSubsection title="Eligibilitate">
          <LegalParagraph>
            Pentru a crea un cont de companie trebuie să aveți minimum 18 ani și să reprezentați o
            entitate economică validă sau să acționați ca persoană fizică autorizată (PFA/II). Conturile
            de client final sunt create de companiile partenere sau prin fluxuri de invitație
            controlate.
          </LegalParagraph>
        </LegalSubsection>
        <LegalSubsection title="Securitatea contului">
          <LegalParagraph>
            Sunteți responsabil pentru confidențialitatea credențialelor de autentificare (e-mail și
            parolă) și pentru toate acțiunile efectuate sub contul dvs. Trebuie să ne notificați
            imediat la <a href="mailto:office@faber.md">office@faber.md</a> dacă suspectați acces
            neautorizat.
          </LegalParagraph>
        </LegalSubsection>
        <LegalSubsection title="Informații corecte">
          <LegalParagraph>
            Vă obligați să furnizați date reale, complete și actualizate. Operatorul își rezervă
            dreptul de a suspenda conturile care conțin informații false, frauduloase sau care
            încalcă drepturile terților.
          </LegalParagraph>
        </LegalSubsection>
      </LegalSection>

      <LegalSection id="abonamente" number={6} title="Abonamente și plăți">
        <LegalParagraph>
          Accesul la funcționalități poate depinde de planul de abonament selectat. Planurile,
          prețurile, limitele de utilizatori și caracteristicile incluse sunt publicate pe pagina de
          abonamente și pot fi actualizate periodic.
        </LegalParagraph>
        <LegalList
          items={[
            {
              text: 'Planul Free poate fi activat fără cost și include funcționalități de bază.',
            },
            {
              text: 'Planurile Pro și Business pot include perioade promoționale gratuite, după care se aplică tarifele în vigoare.',
            },
            {
              text: 'Neplata abonamentului la termen poate duce la restricționarea accesului la funcții premium, fără ștergerea imediată a datelor.',
            },
            {
              text: 'Facturile emise prin platformă respectă cerințele fiscale ale companiei partenere; aceasta rămâne responsabilă pentru corectitudinea datelor fiscale introduse.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="obligatii" number={7} title="Obligațiile utilizatorului">
        <LegalParagraph>Utilizatorii se obligă să utilizeze platforma legal, etic și de bună-credință.</LegalParagraph>
        <LegalParagraph>Este strict interzis:</LegalParagraph>
        <LegalList
          items={[
            {
              text: 'Introducerea de date false, malițioase, defăimătoare sau care încalcă drepturile de proprietate intelectuală ale terților.',
            },
            {
              text: 'Tentative de acces neautorizat, scanare de vulnerabilități, atacuri DDoS, reverse engineering sau perturbarea funcționării normale a serviciului.',
            },
            {
              text: 'Utilizarea datelor clienților finali în alte scopuri decât cele operaționale/comerciale pentru care există temei legal.',
            },
            {
              text: 'Revânzarea, sublicențierea sau punerea la dispoziția terților neautorizați a accesului la platformă.',
            },
            {
              text: 'Transmiterea de malware, spam sau conținut ilegal prin intermediul platformei.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="continut" number={8} title="Conținutul introdus de utilizatori">
        <LegalParagraph>
          Compania parteneră rămâne proprietarul conținutului pe care îl introduce (date clienți,
          descrieri, imagini, documente). Acordați operatorului o licență neexclusivă, mondială și
          gratuită de a găzdui, procesa, afișa public (dacă profilul este publicat) și crea backup
          pentru conținut, exclusiv în scopul furnizării serviciului.
        </LegalParagraph>
        <LegalParagraph>
          Declarați că dețineți drepturile necesare asupra materialelor încărcate (logo, fotografii,
          texte) și că acestea nu încalcă legislația aplicabilă. Operatorul poate elimina conținut
          care primește notificări valide privind încălcarea drepturilor sau care contravine acestor
          termeni.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="proprietate" number={9} title="Proprietate intelectuală">
        <LegalParagraph>
          Platforma, codul sursă, designul interfeței, mărcile, logo-urile Faber și documentația
          aferentă sunt proprietatea operatorului sau a licențiatorilor săi. Nu vi se acordă niciun
          drept de proprietate asupra software-ului, ci doar un drept limitat, revocabil și
          netransferabil de utilizare conform planului activ.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="disponibilitate" number={10} title="Disponibilitate și suport">
        <LegalParagraph>
          Depunem eforturi rezonabile pentru menținerea disponibilității platformei, însă nu garantăm
          funcționarea neîntreruptă. Pot exista întreruperi planificate (mentenanță) sau
          neplanificate (incidente tehnice). Vom comunica, acolo unde este posibil, ferestrele de
          mentenanță programată.
        </LegalParagraph>
        <LegalParagraph>
          Suportul tehnic este disponibil prin canalele indicate pe pagina de contact. Timpul de
          răspuns poate varia în funcție de planul de abonament și severitatea solicitării.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="raspundere" number={11} title="Limitarea răspunderii">
        <LegalParagraph>
          Platforma este furnizată „ca atare” și „în funcție de disponibilitate”, în limitele
          permise de lege. Operatorul nu răspunde pentru pierderi indirecte, pierderi de profit,
          pierderi de date cauzate de utilizarea necorespunzătoare sau de neefectuarea backup-urilor
          proprii de către utilizator.
        </LegalParagraph>
        <LegalParagraph>
          Răspunderea totală a operatorului față de o companie parteneră, pentru orice pretenție
          legată de serviciu, este limitată la suma plătită de companie pentru abonament în ultimele
          12 luni anterioare evenimentului, dacă legea nu prevede altfel.
        </LegalParagraph>
        <LegalParagraph>
          Compania parteneră rămâne singurul responsabil față de clienții săi finali pentru
          serviciile prestate, facturare, calitatea lucrărilor și respectarea obligațiilor legale
          din domeniul său de activitate.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="reziliere" number={12} title="Suspendare și reziliere">
        <LegalParagraph>
          Puteți solicita închiderea contului în orice moment, contactând suportul. Operatorul poate
          suspenda sau rezilia accesul imediat, fără notificare prealabilă, dacă:
        </LegalParagraph>
        <LegalList
          items={[
            { text: 'Încălcați în mod repetat sau grav acești Termeni și Condiții.' },
            { text: 'Utilizarea contului pune în pericol securitatea platformei sau a altor utilizatori.' },
            { text: 'Există obligație legală sau ordin al unei autorități competente.' },
          ]}
        />
        <LegalParagraph>
          După reziliere, datele pot fi păstrate conform Politicii de Confidențialitate și
          obligațiilor legale. La cerere, vom furniza un export rezonabil al datelor, în măsura
          permisă de funcționalitățile platformei.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="lege" number={13} title="Legea aplicabilă">
        <LegalParagraph>
          Prezentul acord este guvernat de legislația Republicii Moldova. Orice litigiu va fi soluționat
          pe cale amiabilă, iar în caz de eșec, de instanțele competente din Republica Moldova,
          dacă părțile nu convin altfel în scris.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="modificari" number={14} title="Modificări ale termenilor">
        <LegalParagraph>
          Ne rezervăm dreptul de a actualiza acești Termeni și Condiții. Versiunea curentă va fi
          publicată pe această pagină, cu data ultimei modificări. Utilizarea continuă a platformei
          după intrarea în vigoare a modificărilor constituie acceptarea noilor condiții. Pentru
          schimbări majore, vom notifica utilizatorii înregistrați prin e-mail sau mesaj în platformă.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="contact" number={15} title="Contact juridic">
        <LegalParagraph>
          Pentru întrebări privind clauzele contractuale, notificări legale sau solicitări
          administrative, ne puteți contacta la:{' '}
          <a href="mailto:office@faber.md">office@faber.md</a>.
        </LegalParagraph>
        <LegalParagraph>
          Pentru aspecte privind protecția datelor personale, consultați{' '}
          <Link to="/privacy">Politica de Confidențialitate</Link> sau scrieți la{' '}
          <a href="mailto:privacy@faber.md">privacy@faber.md</a>.
        </LegalParagraph>
      </LegalSection>
    </LegalDocumentLayout>
  );
}
