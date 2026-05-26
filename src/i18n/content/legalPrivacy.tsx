import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  LegalList,
  LegalParagraph,
  LegalSection,
  LegalSubsection,
} from '@/components/legal/LegalDocumentLayout';
import type { AppLanguage } from '@/i18n/utils';

function renderPrivacyContentRo(termsPath: string): ReactNode {
  return (
    <>
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
          platformei, consultați pagina <Link to={termsPath}>Termeni și Condiții</Link>.
        </LegalParagraph>
      </LegalSection>
    </>
  );
}

function renderPrivacyContentRu(termsPath: string): ReactNode {
  return (
    <>
      <LegalSection id="introducere" number={1} title="Введение и оператор данных">
        <LegalParagraph>
          Оператором данных, ответственным за обработку персональных данных на платформе{' '}
          <strong>Faber Companii</strong>, является юридическое лицо, управляющее сервисом и
          зарегистрированное в Республике Молдова. По всем вопросам защиты данных вы можете
          связаться с нами по адресу <a href="mailto:privacy@faber.md">privacy@faber.md</a>.
        </LegalParagraph>
        <LegalParagraph>
          Настоящая политика распространяется на всех лиц, которые посещают публичный сайт, создают
          учётные записи, зарегистрированы как члены команд партнёрских компаний или используют
          портал для конечных клиентов. Использование платформы означает согласие с практиками,
          описанными в этом документе.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="date-colectate" number={2} title="Категории собираемых данных">
        <LegalParagraph>
          Мы собираем только те данные, которые необходимы для предоставления сервиса, обеспечения
          безопасности аккаунтов и выполнения юридических обязательств. В зависимости от вашей роли
          на платформе могут обрабатываться следующие категории:
        </LegalParagraph>
        <LegalSubsection title="Идентификационные и контактные данные">
          <LegalList
            items={[
              {
                label: 'Зарегистрированные пользователи:',
                text: 'имя, фамилия, адрес электронной почты, номер телефона, пароль (хранится исключительно в зашифрованном виде).',
              },
              {
                label: 'Партнёрские компании:',
                text: 'юридическое наименование, IDNO/CUI, адрес офиса, коммерческие контактные данные, публичное описание, логотип и изображения галереи.',
              },
              {
                label: 'Конечные клиенты:',
                text: 'имя, телефон, адрес, идентификационные данные, необходимые для работ, предложений и выставления счетов.',
              },
            ]}
          />
        </LegalSubsection>
        <LegalSubsection title="Операционные и финансовые данные">
          <LegalList
            items={[
              {
                text: 'Сведения о работах, выездах, записях, коммерческих предложениях, счетах и платежах, сформированных через платформу.',
              },
              {
                text: 'История активности в аккаунте, настройки уведомлений и параметры профиля.',
              },
              {
                text: 'Технические данные: IP-адрес, тип браузера, операционная система, журналы аутентификации и события безопасности.',
              },
            ]}
          />
        </LegalSubsection>
        <LegalParagraph>
          Мы намеренно не запрашиваем специальные категории данных (медицинские, биометрические,
          религиозные и т. п.), за исключением случаев, когда партнёрская компания добровольно
          вводит их в рамках собственных операционных процессов и самостоятельно несёт ответственность
          за правовое основание обработки.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="temei-legal" number={3} title="Правовые основания обработки">
        <LegalParagraph>
          Мы обрабатываем персональные данные на одном или нескольких правовых основаниях:
        </LegalParagraph>
        <LegalList
          items={[
            {
              label: 'Исполнение договора:',
              text: 'создание и администрирование аккаунта, предоставление функций SaaS, формирование операционных документов.',
            },
            {
              label: 'Юридическая обязанность:',
              text: 'ведение бухгалтерского и налогового учёта, ответы на запросы компетентных органов.',
            },
            {
              label: 'Законный интерес:',
              text: 'безопасность платформы, предотвращение мошенничества, улучшение сервиса, необходимые административные коммуникации.',
            },
            {
              label: 'Согласие:',
              text: 'для необязательных коммерческих рассылок или несущественных cookie, когда это применимо.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="scop" number={4} title="Цели обработки">
        <LegalParagraph>Данные используются исключительно в следующих целях:</LegalParagraph>
        <LegalList
          items={[
            {
              text: 'Оказание договорных услуг: цифровизация управления клиентами, работами, предложениями, календарём и выставлением счетов.',
            },
            {
              text: 'Безопасная аутентификация, управление сессиями и контроль доступа по ролям (администратор платформы, сотрудник компании, конечный клиент).',
            },
            {
              text: 'Публикация проверенных профилей компаний в публичном каталоге Faber Companii.',
            },
            {
              text: 'Техническая поддержка, операционные уведомления и коммуникации, связанные с аккаунтом или подпиской.',
            },
            {
              text: 'Агрегированный и анонимный анализ использования для повышения производительности и стабильности сервиса.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="destinatari" number={5} title="Получатели и уполномоченные лица">
        <LegalParagraph>
          Мы не продаём и не сдаём в аренду персональные данные третьим лицам. Доступ к данным может
          быть предоставлен только в следующих случаях:
        </LegalParagraph>
        <LegalList
          items={[
            {
              text: 'Поставщики инфраструктуры (хостинг, хранение, транзакционная почта, мониторинг), действующие как уполномоченные обработчики и обязанные по договору соблюдать конфиденциальность.',
            },
            {
              text: 'Партнёрская компания, которой принадлежит аккаунт, в отношении данных конечных клиентов, введённых ею в платформу.',
            },
            {
              text: 'Государственные органы, когда закон требует передачи информации.',
            },
          ]}
        />
        <LegalParagraph>
          Все технологические партнёры отбираются по строгим критериям безопасности и обязаны
          соблюдать конфиденциальность и обрабатывать данные согласно нашим инструкциям.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="stocare" number={6} title="Срок хранения">
        <LegalParagraph>
          Мы храним персональные данные, пока аккаунт активен и пока это необходимо для достижения
          описанных целей. После закрытия аккаунта:
        </LegalParagraph>
        <LegalList
          items={[
            {
              text: 'Операционные данные могут быть удалены или обезличены в течение 30–90 дней, если более длительное хранение не требуется законом.',
            },
            {
              text: 'Налоговые и бухгалтерские документы могут храниться в сроки, установленные законодательством Республики Молдова.',
            },
            {
              text: 'Технические журналы безопасности хранятся ограниченное время, пропорционально необходимости расследования инцидентов.',
            },
          ]}
        />
      </LegalSection>

      <LegalSection id="drepturi" number={7} title="Права субъектов данных">
        <LegalParagraph>
          В соответствии с GDPR и Законом № 133/2011 о защите персональных данных вы имеете следующие
          права:
        </LegalParagraph>
        <LegalList
          items={[
            {
              label: 'Право на доступ:',
              text: 'вы можете запросить подтверждение обработки и копию имеющихся данных.',
            },
            {
              label: 'Право на исправление:',
              text: 'вы можете исправить неполные или неточные данные в настройках аккаунта или письменным запросом.',
            },
            {
              label: 'Право на удаление:',
              text: 'вы можете запросить удаление данных, за исключением случаев, когда закон требует их сохранения.',
            },
            {
              label: 'Право на ограничение:',
              text: 'вы можете запросить ограничение обработки в определённых законом обстоятельствах.',
            },
            {
              label: 'Право на переносимость:',
              text: 'вы можете запросить экспорт данных в структурированном, широко используемом формате.',
            },
            {
              label: 'Право на возражение:',
              text: 'вы можете возразить против обработки на основании законного интереса, включая профилирование, в пределах, установленных законом.',
            },
            {
              label: 'Право на подачу жалобы:',
              text: 'вы можете обратиться в Национальный центр по защите персональных данных Республики Молдова.',
            },
          ]}
        />
        <LegalParagraph>
          Запросы направляйте на <a href="mailto:privacy@faber.md">privacy@faber.md</a>. Мы отвечаем в
          срок не более 30 календарных дней с момента подтверждения личности заявителя.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="securitate" number={8} title="Меры безопасности">
        <LegalParagraph>
          Мы применяем адекватные технические и организационные меры для защиты данных от
          несанкционированного доступа, утраты, уничтожения или изменения:
        </LegalParagraph>
        <LegalList
          items={[
            {
              text: 'Шифрование соединений через HTTPS/TLS для всего трафика между браузером и сервером.',
            },
            {
              text: 'Пароли хранятся исключительно в виде хеша с использованием современных алгоритмов (bcrypt), без сохранения открытого текста.',
            },
            {
              text: 'Токены доступа с ограниченным сроком действия и защищённый refresh token в httpOnly cookie.',
            },
            {
              text: 'Контроль доступа на основе ролей, журналирование критических событий и регулярное резервное копирование.',
            },
            {
              text: 'Разделение сред разработки, тестирования и production; ограниченный внутренний доступ к данным клиентов.',
            },
          ]}
        />
        <LegalParagraph>
          В случае инцидента безопасности, который может затронуть права субъектов данных, мы
          уведомим компетентный орган и, при необходимости, затронутых лиц в сроки, предусмотренные
          законом.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="cookie" number={9} title="Cookie и аналогичные технологии">
        <LegalParagraph>
          Платформа использует строго необходимые cookie для аутентификации, поддержания сессии и
          безопасности. Refresh cookie является httpOnly и недоступен из JavaScript. Мы также можем
          использовать локальное хранилище (sessionStorage) для токена доступа в текущей сессии
          браузера.
        </LegalParagraph>
        <LegalParagraph>
          Аналитические или маркетинговые cookie, если они будут введены позже, будут активированы
          только с явного согласия пользователя через специальный механизм настроек.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="transfer" number={10} title="Международные передачи">
        <LegalParagraph>
          Данные преимущественно обрабатываются в дата-центрах, расположенных в Европейском союзе
          или в юрисдикциях с адекватным уровнем защиты. Если передача в третьи страны станет
          необходимой, мы реализуем надлежащие гарантии (стандартные договорные положения, решения об
          адекватности или иные механизмы, признанные GDPR).
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="minori" number={11} title="Защита несовершеннолетних">
        <LegalParagraph>
          Faber Companii предназначен для использования физическими лицами не моложе 18 лет или
          законными представителями компаний. Мы намеренно не собираем данные несовершеннолетних.
          Если мы узнаем, что обработали такие данные без согласия родителей или законных опекунов, мы
          незамедлительно удалим их.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="modificari" number={12} title="Изменения политики">
        <LegalParagraph>
          Мы оставляем за собой право периодически обновлять настоящую политику в связи с
          законодательными, технологическими или операционными изменениями. Актуальная версия будет
          опубликована на этой странице с указанием даты последнего обновления. При существенных
          изменениях мы уведомим зарегистрированных пользователей по электронной почте или через
          видимое сообщение на платформе.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="contact" number={13} title="Контакты по защите данных">
        <LegalParagraph>
          Для реализации прав, вопросов или жалоб относительно обработки персональных данных
          обращайтесь к ответственному за защиту данных:{' '}
          <a href="mailto:privacy@faber.md">privacy@faber.md</a>.
        </LegalParagraph>
        <LegalParagraph>
          По общим договорным вопросам вы также можете написать на{' '}
          <a href="mailto:office@faber.md">office@faber.md</a>. Условия использования платформы
          см. на странице <Link to={termsPath}>Условия использования</Link>.
        </LegalParagraph>
      </LegalSection>
    </>
  );
}

export function renderPrivacyContent(locale: AppLanguage, termsPath: string): ReactNode {
  return locale === 'ru' ? renderPrivacyContentRu(termsPath) : renderPrivacyContentRo(termsPath);
}
