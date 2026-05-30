import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  LegalList,
  LegalParagraph,
  LegalSection,
  LegalSubsection,
} from '@/components/legal/LegalDocumentLayout';
import type { AppLanguage } from '@/i18n/utils';

function renderTermsContentRo(privacyPath: string): ReactNode {
  return (
    <>
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
              text: 'Conturi pentru membrii echipei (administratori, dispeceri, angajați).',
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
          <Link to={privacyPath}>Politica de Confidențialitate</Link> sau scrieți la{' '}
          <a href="mailto:privacy@faber.md">privacy@faber.md</a>.
        </LegalParagraph>
      </LegalSection>
    </>
  );
}

function renderTermsContentRu(privacyPath: string): ReactNode {
  return (
    <>
      <LegalSection id="general" number={1} title="Общая информация">
        <LegalParagraph>
          Платформой <strong>Faber Companii</strong> управляет юридическое лицо, администрирующее
          сервис и зарегистрированное в Республике Молдова. Настоящие Условия использования
          представляют собой юридическое соглашение между оператором и любым физическим или
          юридическим лицом, которое посещает сайт, создаёт аккаунт или использует функции платформы.
        </LegalParagraph>
        <LegalParagraph>
          Документ дополняется Политикой конфиденциальности, описаниями тарифных планов,
          опубликованными на сайте, и любыми дополнительными коммерческими условиями, явно
          принятыми клиентом.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="definitii" number={2} title="Определения">
        <LegalList
          items={[
            {
              label: 'Платформа:',
              text: 'программная экосистема Faber Companii, включая публичный сайт, панели администрирования, API и клиентский портал.',
            },
            {
              label: 'Пользователь:',
              text: 'любое лицо, которое получает доступ к платформе, с зарегистрированным аккаунтом или без него.',
            },
            {
              label: 'Партнёрская компания:',
              text: 'хозяйствующий субъект, зарегистрированный на платформе для управления собственными операциями.',
            },
            {
              label: 'Конечный клиент:',
              text: 'физическое или юридическое лицо, чьи данные управляются партнёрской компанией через платформу.',
            },
            {
              label: 'Пользовательский контент:',
              text: 'данные, тексты, изображения, документы и иные материалы, загруженные пользователями на платформу.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="acceptare" number={3} title="Принятие условий">
        <LegalParagraph>
          Создавая аккаунт, выполняя вход, просматривая публичный каталог или используя любую
          функцию платформы, вы подтверждаете, что прочитали, поняли и полностью принимаете настоящие
          Условия использования. Если вы не согласны с каким-либо положением, пожалуйста, не
          используйте сервис.
        </LegalParagraph>
        <LegalParagraph>
          Для компаний принятие условий считается оформленным законным представителем или лицом,
          уполномоченным создать аккаунт от имени соответствующего субъекта.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="serviciu" number={4} title="Описание сервиса">
        <LegalParagraph>
          Faber Companii предоставляет SaaS-платформу для цифровизации процессов сервисных компаний.
          Функции могут включать, но не ограничиваются:
        </LegalParagraph>
        <LegalList
          items={[
            {
              text: 'Публичный профиль компании в каталоге Faber Companii с логотипом, фотогалереей и пакетами услуг.',
            },
            {
              text: 'Управление клиентами, работами, предложениями, записями и счетами.',
            },
            {
              text: 'Аккаунты для членов команды (администраторы, диспетчеры, сотрудники).',
            },
            {
              text: 'Защищённый портал для конечных клиентов с доступом к заявкам, предложениям и документам.',
            },
            {
              text: 'Тарифные планы Free, Pro и Business с различными лимитами и функциями.',
            },
          ]}
        />
        <LegalParagraph>
          Оператор может добавлять, изменять или отзывать функции для улучшения сервиса с
          уведомлением пользователей в случае изменений, существенно влияющих на использование
          активного плана.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="conturi" number={5} title="Аккаунты и право на использование">
        <LegalSubsection title="Право на использование">
          <LegalParagraph>
            Для создания корпоративного аккаунта вам должно быть не менее 18 лет, и вы должны
            представлять действующий хозяйствующий субъект или действовать как индивидуальный
            предприниматель (PFA/II). Аккаунты конечных клиентов создаются партнёрскими компаниями
            или через контролируемые приглашения.
          </LegalParagraph>
        </LegalSubsection>
        <LegalSubsection title="Безопасность аккаунта">
          <LegalParagraph>
            Вы несёте ответственность за конфиденциальность учётных данных (email и пароль) и за все
            действия, выполненные под вашим аккаунтом. Немедленно сообщите нам на{' '}
            <a href="mailto:office@faber.md">office@faber.md</a>, если подозреваете несанкционированный
            доступ.
          </LegalParagraph>
        </LegalSubsection>
        <LegalSubsection title="Достоверность информации">
          <LegalParagraph>
            Вы обязуетесь предоставлять достоверные, полные и актуальные данные. Оператор оставляет
            за собой право приостановить аккаунты, содержащие ложную, мошенническую информацию или
            нарушающие права третьих лиц.
          </LegalParagraph>
        </LegalSubsection>
      </LegalSection>

      <LegalSection id="abonamente" number={6} title="Подписки и оплата">
        <LegalParagraph>
          Доступ к функциям может зависеть от выбранного тарифного плана. Планы, цены, лимиты
          пользователей и включённые возможности публикуются на странице подписок и могут
          периодически обновляться.
        </LegalParagraph>
        <LegalList
          items={[
            {
              text: 'План Free может быть активирован бесплатно и включает базовые функции.',
            },
            {
              text: 'Планы Pro и Business могут включать бесплатные промо-периоды, после которых применяются действующие тарифы.',
            },
            {
              text: 'Несвоевременная оплата подписки может привести к ограничению доступа к премиум-функциям без немедленного удаления данных.',
            },
            {
              text: 'Счета, выставленные через платформу, соответствуют налоговым требованиям партнёрской компании; она остаётся ответственной за корректность введённых налоговых данных.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="obligatii" number={7} title="Обязанности пользователя">
        <LegalParagraph>
          Пользователи обязуются использовать платформу законно, этично и добросовестно.
        </LegalParagraph>
        <LegalParagraph>Строго запрещено:</LegalParagraph>
        <LegalList
          items={[
            {
              text: 'Ввод ложных, вредоносных, клеветнических данных или данных, нарушающих права интеллектуальной собственности третьих лиц.',
            },
            {
              text: 'Попытки несанкционированного доступа, сканирование уязвимостей, DDoS-атаки, reverse engineering или нарушение нормальной работы сервиса.',
            },
            {
              text: 'Использование данных конечных клиентов в иных целях, кроме операционных/коммерческих, для которых существует правовое основание.',
            },
            {
              text: 'Перепродажа, сублицензирование или предоставление доступа к платформе неавторизованным третьим лицам.',
            },
            {
              text: 'Распространение malware, spam или незаконного контента через платформу.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="continut" number={8} title="Пользовательский контент">
        <LegalParagraph>
          Партнёрская компания остаётся владельцем контента, который она вводит (данные клиентов,
          описания, изображения, документы). Вы предоставляете оператору неисключительную,
          всемирную и безвозмездную лицензию на размещение, обработку, публичное отображение (если
          профиль опубликован) и резервное копирование контента исключительно для предоставления
          сервиса.
        </LegalParagraph>
        <LegalParagraph>
          Вы заявляете, что обладаете необходимыми правами на загружаемые материалы (логотип,
          фотографии, тексты) и что они не нарушают применимое законодательство. Оператор может
          удалить контент, по которому получены обоснованные уведомления о нарушении прав или который
          противоречит настоящим условиям.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="proprietate" number={9} title="Интеллектуальная собственность">
        <LegalParagraph>
          Платформа, исходный код, дизайн интерфейса, товарные знаки, логотипы Faber и сопутствующая
          документация являются собственностью оператора или его лицензиаров. Вам не предоставляется
          никакое право собственности на программное обеспечение, а только ограниченное, отзывное и
          непередаваемое право использования в соответствии с активным планом.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="disponibilitate" number={10} title="Доступность и поддержка">
        <LegalParagraph>
          Мы прилагаем разумные усилия для поддержания доступности платформы, однако не гарантируем
          бесперебойную работу. Возможны плановые (обслуживание) или внеплановые (технические
          инциденты) перерывы. По возможности мы сообщаем о запланированных окнах обслуживания.
        </LegalParagraph>
        <LegalParagraph>
          Техническая поддержка доступна через каналы, указанные на странице контактов. Время ответа
          может зависеть от тарифного плана и серьёзности запроса.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="raspundere" number={11} title="Ограничение ответственности">
        <LegalParagraph>
          Платформа предоставляется «как есть» и «по мере доступности» в пределах, допустимых законом.
          Оператор не несёт ответственности за косвенные убытки, упущенную выгоду, потерю данных,
          вызванную неправильным использованием или отсутствием собственного резервного копирования
          со стороны пользователя.
        </LegalParagraph>
        <LegalParagraph>
          Совокупная ответственность оператора перед партнёрской компанией по любому требованию,
          связанному с сервисом, ограничена суммой, уплаченной компанией за подписку за 12 месяцев,
          предшествующих событию, если иное не предусмотрено законом.
        </LegalParagraph>
        <LegalParagraph>
          Партнёрская компания остаётся единственным ответственным перед своими конечными клиентами за
          оказываемые услуги, выставление счетов, качество работ и соблюдение юридических
          обязательств в своей сфере деятельности.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="reziliere" number={12} title="Приостановка и расторжение">
        <LegalParagraph>
          Вы можете запросить закрытие аккаунта в любое время, обратившись в поддержку. Оператор может
          немедленно приостановить или прекратить доступ без предварительного уведомления, если:
        </LegalParagraph>
        <LegalList
          items={[
            { text: 'Вы неоднократно или существенно нарушаете настоящие Условия использования.' },
            { text: 'Использование аккаунта угрожает безопасности платформы или других пользователей.' },
            { text: 'Существует юридическая обязанность или распоряжение компетентного органа.' },
          ]}
        />
        <LegalParagraph>
          После расторжения данные могут храниться в соответствии с Политикой конфиденциальности и
          юридическими обязательствами. По запросу мы предоставим разумный экспорт данных в пределах
          возможностей платформы.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="lege" number={13} title="Применимое право">
        <LegalParagraph>
          Настоящее соглашение регулируется законодательством Республики Молдова. Любой спор
          разрешается путём переговоров, а при неудаче — компетентными судами Республики Молдова,
          если стороны письменно не договорятся об ином.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="modificari" number={14} title="Изменения условий">
        <LegalParagraph>
          Мы оставляем за собой право обновлять настоящие Условия использования. Актуальная версия
          будет опубликована на этой странице с датой последнего изменения. Продолжение использования
          платформы после вступления изменений в силу означает принятие новых условий. При существенных
          изменениях мы уведомим зарегистрированных пользователей по email или сообщением на платформе.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="contact" number={15} title="Юридические контакты">
        <LegalParagraph>
          По вопросам договорных положений, юридических уведомлений или административных запросов
          обращайтесь: <a href="mailto:office@faber.md">office@faber.md</a>.
        </LegalParagraph>
        <LegalParagraph>
          По вопросам защиты персональных данных см.{' '}
          <Link to={privacyPath}>Политику конфиденциальности</Link> или пишите на{' '}
          <a href="mailto:privacy@faber.md">privacy@faber.md</a>.
        </LegalParagraph>
      </LegalSection>
    </>
  );
}

export function renderTermsContent(locale: AppLanguage, privacyPath: string): ReactNode {
  return locale === 'ru' ? renderTermsContentRu(privacyPath) : renderTermsContentRo(privacyPath);
}
