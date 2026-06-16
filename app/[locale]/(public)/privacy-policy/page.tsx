import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | Esthetic Match",
  description:
    "Politique de confidentialité applicable aux utilisateurs de la Plateforme Esthetic Match.",
};

const sections = [
  {
    title: "Introduction",
    content: [
      "Esthetic Match OÜ (ci-après « Esthetic Match » ou « la Société »), dont le siège social est situé en Estonie, est la société éditrice de la plateforme numérique de mise en relation entre patients et praticiens en médecine esthétique (ci-après « la Plateforme »).",
      "La présente Politique de Confidentialité (ci-après « la Politique ») a pour objet d'informer l'ensemble des utilisateurs de la Plateforme — patients et praticiens — sur la nature des données personnelles collectées, les finalités et bases juridiques de leur traitement, les destinataires, les durées de conservation, les transferts internationaux éventuels, et les droits dont ils disposent.",
      "Esthetic Match s'engage à traiter les données personnelles dans le strict respect des lois et réglementations applicables en matière de protection des données dans la juridiction de chaque utilisateur, et en particulier des principes de licéité, loyauté, transparence, minimisation, exactitude, limitation de la conservation, intégrité et confidentialité.",
    ],
  },
  {
    title: "Article 1 – Définitions",
    content: [
      "Pour l'application de la présente Politique, les termes suivants ont la signification ci-après :",
      "« Données personnelles » : toute information se rapportant à une personne physique identifiée ou identifiable, directement ou indirectement.",
      "« Données de santé » : données à caractère personnel relatives à la santé physique ou mentale d'une personne, y compris les informations relatives aux actes et traitements médicaux. Les données de santé font l'objet d'un régime de protection renforcée au regard de leur caractère sensible.",
      "« Traitement » : toute opération ou ensemble d'opérations appliquées à des données personnelles, notamment la collecte, l'enregistrement, l'organisation, la structuration, la conservation, l'adaptation, l'extraction, la consultation, l'utilisation, la communication, la diffusion, l'effacement ou la destruction.",
      "« Responsable de traitement » : la personne physique ou morale qui détermine les finalités et les moyens du traitement des données personnelles. Pour les traitements décrits dans la présente Politique, Esthetic Match OÜ est responsable de traitement.",
      "« Sous-traitant » : la personne physique ou morale qui traite des données personnelles pour le compte et sur instruction du responsable de traitement.",
      "« Responsables conjoints » : deux responsables de traitement ou plus qui déterminent conjointement les finalités et les moyens du traitement. Esthetic Match et les Praticiens agissent en cette qualité pour certains traitements relatifs aux échanges de Pré-consultation en ligne.",
      "« Utilisateur » : toute personne physique accédant à la Plateforme, qu'il s'agisse d'un patient ou d'un praticien.",
      "« Plateforme » : la web-application Esthetic Match accessible via navigateur, ainsi que l'ensemble des services associés.",
    ],
  },
  {
    title: "Article 2 – Identité et coordonnées du responsable de traitement",
    content: [
      "Le responsable de traitement des données personnelles collectées sur la Plateforme est Esthetic Match OÜ, société à responsabilité limitée de droit estonien (Osaühing).",
      "Numéro d'immatriculation : [à compléter par Esthetic Match OÜ — registre estonien des entreprises (Äriregister)].",
      "Siège social : Harju maakond, Tallinn, Lasnamäe linnaosa, Paepargi tn 47-11, 11417 Estonie.",
      "Délégué à la Protection des Données (DPO) : dpo@estheticmatch.com.",
      "Un Délégué à la Protection des Données (DPO) a été désigné en raison du traitement à grande échelle de données constituant des données de santé au sens de l'article 9 du RGPD, qui font à ce titre l'objet de mesures de protection renforcées. Le DPO est l'interlocuteur privilégié des utilisateurs pour toute question relative à la protection de leurs données personnelles.",
    ],
  },
  {
    title: "Article 3 – Données collectées et finalités de traitement",
    content: [
      "Lors de la création de compte, Esthetic Match collecte les données suivantes : nom, prénom, adresse e-mail, numéro de téléphone, date de naissance aux fins de vérification de la majorité, pays de résidence ou d'exercice, mot de passe stocké sous forme hachée, et photographie de profil facultative.",
      "La base juridique de ce traitement est l'exécution du contrat, notamment les CGU, Conditions Générales d'Abonnement (CGA) ou Contrat Signable Praticien. Pour la vérification de la majorité, la base juridique peut être l'obligation légale ou l'intérêt légitime d'Esthetic Match.",
      "En complément des données de compte, les praticiens fournissent lors de leur inscription une copie de pièce d'identité, leurs diplômes et justificatifs de qualification professionnelle, leur numéro d'inscription à l'ordre professionnel compétent ou équivalent, une attestation d'assurance responsabilité civile professionnelle, ainsi qu'un relevé d'identité bancaire (RIB/IBAN) aux fins de versement des rémunérations.",
      "La base juridique du traitement des données d'inscription des praticiens est l'exécution du contrat, notamment les Conditions Générales d'Abonnement (CGA) ou le Contrat Signable Praticien, ainsi que l'obligation légale relative à la vérification des qualifications.",
      "Dans le cadre de la fonctionnalité « Pré-consultation en ligne », Esthetic Match collecte et traite le contenu de la question posée par le patient, les photographies soumises à l'appui de sa question, la réponse fournie par le praticien, ainsi que l'horodatage de l'envoi de la question et de la réponse.",
      "Ces données constituent des données de santé au sens de l'article 9 du RGPD et font à ce titre l'objet de mesures de protection renforcées.",
      "La base juridique de ce traitement est le consentement explicite de l'utilisateur, au sens de l'article 9(2)(a) du RGPD, recueilli préalablement à l'envoi de la question de manière spécifique, informée et univoque.",
      "Ces données sont conservées pendant cinq (5) ans à compter de la date de l'échange, conformément aux délais de prescription applicables en matière de responsabilité civile médicale.",
      "Le prix de chaque Pré-consultation est fixé librement par le Praticien. Esthetic Match traite les données de paiement pour percevoir les Frais de Service Plateforme facturés aux Patients en sus du prix du Praticien, et pour reverser aux Praticiens les montants qui leur sont dus.",
      "Les transactions financières relatives aux Pré-consultations sont traitées par Stripe, prestataire de services de paiement. Esthetic Match ne collecte ni ne stocke de données bancaires ou de carte de paiement. Stripe collecte et traite ces données sous sa propre responsabilité. Esthetic Match reçoit uniquement une confirmation de paiement et un identifiant de transaction.",
      "Les données de paiement de l'abonnement Premium sont également traitées par Stripe aux fins de gestion de l'abonnement et du renouvellement automatique. La base juridique de ces traitements est l'exécution du contrat.",
      "Les avis publiés sur les profils praticiens proviennent de deux sources : les avis déposés directement sur la Plateforme par des patients vérifiés, comprenant le nom d'utilisateur, la note, le commentaire et la date de publication ; et les avis publics Google, affichés via l'API Google My Business, qui relèvent de la politique de confidentialité de Google.",
      "La base juridique du traitement des avis est l'intérêt légitime d'Esthetic Match pour la transparence et l'aide à la décision des patients, ainsi que le consentement pour les avis natifs.",
      "Lors de l'utilisation de la Plateforme, des données techniques sont collectées automatiquement, notamment l'adresse IP, le type et la version du navigateur ou de l'application, le système d'exploitation, les pages consultées, la durée des sessions, les actions réalisées sur la Plateforme, ainsi que les données de cookies et traceurs selon les choix de l'utilisateur.",
      "La base juridique du traitement des données de navigation est l'intérêt légitime d'Esthetic Match pour la sécurité et l'amélioration de la Plateforme, ainsi que le consentement pour les cookies non essentiels.",
      "Les journaux de connexion, comprenant notamment l'adresse IP, le user-agent, le timestamp et les actions effectuées, sont conservés à des fins de sécurité et de détection de fraude pendant une durée de quatre-vingt-dix (90) jours pour les logs courants et de douze (12) mois pour les logs liés à des incidents de sécurité identifiés.",
      "Les échanges avec le service client, notamment par e-mail ou formulaire de contact, sont conservés aux fins de traitement des demandes et d'amélioration de la qualité du service. La base juridique est l'intérêt légitime d'Esthetic Match et l'exécution du contrat.",
    ],
  },
  {
    title: "Article 4 – Données de santé – Régime de protection renforcée",
    content: [
      "Les informations, photographies et descriptions médicales communiquées par les patients dans le cadre de la fonctionnalité « Pré-consultation en ligne » constituent des données de santé au sens de l'article 9 du RGPD et font à ce titre l'objet de mesures de protection renforcées.",
      "Ces mesures comprennent notamment le chiffrement des données en transit (TLS) et au repos (AES-256), l'accès strictement limité au patient concerné et au praticien destinataire de la question, l'hébergement sur des infrastructures certifiées ou conformes aux exigences applicables en matière de données de santé dans les juridictions concernées, la journalisation des accès aux données de santé, ainsi qu'une durée de conservation limitée au strict nécessaire.",
      "Le consentement du patient au traitement de ces données de santé est recueilli de manière explicite, distincte et informée, préalablement à l'envoi de toute question comportant des informations médicales dans le cadre d'une Pré-consultation en ligne.",
      "Ce consentement peut être retiré à tout moment, sans que cela affecte la licéité des traitements effectués antérieurement.",
    ],
  },
  {
    title: "Article 5 – Destinataires des données",
    content: [
      "Seuls les membres de l'équipe Esthetic Match ayant besoin d'accéder aux données dans le cadre de leurs fonctions y ont accès, dans le strict respect du principe du besoin d'en connaître.",
      "Dans le cadre de la fonctionnalité « Pré-consultation en ligne », le praticien sélectionné par le patient accède aux données communiquées dans la question, notamment le texte et les photographies. Le praticien agit en qualité de responsable conjoint du traitement pour ces données, dans les conditions définies à l'Article 7 et dans l'Accord de Traitement des Données (DPA).",
      "Esthetic Match fait appel à Google Cloud Platform (GCP) pour l'hébergement des données et des infrastructures techniques. Les données sont hébergées dans des régions géographiques sélectionnées pour garantir la conformité aux exigences locales applicables.",
      "Esthetic Match fait appel à Stripe Inc. pour le traitement des paiements. Stripe est soumis à ses propres obligations réglementaires en matière de sécurité des paiements.",
      "Esthetic Match fait appel à Google LLC, notamment via l'API Google My Business, pour l'affichage des avis Google sur les profils praticiens.",
      "Ces sous-traitants traitent les données personnelles exclusivement sur instruction d'Esthetic Match et sont soumis à des obligations contractuelles garantissant un niveau de protection adéquat.",
      "Esthetic Match peut être amené à communiquer des données personnelles à des autorités compétentes, notamment judiciaires, administratives ou fiscales, lorsque la loi l'exige ou l'autorise, ou dans le cadre d'une procédure judiciaire.",
    ],
  },
  {
    title: "Article 6 – Transferts internationaux de données",
    content: [
      "Certains des sous-traitants d'Esthetic Match sont établis ou opèrent des infrastructures en dehors de l'Espace Économique Européen (EEE) ou de toute autre juridiction dont la législation locale garantirait un niveau de protection équivalent.",
      "Dans ce cas, Esthetic Match s'assure que tout transfert de données personnelles vers un pays tiers est encadré par l'un des mécanismes de garanties appropriés reconnus par les réglementations applicables.",
      "Ces mécanismes peuvent notamment inclure une décision d'adéquation de l'autorité compétente reconnaissant un niveau de protection suffisant dans le pays destinataire, des clauses contractuelles types (CCT) approuvées par les autorités compétentes, des règles d'entreprise contraignantes (Binding Corporate Rules), ou tout autre mécanisme reconnu comme offrant des garanties appropriées par les réglementations applicables.",
      "Esthetic Match conduit, préalablement à la mise en production, une Analyse d'Impact sur les Transferts (Transfer Impact Assessment — TIA) pour chaque prestataire établi hors de l'Espace Économique Européen, notamment Google Cloud Platform et Stripe Inc.",
      "Une synthèse des résultats de ces analyses peut être obtenue sur demande motivée adressée au Délégué à la Protection des Données à l'adresse dpo@estheticmatch.com, sous réserve des obligations de confidentialité applicables.",
      "L'utilisateur peut obtenir des informations sur les mécanismes de transfert en vigueur en contactant le DPO à l'adresse : dpo@estheticmatch.com.",
    ],
  },
  {
    title: "Article 7 – Coresponsabilité de traitement – Praticiens",
    content: [
      "Pour les traitements de données relatifs aux échanges de Pré-consultation en ligne, Esthetic Match et le praticien destinataire de la question agissent en qualité de responsables conjoints de traitement, dans la mesure où ils déterminent conjointement les finalités et les moyens de ces traitements.",
      "Les modalités de cette coresponsabilité — notamment la répartition des obligations respectives en matière d'information des personnes, de gestion des droits et de sécurité — sont définies dans l'Accord de Traitement des Données (DPA) conclu entre Esthetic Match et chaque praticien.",
      "Quel que soit le partage des responsabilités entre les parties, les utilisateurs peuvent exercer l'ensemble de leurs droits aussi bien auprès d'Esthetic Match que directement auprès du praticien concerné.",
    ],
  },
  {
    title: "Article 8 – Durées de conservation",
    content: [
      "Esthetic Match conserve les données personnelles pour la durée strictement nécessaire à l'accomplissement des finalités pour lesquelles elles ont été collectées, dans le respect des obligations légales applicables.",
      "Les données de compte des patients et praticiens sont conservées pendant la durée de la relation contractuelle, augmentée d'un délai de trois (3) ans à des fins de gestion des litiges éventuels, sauf obligation légale imposant une durée plus longue.",
      "Les données relatives aux échanges de Pré-consultation en ligne, notamment les questions, réponses et photographies, sont conservées pendant cinq (5) ans à compter de la date de l'échange, conformément aux délais de prescription applicables en matière de responsabilité civile médicale.",
      "Les données de paiement, limitées aux identifiants de transaction, sont conservées pendant dix (10) ans à compter de la transaction, conformément aux obligations légales comptables et fiscales applicables.",
      "Les données de navigation et journaux techniques sont conservés pendant douze (12) mois à compter de leur collecte.",
      "Les données du service client sont conservées pendant trois (3) ans à compter de la clôture de la demande.",
      "Les documents d'identification des praticiens, notamment les copies de diplômes et pièces d'identité, sont conservés pendant la durée du Contrat augmentée de trois (3) ans.",
      "À l'expiration de ces délais, les données sont supprimées de manière sécurisée ou anonymisées de façon irréversible.",
    ],
  },
  {
    title: "Article 9 – Droits des personnes concernées",
    content: [
      "Conformément aux réglementations applicables en matière de protection des données, les utilisateurs disposent de plusieurs droits sur leurs données personnelles.",
      "Le droit d'accès permet d'obtenir confirmation que des données concernant l'utilisateur sont traitées et d'en recevoir une copie.",
      "Le droit de rectification permet d'obtenir la correction de données inexactes ou incomplètes.",
      "Le droit à l'effacement, également appelé « droit à l'oubli », permet d'obtenir la suppression des données dans les conditions prévues par les réglementations applicables.",
      "Le droit à la limitation du traitement permet d'obtenir la suspension temporaire du traitement dans certaines circonstances.",
      "Le droit à la portabilité permet de recevoir les données fournies dans un format structuré, couramment utilisé et lisible par machine, et de les transmettre à un autre responsable de traitement.",
      "Le droit d'opposition permet de s'opposer au traitement des données fondé sur l'intérêt légitime du responsable de traitement, ou au traitement à des fins de prospection commerciale.",
      "Le droit de retrait du consentement permet de retirer à tout moment le consentement donné, sans que cela affecte la licéité des traitements effectués antérieurement.",
      "Le droit de définir des directives post-mortem permet, le cas échéant selon les lois applicables, de définir des instructions relatives au sort des données après le décès de l'utilisateur.",
      "Pour exercer ses droits, l'utilisateur peut adresser sa demande par e-mail à dpo@estheticmatch.com ou par courrier postal à Esthetic Match OÜ, Harju maakond, Tallinn, Lasnamäe linnaosa, Paepargi tn 47-11, 11417 Estonie.",
      "La demande doit permettre d'identifier le demandeur. Esthetic Match peut demander une pièce d'identité en cas de doute raisonnable sur l'identité du demandeur.",
      "La réponse est adressée dans un délai d'un (1) mois à compter de la réception de la demande complète, délai pouvant être prolongé de deux (2) mois supplémentaires en cas de complexité ou de volume important de demandes, avec information préalable du demandeur.",
      "L'utilisateur a le droit d'introduire une réclamation auprès d'une autorité de contrôle compétente. L'autorité chef de file pour les traitements effectués par Esthetic Match OÜ est l'Andmekaitse Inspektsioon (AKI — Autorité estonienne de protection des données), accessible à l'adresse www.aki.ee.",
      "Les résidents d'autres États membres de l'Union européenne peuvent également saisir l'autorité de protection des données de leur État de résidence.",
    ],
  },
  {
    title: "Article 10 – Sécurité des données",
    content: [
      "Esthetic Match met en œuvre des mesures techniques et organisationnelles appropriées pour protéger les données personnelles contre tout accès non autorisé, altération, divulgation, perte ou destruction accidentelle ou illicite.",
      "Ces mesures comprennent notamment le chiffrement des données en transit via des protocoles sécurisés (TLS/HTTPS), le chiffrement des données au repos (AES-256), des contrôles d'accès stricts basés sur le principe du besoin d'en connaître, l'authentification renforcée des accès aux systèmes internes, la journalisation et la surveillance des accès aux données sensibles, des plans de continuité d'activité et de reprise après sinistre, ainsi que des évaluations régulières de la sécurité des systèmes.",
      "En cas de violation de données personnelles susceptible d'engendrer un risque pour les droits et libertés des personnes concernées, Esthetic Match s'engage à notifier l'incident à l'autorité de contrôle compétente dans les délais prévus par les réglementations applicables, et à informer les personnes concernées lorsque le risque est élevé.",
    ],
  },
  {
    title: "Article 11 – Cookies et technologies de suivi",
    content: [
      "La Plateforme utilise des cookies et technologies similaires. L'utilisation de ces technologies, les catégories de cookies déposés et les modalités de gestion du consentement sont décrites dans la Politique de Cookies, disponible sur la Plateforme et accessible à tout moment depuis les paramètres du compte.",
      "Les cookies strictement nécessaires au fonctionnement de la Plateforme, notamment pour l'authentification, la sécurité et les préférences de langue, sont déposés sans consentement préalable.",
      "Tous les autres cookies, notamment analytiques ou de personnalisation, sont soumis au consentement préalable de l'utilisateur.",
    ],
  },
  {
    title: "Article 12 – Données des mineurs",
    content: [
      "La Plateforme est exclusivement destinée aux personnes majeures. Esthetic Match collecte la date de naissance des utilisateurs lors de la création de compte aux fins de vérification de la majorité.",
      "Si Esthetic Match constate qu'un mineur a fourni des données personnelles, ces données sont supprimées sans délai et le compte résilié.",
      "Les parents ou représentants légaux qui constatent qu'un mineur a utilisé la Plateforme sont invités à en informer Esthetic Match à l'adresse : dpo@estheticmatch.com.",
    ],
  },
  {
    title: "Article 13 – Liens vers des services tiers",
    content: [
      "La Plateforme peut rediriger vers des services tiers, notamment Doctolib pour la prise de rendez-vous, Stripe pour les paiements, ou Google pour les avis.",
      "Ces services sont soumis à leurs propres politiques de confidentialité, sur lesquelles Esthetic Match n'a aucun contrôle.",
      "Esthetic Match recommande aux utilisateurs de consulter les politiques de confidentialité de ces services avant de les utiliser.",
    ],
  },
  {
    title: "Article 14 – Modification de la Politique de Confidentialité",
    content: [
      "La présente Politique peut être modifiée à tout moment, notamment pour se conformer à des évolutions légales ou réglementaires, à des décisions de justice ou autorités de contrôle, ou pour intégrer de nouvelles fonctionnalités de la Plateforme.",
      "En cas de modification substantielle de la présente Politique — notamment une modification des finalités de traitement, des catégories de données collectées, ou des sous-traitants impliqués — les utilisateurs en sont informés par e-mail avec un préavis de trente (30) jours.",
      "Pour les traitements reposant sur le consentement, notamment les données de santé et les cookies non essentiels, les utilisateurs sont invités à confirmer leur consentement.",
      "L'absence de réponse dans ce délai vaut maintien des traitements dans leurs conditions antérieures, sans préjudice du droit de retrait du consentement à tout moment.",
      "La version en vigueur est celle disponible sur la Plateforme à la date de consultation. La date de dernière mise à jour figure en en-tête du document.",
    ],
  },
  {
    title: "Article 15 – Contact",
    content: [
      "Pour toute question relative à la présente Politique ou au traitement de vos données personnelles, l'utilisateur peut contacter le Délégué à la Protection des Données (DPO) à l'adresse suivante : dpo@estheticmatch.com.",
      "Adresse postale : Esthetic Match OÜ, Harju maakond, Tallinn, Lasnamäe linnaosa, Paepargi tn 47-11, 11417 Estonie.",
    ],
  },
  {
    title: "Annexe – Registre simplifié des activités de traitement",
    content: [
      "Création et gestion de compte : données d'identité, e-mail, téléphone, pays et mot de passe haché. Base juridique : exécution du contrat. Destinataires : Esthetic Match en interne. Durée de conservation : trois (3) ans après clôture du compte.",
      "Vérification des praticiens : diplômes, pièce d'identité, attestation RCP et IBAN. Base juridique : exécution du contrat et obligation légale. Destinataires : Esthetic Match en interne. Durée de conservation : durée du contrat augmentée de trois (3) ans.",
      "Pré-consultation en ligne : questions, photographies et réponses, pouvant constituer des données de santé. Base juridique : consentement explicite. Destinataires : praticien destinataire et Esthetic Match en interne. Durée de conservation : cinq (5) ans après l'échange.",
      "Traitement des paiements, incluant les Pré-consultations et abonnements : identifiant de transaction Stripe, sans collecte ni stockage de données bancaires par Esthetic Match. Base juridique : exécution du contrat. Destinataire : Stripe, sous-traitant. Durée de conservation : dix (10) ans.",
      "Affichage des avis : avis natifs comprenant pseudo, note et commentaire, ainsi que les avis Google publics. Base juridique : intérêt légitime ou consentement. Destinataires : utilisateurs de la Plateforme et Google LLC. Durée de conservation : trois (3) ans pour les avis natifs.",
      "Navigation et sécurité : adresse IP, logs et comportement de navigation. Base juridique : intérêt légitime. Destinataires : Esthetic Match en interne et GCP. Durée de conservation : douze (12) mois.",
      "Service client : contenu des échanges avec le support. Base juridique : exécution du contrat et intérêt légitime. Destinataires : Esthetic Match en interne. Durée de conservation : trois (3) ans.",
      "Cookies analytiques avec consentement : données de navigation agrégées, notamment Google Analytics et Firebase. Base juridique : consentement. Destinataire : Google LLC. Durée de conservation : deux (2) ans.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F7] px-4 py-10 text-[#283C5D] sm:px-6 lg:px-8">
      <article className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#283C5D]/10 bg-white shadow-sm">
        <header className="border-b border-[#283C5D]/10 bg-gradient-to-br from-white via-[#FAF9F7] to-[#f4e4c6]/40 px-6 py-10 sm:px-10 lg:px-14">
          <p className="mb-4 inline-flex rounded-full border border-[#283C5D]/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#283C5D]/70">
            Version 2.0 – Juin 2026
          </p>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Politique de Confidentialité
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#283C5D]/70">
            Applicable à l&apos;ensemble des utilisateurs de la Plateforme Esthetic Match.
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
    </main>
  );
}