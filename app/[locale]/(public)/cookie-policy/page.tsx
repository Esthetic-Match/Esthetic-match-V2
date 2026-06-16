import Script from "next/script";

const sections = [
  {
    title: "Préambule",
    content: [
      "La présente Politique de Cookies (la « Politique ») décrit la manière dont Esthetic Match OÜ (ci-après « Esthetic Match », « nous » ou « notre ») utilise des cookies et technologies similaires (ci-après collectivement « traceurs ») lorsque vous accédez à la web-application Esthetic Match (ci-après la « Plateforme »).",
      "Elle s'inscrit dans le cadre de notre engagement en matière de transparence et de respect de la vie privée, en conformité avec les lois et réglementations applicables dans la juridiction de l'utilisateur relatives à la protection des données personnelles et à la confidentialité des communications électroniques.",
      "En accédant à la Plateforme, vous reconnaissez avoir pris connaissance de la présente Politique et disposez de la faculté de paramétrer vos préférences en matière de traceurs selon les modalités décrites ci-dessous.",
    ],
  },
  {
    title: "Article 1 – Définitions",
    content: [
      "Pour l'application de la présente Politique, les termes suivants sont définis comme suit :",
      "« Cookie » : fichier texte de petite taille déposé et stocké dans le navigateur ou terminal de l'utilisateur lors de la visite d'un site web ou de l'utilisation d'une application, permettant au serveur de mémoriser des informations sur la session de l'utilisateur.",
      "« Traceur » : terme générique désignant tout dispositif de stockage ou de lecture d'informations sur le terminal de l'utilisateur, comprenant les cookies, pixels, balises web, SDK JavaScript et technologies similaires utilisés dans un contexte de navigation web.",
      "« Cookie essentiel » ou « strictement nécessaire » : traceur indispensable au fonctionnement de la Plateforme ou à la fourniture du service expressément demandé par l'utilisateur, pour lequel aucun consentement n'est requis.",
      "« Cookie fonctionnel » : traceur permettant de mémoriser les préférences de l'utilisateur et d'améliorer son expérience sans finalité publicitaire.",
      "« Cookie analytique » : traceur utilisé pour mesurer l'audience et analyser le comportement des utilisateurs sur la Plateforme afin d'en améliorer les performances et le contenu.",
      "« Cookie tiers » : traceur déposé par un domaine distinct de celui de la Plateforme, relevant de la politique de confidentialité du tiers concerné.",
      "« Consentement » : manifestation de volonté libre, spécifique, éclairée et univoque par laquelle l'utilisateur accepte l'utilisation de traceurs non essentiels, matérialisée par une action positive, notamment un clic sur « Accepter » ou une configuration via le Centre de préférences.",
      "« Centre de préférences » : interface mise à disposition par Esthetic Match permettant à l'utilisateur de paramétrer, à tout moment, l'activation ou la désactivation des différentes catégories de traceurs.",
    ],
  },
  {
    title: "Article 2 – Technologies utilisées",
    content: [
      "Esthetic Match recourt à plusieurs technologies pour la collecte et le traitement d'informations sur les terminaux des utilisateurs.",
      "Les cookies HTTP sont des fichiers texte stockés dans le navigateur web de l'utilisateur. Ils peuvent être de session, c'est-à-dire supprimés à la fermeture du navigateur, ou persistants, c'est-à-dire conservés pour une durée déterminée.",
      "Esthetic Match utilise le SDK JavaScript de Firebase Analytics via navigateur web. Ce SDK permet la collecte d'informations analytiques et fonctionnelles, notamment les événements d'utilisation et les propriétés de session.",
      "Le SDK JavaScript de Firebase Analytics opère exclusivement dans le contexte du navigateur web de l'utilisateur et ne collecte pas d'identifiants propres aux systèmes d'exploitation mobiles.",
      "Esthetic Match peut également utiliser des pixels et balises web. Il s'agit d'éléments graphiques transparents insérés dans des pages web ou e-mails permettant de détecter si un utilisateur a effectué une action déterminée, telle que l'ouverture d'un e-mail ou la visite d'une page.",
      "Esthetic Match peut utiliser des pixels fournis par des prestataires analytiques tiers.",
    ],
  },
  {
    title: "Article 3 – Catégories de traceurs et finalités",
    content: [
      "Les traceurs déployés sur la Plateforme sont regroupés en quatre catégories selon leur finalité. Seuls les traceurs essentiels sont actifs par défaut ; les autres catégories requièrent votre consentement préalable.",
      "Les traceurs essentiels, ou strictement nécessaires, sont indispensables au fonctionnement de la Plateforme et ne peuvent être désactivés.",
      "Ils assurent notamment la gestion des sessions et de l'authentification des utilisateurs, patients et praticiens, la sécurité des échanges et la prévention des attaques informatiques, notamment CSRF et injections, la mémorisation des préférences de consentement aux traceurs, la mise en place et la sécurisation des paiements via Stripe, ainsi que l'équilibrage de charge et la gestion des performances de l'infrastructure Google Cloud Platform.",
      "La base légale des traceurs essentiels est l'intérêt légitime ou l'exécution du contrat. Aucun consentement n'est requis.",
      "_em_session : cookie essentiel fourni par Esthetic Match, utilisé pour la gestion de la session utilisateur. Durée : session. Base légale : contrat.",
      "_em_csrf : cookie essentiel fourni par Esthetic Match, utilisé pour la protection contre les attaques CSRF. Durée : session. Base légale : intérêt légitime.",
      "_em_consent : cookie essentiel fourni par Esthetic Match, utilisé pour la mémorisation des préférences de cookies. Durée : treize (13) mois. Base légale : obligation légale.",
      "__stripe_sid : cookie essentiel fourni par Stripe Inc., utilisé pour la sécurisation des paiements. Durée : session. Base légale : contrat.",
      "__stripe_mid : cookie essentiel fourni par Stripe Inc., utilisé pour la détection de fraude paiement. Durée : un (1) an. Base légale : intérêt légitime.",
      "Les traceurs fonctionnels améliorent votre expérience en mémorisant vos préférences et en personnalisant certains aspects de la Plateforme. Ils ne sont pas utilisés à des fins publicitaires.",
      "Ils permettent notamment la mémorisation de la langue de navigation, la mémorisation des filtres de recherche de praticiens, ainsi que la conservation des préférences de navigation entre deux sessions.",
      "La base légale des traceurs fonctionnels est le consentement.",
      "_em_lang : cookie fonctionnel fourni par Esthetic Match, utilisé pour la mémorisation de la langue. Durée : douze (12) mois. Base légale : consentement.",
      "_em_filters : cookie fonctionnel fourni par Esthetic Match, utilisé pour la mémorisation des filtres de recherche. Durée : trois (3) mois. Base légale : consentement.",
      "_em_prefs : cookie fonctionnel fourni par Esthetic Match, utilisé pour la mémorisation des préférences de navigation. Durée : trente (30) jours. Base légale : consentement.",
      "Les traceurs analytiques nous permettent de mesurer l'audience de la Plateforme et d'analyser le comportement des utilisateurs afin d'améliorer nos services. Les données collectées sont agrégées et ne permettent pas d'identifier personnellement les utilisateurs.",
      "Ils permettent notamment de mesurer le nombre de visiteurs, de sessions et de pages vues, d'analyser les parcours utilisateurs et les taux de conversion, de détecter les erreurs techniques et les pages lentes, ainsi que de mesurer les performances de la Plateforme via Firebase Analytics.",
      "La base légale des traceurs analytiques est le consentement.",
      "_ga : cookie analytique fourni par Google LLC, utilisé pour la distinction des utilisateurs dans Google Analytics 4. Durée : treize (13) mois. Base légale : consentement.",
      "_ga_XXXX : cookie analytique fourni par Google LLC, utilisé pour le maintien de l'état de session GA4. Durée : treize (13) mois. Base légale : consentement.",
      "_gid : cookie analytique fourni par Google LLC, utilisé pour la distinction des utilisateurs sur vingt-quatre (24) heures. Durée : vingt-quatre (24) heures. Base légale : consentement.",
      "Firebase SDK : traceur analytique fourni par Google LLC, utilisé pour l'analytique de la Plateforme, notamment les événements et la performance. Durée : quatre-vingt-dix (90) jours. Base légale : consentement.",
      "Les traceurs de personnalisation et de contenu tiers correspondent aux fonctionnalités fournies par des tiers qui peuvent déposer leurs propres traceurs. Ces traceurs relèvent de la politique de confidentialité des tiers concernés.",
      "Google Maps / Places API peut être utilisé pour l'affichage des cartes liées à la localisation des praticiens. Google peut déposer des cookies lors du chargement des cartes.",
      "Google My Business / Reviews peut être utilisé pour l'affichage des avis Google des praticiens via l'API Google My Business. Les données sont récupérées via API et ne déposent pas directement de cookies sur votre terminal.",
      "Stripe.js est utilisé pour le traitement sécurisé des paiements. Stripe dépose des cookies de sécurité et d'analyse de fraude.",
      "La base légale des traceurs de personnalisation et de contenu tiers est le consentement, sauf pour les composants fonctionnellement nécessaires au paiement.",
      "NID / CONSENT : cookies de personnalisation fournis par Google LLC, utilisés pour la personnalisation Google Maps. Durée : six (6) mois. Base légale : consentement.",
      "1P_JAR : cookie de personnalisation fourni par Google LLC, utilisé pour les préférences Google. Durée : un (1) mois. Base légale : consentement.",
      "La fonctionnalité de prise de rendez-vous de la Plateforme redirige vers les agendas en ligne des Praticiens, notamment Doctolib. Lors de cette redirection, Doctolib peut déposer ses propres traceurs relevant de sa politique de confidentialité. Esthetic Match n'a pas de contrôle sur ces traceurs tiers.",
      "L'ensemble des cookies déposés par Esthetic Match sont paramétrés avec les attributs de sécurité suivants : flag Secure, transmission uniquement via HTTPS, attribut SameSite, Strict ou Lax selon la criticité, et durées de vie proportionnées à leur finalité.",
      "Ces mesures protègent les Utilisateurs contre les attaques de type CSRF et les interceptions.",
    ],
  },
  {
    title: "Article 4 – Durée de conservation des traceurs",
    content: [
      "La durée de conservation des traceurs varie selon leur catégorie et leur finalité, telle qu'indiquée dans les tableaux de l'article 3.",
      "À l'expiration de leur durée de vie, les traceurs sont automatiquement supprimés du terminal de l'utilisateur.",
      "Les traceurs de session sont supprimés dès la fermeture du navigateur.",
      "Les traceurs persistants sont conservés pour la durée indiquée, sauf suppression manuelle préalable par l'utilisateur.",
      "La durée maximale de conservation des traceurs soumis à consentement est de treize (13) mois à compter du dépôt ou du dernier renouvellement du consentement, conformément aux meilleures pratiques en vigueur.",
      "Le consentement est recueilli à nouveau à l'expiration de ce délai.",
    ],
  },
  {
    title: "Article 5 – Gestion du consentement",
    content: [
      "Lors de votre première visite sur la Plateforme, une bannière de consentement vous est présentée. Elle vous informe de l'utilisation de traceurs et vous permet d'effectuer un choix éclairé.",
      "Vous pouvez accepter tous les traceurs via le bouton « Tout accepter ».",
      "Vous pouvez refuser tous les traceurs non essentiels via le bouton « Tout refuser » ou « Continuer sans accepter ».",
      "Vous pouvez également paramétrer vos préférences par catégorie via le bouton « Gérer mes préférences ».",
      "Aucun traceur non essentiel n'est déposé avant que vous ayez exprimé votre choix.",
      "Le simple défilement de la page ne vaut pas consentement.",
      "Vous pouvez modifier vos préférences à tout moment en accédant au Centre de préférences.",
      "Le Centre de préférences est accessible depuis le lien « Gestion des cookies » présent dans le pied de page de la Plateforme web, depuis la rubrique « Confidentialité et cookies » dans les paramètres de votre compte sur la Plateforme, ou depuis l'icône dédiée présente dans le coin inférieur droit de l'écran d'accueil.",
      "Le consentement exprimé est valable pour une durée maximale de treize (13) mois à compter de la date de son recueil.",
      "À l'expiration de cette période, le mécanisme de recueil du consentement est à nouveau présenté à l'utilisateur.",
      "Le consentement peut être retiré à tout moment, sans préjudice de la licéité du traitement fondé sur le consentement avant son retrait.",
      "Le retrait du consentement entraîne la désactivation immédiate des traceurs concernés et, dans la mesure du possible, la suppression des données collectées depuis le dernier consentement.",
    ],
  },
  {
    title: "Article 6 – Paramétrage via le navigateur ou le système d'exploitation",
    content: [
      "Indépendamment de nos outils de gestion, vous pouvez paramétrer votre navigateur web pour refuser, supprimer ou être averti lors du dépôt de cookies.",
      "Sur Google Chrome, les paramètres sont accessibles depuis : Paramètres → Confidentialité et sécurité → Cookies et autres données de site.",
      "Sur Mozilla Firefox, les paramètres sont accessibles depuis : Options → Vie privée et sécurité → Cookies et données de site.",
      "Sur Apple Safari, les paramètres sont accessibles depuis : Préférences → Confidentialité.",
      "Sur Microsoft Edge, les paramètres sont accessibles depuis : Paramètres → Cookies et autorisations de site.",
      "Sur Opera, les paramètres sont accessibles depuis : Paramètres → Avancé → Confidentialité et sécurité → Paramètres des sites.",
      "Attention : la désactivation de tous les cookies via le navigateur peut altérer le fonctionnement de la Plateforme, certaines fonctionnalités essentielles dépendant de cookies de session.",
      "Les utilisateurs peuvent également contrôler les cookies via les paramètres de confidentialité de leur navigateur web, notamment Chrome, Firefox, Safari et Edge.",
      "Les utilisateurs peuvent aussi utiliser les outils d'opt-out de Google Analytics disponibles sur tools.google.com/dlpage/gaoptout.",
    ],
  },
  {
    title: "Article 7 – Traceurs tiers et liens externes",
    content: [
      "La Plateforme peut contenir des liens vers des sites web tiers ou intégrer des contenus provenant de prestataires externes.",
      "Esthetic Match n'exerce aucun contrôle sur les pratiques de ces tiers en matière de traceurs et décline toute responsabilité à cet égard.",
      "Nous vous encourageons à consulter les politiques de confidentialité et de cookies des tiers dont les services sont intégrés à la Plateforme.",
      "Google LLC fournit notamment Analytics 4, Maps, My Business et Firebase. Sa politique de confidentialité est disponible sur policies.google.com/privacy.",
      "Stripe Inc. fournit les services de traitement des paiements. Sa politique de confidentialité est disponible sur stripe.com/fr/privacy.",
      "Doctolib peut intervenir dans le cadre de la prise de rendez-vous par redirection externe. Sa politique de confidentialité est disponible sur https://www.doctolib.fr/confidentialite.",
    ],
  },
  {
    title: "Article 8 – Données collectées via les traceurs",
    content: [
      "Selon les catégories de traceurs activés, plusieurs types de données peuvent être collectés.",
      "Les données d'identification du terminal peuvent inclure l'adresse IP, pseudonymisée pour les finalités analytiques, ainsi que l'identifiant du navigateur.",
      "Les données de navigation peuvent inclure les pages consultées, la durée des sessions, les clics et interactions, les parcours de navigation et les termes recherchés.",
      "Les données techniques peuvent inclure le type et la version du navigateur ou de l'application, le système d'exploitation, la résolution d'écran et la langue du terminal.",
      "Les données de performance peuvent inclure les temps de chargement des pages, les erreurs techniques et les événements d'application Firebase.",
      "Les données de transaction peuvent inclure l'identifiant de session de paiement Stripe et le statut de la transaction.",
      "Les données collectées via les traceurs analytiques sont pseudonymisées avant traitement et ne sont pas utilisées pour identifier personnellement les utilisateurs.",
      "Elles sont traitées conformément à notre Politique de Confidentialité.",
    ],
  },
  {
    title: "Article 9 – Transferts internationaux de données",
    content: [
      "L'utilisation de certains traceurs tiers, notamment Google Analytics et Firebase exploités par Google LLC, implique des transferts de données vers des pays situés en dehors de l'Espace économique européen (EEE) et de la juridiction de l'utilisateur.",
      "Ces transferts sont encadrés par des garanties appropriées.",
      "Ces garanties peuvent notamment inclure les Clauses contractuelles types (CCT) adoptées par la Commission européenne ou des garanties équivalentes reconnues par les autorités compétentes.",
      "Elles peuvent également inclure les certifications ou codes de conduite applicables dans les pays de destination, ainsi que les décisions d'adéquation éventuellement applicables.",
      "Vous pouvez obtenir des informations complémentaires sur ces garanties en contactant notre Délégué à la Protection des Données à l'adresse dpo@estheticmatch.com ou en consultant les pages dédiées sur les sites des fournisseurs tiers concernés.",
    ],
  },
  {
    title: "Article 10 – Vos droits",
    content: [
      "Dans la mesure prévue par les lois et réglementations applicables dans votre juridiction, vous disposez de plusieurs droits en lien avec les données collectées via les traceurs.",
      "Vous disposez d'un droit de retrait du consentement. Vous pouvez retirer votre consentement à tout moment via le Centre de préférences, sans que cela n'affecte la licéité du traitement antérieur à ce retrait.",
      "Vous disposez d'un droit d'accès. Vous pouvez demander confirmation de l'existence d'un traitement de données vous concernant et en obtenir une copie.",
      "Vous disposez d'un droit de suppression. Vous pouvez demander la suppression des données collectées vous concernant, dans les limites prévues par la réglementation applicable.",
      "Vous disposez d'un droit d'opposition. Vous pouvez vous opposer au traitement de vos données à des fins analytiques ou de personnalisation.",
      "Vous disposez également d'un droit d'information sur le profilage. Esthetic Match n'effectue pas de décision entièrement automatisée au sens de l'article 22 du RGPD.",
      "Les données de navigation collectées via traceurs analytiques sont utilisées uniquement pour améliorer la Plateforme et ne produisent aucune décision ayant un effet juridique ou significatif sur l'Utilisateur.",
      "L'Utilisateur conserve néanmoins le droit de s'opposer à toute utilisation de ses données à des fins de profilage en contactant dpo@estheticmatch.com.",
      "Pour exercer vos droits, vous pouvez utiliser le Centre de préférences accessible depuis la Plateforme pour les actions immédiates.",
      "Vous pouvez également adresser votre demande par e-mail à dpo@estheticmatch.com.",
      "Vous pouvez aussi utiliser les outils de désinscription proposés par Google Analytics disponibles sur tools.google.com/dlpage/gaoptout.",
      "Vous disposez également du droit d'introduire une réclamation auprès de l'autorité de contrôle compétente dans votre juridiction.",
    ],
  },
  {
    title: "Article 11 – Responsable du traitement et contact",
    content: [
      "Le responsable du traitement est Esthetic Match OÜ.",
      "Siège social : Harju maakond, Tallinn, Lasnamäe linnaosa, Paepargi tn 47-11, 11417 Estonie.",
      "Contact : contact@estheticmatch.com.",
      "Délégué à la Protection des Données (DPO) : dpo@estheticmatch.com.",
      "Pour toute question relative à la présente Politique ou à l'exercice de vos droits en matière de traceurs, vous pouvez contacter notre Délégué à la Protection des Données aux coordonnées ci-dessus.",
    ],
  },
  {
    title: "Article 12 – Mise à jour de la présente Politique",
    content: [
      "Esthetic Match se réserve le droit de modifier la présente Politique à tout moment, notamment pour tenir compte de l'évolution des technologies, des pratiques du secteur ou des exigences réglementaires.",
      "En cas de modification substantielle, une notification vous sera adressée par e-mail ou via un message sur la Plateforme, au moins trente (30) jours avant l'entrée en vigueur des nouvelles dispositions.",
      "Les modifications mineures, notamment les corrections typographiques ou les mises à jour de noms de prestataires sans changement de finalité, prennent effet dès leur publication.",
      "Les modifications de la présente Politique sont notifiées aux utilisateurs par bannière d'information sur la Plateforme avec un préavis de trente (30) jours.",
      "Pour les cookies non essentiels reposant sur le consentement, un nouveau recueil de consentement est effectué si les modifications sont substantielles.",
      "La présente Politique a été mise à jour pour la dernière fois en juin 2026.",
    ],
  },
];


export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F7] px-4 py-10 text-[#283C5D] sm:px-6 lg:px-8">
      <article className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#283C5D]/10 bg-white shadow-sm">
        <header className="border-b border-[#283C5D]/10 bg-gradient-to-br from-white via-[#FAF9F7] to-[#f4e4c6]/40 px-6 py-10 sm:px-10 lg:px-14">
          <p className="mb-4 inline-flex rounded-full border border-[#283C5D]/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#283C5D]/70">
            Version 2.0 – Juin 2026
          </p>
            
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Politique de Cookies
          </h1>
            
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#283C5D]/70">
            Applicable à l&apos;utilisation des cookies et technologies similaires sur la
            Plateforme Esthetic Match.
          </p>
        </header>

        <div className="space-y-10 px-6 py-10 sm:px-10 lg:px-14">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-3xl border border-[#283C5D]/10 bg-[#FAF9F7]/50 p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold tracking-tight text-[#283C5D]">
                {section.title}
              </h2>

              <div className="mt-5 space-y-4">
                {section.content.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-7 text-[#283C5D]/75 sm:text-base sm:leading-8"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
              <Script
          id="CookieDeclaration"
          src="https://consent.cookiebot.com/1f821395-7c93-4bc1-a077-36d1d1ef9aa9/cd.js"
          strategy="lazyOnload"
          />
    </main>
  );
}